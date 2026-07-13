import { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search, Camera, Upload, Trash2, ScanLine } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import QrScanner from '../../components/QrScanner';
import WebcamCapture from '../../components/WebcamCapture';
import { useActiveSport } from '../../context/SportContext';
import type { ItemCategory, Sport, InventoryItem } from '../../data/types';

const ALL_CATEGORIES: ItemCategory[] = ['Top', 'Bottom', 'Outerwear', 'Footwear', 'Headwear', 'Equipment', 'Bag', 'Accessory'];
const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];
const YEARS = ['2024-25', '2025-26', '2026-27', '2027-28'];

type ViewMode = 'summary' | 'detail' | 'serial' | 'archived';

export default function InventoryList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const isManager = user?.role === 'manager';
  const { activeSport: sportFilter, setActiveSport: setSportFilter } = useActiveSport();
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'All Categories'>('All Categories');
  const [yearFilter, setYearFilter] = useState<string>('All Years');
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [specialFilter, setSpecialFilter] = useState(searchParams.get('filter') ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showNewItem, setShowNewItem] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<ItemCategory | ''>('');
  const [newUnit, setNewUnit] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newManufacturer, setNewManufacturer] = useState<'Adidas' | 'Other' | ''>('');
  const [newManufacturerOther, setNewManufacturerOther] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newQtyOnHand, setNewQtyOnHand] = useState('');
  const [newQtyOnOrder, setNewQtyOnOrder] = useState('');
  const [newSport, setNewSport] = useState<Sport | ''>('');
  const [newPrice, setNewPrice] = useState('');
  const { items: allItems, archivedIds, addItem, archiveItems, unarchiveItems } = useInventory();
  const [undoArchive, setUndoArchive] = useState<string[] | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        // Camera photos can be 10+ MP; downscale so the stored data URL stays small
        const img = new Image();
        img.onload = () => {
          const max = 1024;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          if (scale === 1) {
            setNewPhoto(src);
            return;
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          setNewPhoto(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => setNewPhoto(src);
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
    // allow picking/retaking the same file again
    e.target.value = '';
  }

  function resetNewItem() {
    setNewPhoto(null);
    setNewCategory('');
    setNewUnit('');
    setNewDescription('');
    setNewManufacturer('');
    setNewManufacturerOther('');
    setNewModel('');
    setNewQtyOnHand('');
    setNewQtyOnOrder('');
    setNewSport('');
    setNewPrice('');
  }

  function nextItemId(): string {
    const maxNumeric = allItems.reduce((max, item) => {
      const n = parseInt(item.itemId, 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0);
    return String(maxNumeric + 1);
  }

  function handleAddItem() {
    const item: InventoryItem = {
      id: `local-${Date.now()}`,
      itemId: nextItemId(),
      description: newDescription || 'Untitled Item',
      category: (newCategory || 'Equipment') as ItemCategory,
      unit: newUnit || 'Each',
      year: '2026-27',
      manufacturer: newManufacturer === 'Other' ? newManufacturerOther : newManufacturer || 'Unknown',
      model: newModel,
      pricePerUnit: parseFloat(newPrice) || 0,
      photoUrl: newPhoto ?? undefined,
      sports: newSport ? [newSport as Sport] : [],
      isNonExpendable: false,
      isSerialized: false,
      qtyOnHand: parseInt(newQtyOnHand) || 0,
      qtyOnOrder: parseInt(newQtyOnOrder) || 0,
    };
    addItem(item);
    setShowNewItem(false);
    resetNewItem();
  }

  function toggleSelected(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const scopedItems = useMemo(() => filterBySports(allItems, (i) => i.sports), [allItems, filterBySports]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedItems.filter((item) => {
      if (archivedIds.has(item.id)) return false;
      const matchSport = sportFilter === 'All Sports' || item.sports.includes(sportFilter as Sport);
      const matchCat = categoryFilter === 'All Categories' || item.category === categoryFilter;
      const matchYear = yearFilter === 'All Years' || item.year === yearFilter;
      const matchSearch = !q || item.description.toLowerCase().includes(q) || item.itemId.toLowerCase().includes(q) || item.manufacturer.toLowerCase().includes(q);
      if (specialFilter === 'low') return matchSport && item.qtyOnHand < 3;
      if (specialFilter === 'overdue') return matchSport && item.isNonExpendable;
      return matchSport && matchCat && matchYear && matchSearch;
    });
  }, [sportFilter, categoryFilter, yearFilter, search, specialFilter, scopedItems, archivedIds]);

  const archivedItems = useMemo(() => {
    return scopedItems.filter((i) => archivedIds.has(i.id));
  }, [scopedItems, archivedIds]);

  const serialItems = filtered.filter((i) => i.isSerialized);

  return (
    <div>
      {/* Page title */}
      <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>Inventory</span>

      {/* Page sub-header / breadcrumb filters */}
      <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1.5 text-sm flex-wrap gap-y-1">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value as Sport | 'All Sports')}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="All Sports">{isLead ? 'All Sports' : 'All My Sports'}</option>
            {(isLead ? ALL_SPORTS : accessibleSports).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-gray-300">|</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | 'All Categories')}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="All Categories">All Categories</option>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-gray-300">|</span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="All Years">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {isManager && (
            <>
              <span className="text-gray-300">|</span>
              <button onClick={() => { resetNewItem(); setShowNewItem(true); }} className="text-[#002855] font-semibold text-sm border-none focus:outline-none cursor-pointer rounded-md py-[0.025in] px-[0.1in]" style={{ backgroundColor: '#FFD200' }}>
                + New Item
              </button>
            </>
          )}
          <span className="text-gray-300">|</span>
          <button
            onClick={() => { setScanMessage(''); setShowScanner(true); }}
            className="flex items-center gap-1.5 text-[#00539F] font-semibold text-sm rounded-md py-[0.025in] px-[0.1in] border border-[#00539F] hover:bg-[#EEF4FB]"
          >
            <ScanLine className="w-4 h-4" /> Scan
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="summary">Summary</option>
            <option value="detail">Detail</option>
            <option value="serial">Serial</option>
            <option value="archived">Archived</option>
          </select>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Item ID or Reference No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-9 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00539F] w-full sm:w-56 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Active special filter banner */}
      {specialFilter && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded bg-[#DAEAF5] border border-[#00539F]/20">
          <span className="text-xs text-[#00539F] font-medium">
            {specialFilter === 'low' && 'Showing: Low Inventory (qty on hand < 3)'}
            {specialFilter === 'overdue' && 'Showing: items that must be returned (overdue returns)'}
          </span>
          <button onClick={() => setSpecialFilter('')} className="text-xs text-[#00539F] hover:underline ml-4">Clear filter</button>
        </div>
      )}

      {/* Table / Cards container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-[0.1in]">
        {(viewMode === 'summary' || viewMode === 'detail') && (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-center text-gray-500">
                  <th className="p-[0.05in] font-bold w-8"></th>
                  <th className="p-[0.05in] font-bold w-10"></th>
                  <th className="p-[0.05in] font-bold">Item ID</th>
                  <th className="p-[0.05in] font-bold">Category</th>
                  <th className="p-[0.05in] font-bold">Unit</th>
                  <th className="p-[0.05in] font-bold">Year</th>
                  <th className="p-[0.05in] font-bold">Item Description</th>
                  <th className="p-[0.05in] font-bold">Manufacturer / Model</th>
                  {sportFilter === 'All Sports' && <th className="p-[0.05in] font-bold">Sport</th>}
                  <th className="p-[0.05in] font-bold">Qty On Hand</th>
                  <th className="p-[0.05in] font-bold">Qty On Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={sportFilter === 'All Sports' ? 11 : 10} className="px-4 py-8 text-center text-gray-400">No items found.</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/inventory/${item.id}`)}
                      className="hover:bg-[#EFF6FF] cursor-pointer transition-colors"
                    >
                      <td className="p-[0.05in] text-center" onClick={(e) => e.stopPropagation()}>
                        {isManager && <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.has(item.id)} onChange={() => {}} onClick={(e) => toggleSelected(item.id, e)} />}
                      </td>
                      <td className="p-[0.05in] text-center">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                          {item.photoUrl ? (
                            <img src={item.photoUrl} alt={item.description} className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-[0.05in] text-center font-mono text-gray-600">{item.itemId}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.category}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.unit}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.year}</td>
                      <td className="p-[0.05in] text-center">
                        <p className="font-bold text-gray-800">{item.description}</p>
                        {viewMode === 'detail' && (
                          <p className="text-gray-400 italic">Add notes</p>
                        )}
                      </td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.manufacturer} / {item.model}</td>
                      {sportFilter === 'All Sports' && (
                        <td className="p-[0.05in] text-center text-gray-600">{item.sports.join(' / ')}</td>
                      )}
                      <td className="p-[0.05in] text-center">
                        <span className={item.qtyOnHand < 3 ? 'text-red-600 font-semibold' : item.qtyOnHand < 10 ? 'text-amber-600 font-semibold' : 'text-gray-800 font-medium'}>
                          {item.qtyOnHand}
                        </span>
                      </td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.qtyOnOrder > 0 ? item.qtyOnOrder : 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-gray-400 text-sm">No items found.</p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="flex items-start gap-3 px-4 py-3 min-h-12 active:bg-[#EFF6FF] cursor-pointer text-left w-full"
                  >
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.description} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <Package className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-800 truncate">{item.description}</span>
                        <span className={`text-sm font-semibold shrink-0 ${item.qtyOnHand < 3 ? 'text-red-600' : item.qtyOnHand < 10 ? 'text-amber-600' : 'text-gray-800'}`}>
                          {item.qtyOnHand}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 font-mono">{item.itemId}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                        {sportFilter === 'All Sports' && item.sports.length > 0 && (
                          <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-500 truncate">{item.sports[0]}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.manufacturer}{item.model ? ` / ${item.model}` : ''}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {viewMode === 'serial' && (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-center text-gray-500">
                  <th className="p-[0.05in] font-bold">Item ID</th>
                  <th className="p-[0.05in] font-bold">Description</th>
                  <th className="p-[0.05in] font-bold">Serial Numbers</th>
                  <th className="p-[0.05in] font-bold">Return By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serialItems.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No serialized items in current filters.</td></tr>
                ) : (
                  serialItems.map((item) => (
                    <tr key={item.id} onClick={() => navigate(`/inventory/${item.id}`)} className="hover:bg-[#EFF6FF] cursor-pointer">
                      <td className="p-[0.05in] text-center font-mono text-gray-600">{item.itemId}</td>
                      <td className="p-[0.05in] text-center font-medium text-gray-800">{item.description}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.serialNumbers?.join(', ') ?? '—'}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.returnByDate ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {serialItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-gray-400 text-sm">No serialized items in current filters.</p>
              ) : (
                serialItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="flex items-start gap-3 px-4 py-3 min-h-12 active:bg-[#EFF6FF] cursor-pointer text-left w-full"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-800 truncate">{item.description}</span>
                        <span className="text-xs text-gray-500 shrink-0">{item.returnByDate ?? '—'}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{item.itemId}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{item.serialNumbers?.join(', ') ?? '—'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {viewMode === 'archived' && (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-center text-gray-500">
                  <th className="p-[0.05in] font-bold w-10"></th>
                  <th className="p-[0.05in] font-bold">Item ID</th>
                  <th className="p-[0.05in] font-bold">Category</th>
                  <th className="p-[0.05in] font-bold">Item Description</th>
                  <th className="p-[0.05in] font-bold">Manufacturer / Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {archivedItems.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No archived items.</td></tr>
                ) : (
                  archivedItems.map((item) => (
                    <tr key={item.id} className="opacity-60">
                      <td className="p-[0.05in] text-center">
                        {item.photoUrl ? (
                          <img src={item.photoUrl} alt={item.description} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="p-[0.05in] text-center font-mono text-gray-600">{item.itemId}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.category}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.description}</td>
                      <td className="p-[0.05in] text-center text-gray-600">{item.manufacturer} / {item.model}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {archivedItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-gray-400 text-sm">No archived items.</p>
              ) : (
                archivedItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-4 py-3 opacity-60">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.description} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <Package className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 font-mono">{item.itemId}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.manufacturer} / {item.model}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {viewMode === 'archived' ? `${archivedItems.length} archived item${archivedItems.length !== 1 ? 's' : ''}` : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Floating delete bar */}
      {isManager && selectedIds.size > 0 && viewMode !== 'archived' && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-xl px-[0.2in] py-[0.1in]">
          <span className="text-sm text-gray-600 font-medium">{selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <button
            onClick={() => {
              archiveItems(selectedIds);
              setUndoArchive([...selectedIds]);
              if (undoTimer.current) clearTimeout(undoTimer.current);
              undoTimer.current = setTimeout(() => setUndoArchive(null), 6000);
              setSelectedIds(new Set());
            }}
            className="text-sm font-semibold text-white rounded-lg py-[0.05in] px-[0.15in]"
            style={{ backgroundColor: '#dc2626' }}
          >
            Delete
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {/* QR scanner */}
      {showScanner && (
        <QrScanner
          onScan={(text) => {
            const id = text.startsWith('EQI:ITEM:') ? text.slice('EQI:ITEM:'.length) : text;
            const found = allItems.find((i) => i.id === id || i.itemId === id);
            setShowScanner(false);
            if (found) {
              navigate(`/inventory/${found.id}`);
            } else {
              setScanMessage('No inventory item matches that code.');
              setTimeout(() => setScanMessage(''), 4000);
            }
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
      {scanMessage && (
        <div className="fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 z-[95] bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-lg text-center">
          {scanMessage}
        </div>
      )}

      {/* Undo archive toast */}
      {undoArchive && (
        <div className="fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[95] bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 md:min-w-[320px]">
          <span className="flex-1">
            {undoArchive.length} item{undoArchive.length !== 1 ? 's' : ''} deleted
          </span>
          <button
            onClick={() => {
              unarchiveItems(undoArchive);
              if (undoTimer.current) clearTimeout(undoTimer.current);
              setUndoArchive(null);
            }}
            className="font-bold text-[#FFD200] shrink-0 px-2 py-1 -m-1 active:opacity-70"
          >
            Undo
          </button>
        </div>
      )}

      {/* Webcam photo booth (desktop Take Photo) */}
      {showWebcam && (
        <WebcamCapture onCapture={(dataUrl) => setNewPhoto(dataUrl)} onClose={() => setShowWebcam(false)} />
      )}

      {/* New Item modal */}
      {showNewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowNewItem(false)}>
          <div className="bg-white w-full h-full rounded-none md:w-[420px] md:h-auto md:max-h-[90vh] md:rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="relative flex items-center justify-center shrink-0 p-[0.1in]" style={{ backgroundColor: '#002855', paddingTop: 'calc(env(safe-area-inset-top) + 0.1in)' }}>
              <h2 className="text-sm font-semibold text-white">New Item</h2>
              <button onClick={() => setShowNewItem(false)} className="absolute text-white hover:opacity-70 right-[0.1in]">✕</button>
            </div>

            <div className="flex-1 overflow-y-scroll p-[0.15in]">

              {/* Photo upload */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Photo</label>

                {/* Desktop: webcam capture + file upload */}
                <div className="hidden md:block">
                  {newPhoto ? (
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <img src={newPhoto} alt="Item" className="w-full object-contain bg-gray-50" style={{ maxHeight: '140px' }} />
                      <div className="flex divide-x divide-gray-200 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowWebcam(true)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#00539F] hover:bg-gray-50"
                        >
                          <Camera className="w-4 h-4" />
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPhoto(null)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowWebcam(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 py-4 text-gray-500 hover:border-[#00539F] hover:text-[#00539F] transition-colors"
                      >
                        <Camera className="w-6 h-6" />
                        <span className="text-xs font-medium">Take Photo</span>
                      </button>
                      <label className="flex-1 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 py-4 text-gray-500 hover:border-[#00539F] hover:text-[#00539F] transition-colors cursor-pointer">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-medium">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  )}
                </div>

                {/* Mobile: camera capture + photo library */}
                <div className="md:hidden">
                  {newPhoto ? (
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <img src={newPhoto} alt="Item" className="w-full object-contain bg-gray-50" style={{ maxHeight: '180px' }} />
                      <div className="flex divide-x divide-gray-200 border-t border-gray-200">
                        <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-11 text-xs font-medium text-[#00539F] active:bg-gray-50 cursor-pointer">
                          <Camera className="w-4 h-4" />
                          Retake
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewPhoto(null)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-11 text-xs font-medium text-red-500 active:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <label className="flex-1 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 py-4 min-h-20 text-gray-500 active:border-[#00539F] active:text-[#00539F] cursor-pointer">
                        <Camera className="w-6 h-6" />
                        <span className="text-xs font-medium">Take Photo</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      <label className="flex-1 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 py-4 min-h-20 text-gray-500 active:border-[#00539F] active:text-[#00539F] cursor-pointer">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-medium">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Sport */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Sport</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value as Sport)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white p-[0.05in]"
                >
                  <option value="">Select sport…</option>
                  {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white p-[0.05in]"
                >
                  <option value="">Select category…</option>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Unit */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Unit</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. Each, Pair, Set"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                />
              </div>

              {/* Year */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Year</label>
                <input
                  type="text"
                  value="2026-27"
                  readOnly
                  className="w-full border border-gray-100 rounded text-xs text-gray-400 bg-gray-50 cursor-default p-[0.05in]"
                />
              </div>

              {/* Description */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Item description…"
                  rows={3}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] resize-none p-[0.05in]"
                />
              </div>

              {/* Manufacturer */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Manufacturer</label>
                <select
                  value={newManufacturer}
                  onChange={(e) => setNewManufacturer(e.target.value as 'Adidas' | 'Other' | '')}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white p-[0.05in]"
                >
                  <option value="">Select manufacturer…</option>
                  <option value="Adidas">Adidas</option>
                  <option value="Other">Other</option>
                </select>
                {newManufacturer === 'Other' && (
                  <input
                    type="text"
                    value={newManufacturerOther}
                    onChange={(e) => setNewManufacturerOther(e.target.value)}
                    placeholder="Enter manufacturer name…"
                    className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in] mt-[0.1in]"
                  />
                )}
              </div>

              {/* Model */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Model</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Model name or number…"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                />
              </div>

              {/* Qty */}
              <div className="flex gap-3 mb-[0.1in]">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Qty On Hand</label>
                  <input
                    type="number"
                    min="0"
                    value={newQtyOnHand}
                    onChange={(e) => setNewQtyOnHand(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Qty On Order</label>
                  <input
                    type="number"
                    min="0"
                    value={newQtyOnOrder}
                    onChange={(e) => setNewQtyOnOrder(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Price per Unit ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in] mb-[0.1in]"
                />
              </div>

              <button
                onClick={handleAddItem}
                className="w-full text-white font-semibold rounded text-xs py-[0.08in]"
                style={{ backgroundColor: '#00539F' }}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
