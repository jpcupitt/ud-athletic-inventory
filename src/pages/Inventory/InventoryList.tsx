import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
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
  const defaultSport: Sport | 'All Sports' = isLead ? 'All Sports' : (user?.assignedSports[0] ?? 'All Sports');
  const [sportFilter, setSportFilter] = useState<Sport | 'All Sports'>(defaultSport);
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'All Categories'>('All Categories');
  const [yearFilter, setYearFilter] = useState<string>('All Years');
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [specialFilter, setSpecialFilter] = useState(searchParams.get('filter') ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showNewItem, setShowNewItem] = useState(false);
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
  const { items: allItems, archivedIds, addItem, archiveItems } = useInventory();

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value as Sport | 'All Sports')}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            {isLead && <option value="All Sports">All Sports</option>}
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
              <button onClick={() => { resetNewItem(); setShowNewItem(true); }} className="text-[#003c71] font-semibold text-sm border-none focus:outline-none cursor-pointer rounded-md" style={{ backgroundColor: '#FFD200', padding: '0.025in 0.1in' }}>
                + New Item
              </button>
            </>
          )}
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
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Item ID or Reference No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-9 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00539F] w-56 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Active special filter banner */}
      {specialFilter && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded bg-[#DAEAF5] border border-[#00539F]/20">
          <span className="text-xs text-[#00539F] font-medium">
            {specialFilter === 'low' && 'Showing: Low Inventory (qty on hand < 3)'}
            {specialFilter === 'overdue' && 'Showing: Non-Expendable items (overdue returns)'}
          </span>
          <button onClick={() => setSpecialFilter('')} className="text-xs text-[#00539F] hover:underline ml-4">Clear filter</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ marginTop: '0.1in' }}>
        {(viewMode === 'summary' || viewMode === 'detail') && (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-center text-gray-500">
                <th style={{ padding: '0.05in' }} className="font-bold w-8"></th>
                <th style={{ padding: '0.05in' }} className="font-bold w-10"></th>
                <th style={{ padding: '0.05in' }} className="font-bold">Item ID</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Category</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Unit</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Year</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Item Description</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Manufacturer / Model</th>
                {sportFilter === 'All Sports' && <th style={{ padding: '0.05in' }} className="font-bold">Sport</th>}
                <th style={{ padding: '0.05in' }} className="font-bold">Qty On Hand</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Qty On Order</th>
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
                    <td style={{ padding: '0.05in' }} className="text-center" onClick={(e) => e.stopPropagation()}>
                      {isManager && <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.has(item.id)} onChange={() => {}} onClick={(e) => toggleSelected(item.id, e)} />}
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-gray-600">{item.itemId}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.category}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.unit}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.year}</td>
                    <td style={{ padding: '0.05in' }} className="text-center">
                      <p className="font-bold text-gray-800">{item.description}</p>
                      {viewMode === 'detail' && (
                        <p className="text-gray-400 italic">Add notes</p>
                      )}
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.manufacturer} / {item.model}</td>
                    {sportFilter === 'All Sports' && (
                      <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.sports.join(' / ')}</td>
                    )}
                    <td style={{ padding: '0.05in' }} className="text-center">
                      <span className={item.qtyOnHand < 3 ? 'text-red-600 font-semibold' : item.qtyOnHand < 10 ? 'text-amber-600 font-semibold' : 'text-gray-800 font-medium'}>
                        {item.qtyOnHand}
                      </span>
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.qtyOnOrder > 0 ? item.qtyOnOrder : 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {viewMode === 'serial' && (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-center text-gray-500">
                <th style={{ padding: '0.05in' }} className="font-bold">Item ID</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Description</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Serial Numbers</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Return By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serialItems.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No serialized items in current filters.</td></tr>
              ) : (
                serialItems.map((item) => (
                  <tr key={item.id} onClick={() => navigate(`/inventory/${item.id}`)} className="hover:bg-[#EFF6FF] cursor-pointer">
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-gray-600">{item.itemId}</td>
                    <td style={{ padding: '0.05in' }} className="text-center font-medium text-gray-800">{item.description}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.serialNumbers?.join(', ') ?? '—'}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.returnByDate ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {viewMode === 'archived' && (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-center text-gray-500">
                <th style={{ padding: '0.05in' }} className="font-bold w-10"></th>
                <th style={{ padding: '0.05in' }} className="font-bold">Item ID</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Category</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Item Description</th>
                <th style={{ padding: '0.05in' }} className="font-bold">Manufacturer / Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {archivedItems.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No archived items.</td></tr>
              ) : (
                archivedItems.map((item) => (
                  <tr key={item.id} className="opacity-60">
                    <td style={{ padding: '0.05in' }} className="text-center">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.description} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-gray-600">{item.itemId}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.category}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.description}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{item.manufacturer} / {item.model}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {viewMode === 'archived' ? `${archivedItems.length} archived item${archivedItems.length !== 1 ? 's' : ''}` : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Floating delete bar */}
      {isManager && selectedIds.size > 0 && viewMode !== 'archived' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-xl" style={{ padding: '0.1in 0.2in' }}>
          <span className="text-sm text-gray-600 font-medium">{selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <button
            onClick={() => {
              archiveItems(selectedIds);
              setSelectedIds(new Set());
            }}
            className="text-sm font-semibold text-white rounded-lg"
            style={{ backgroundColor: '#dc2626', padding: '0.05in 0.15in' }}
          >
            Delete
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {/* New Item modal */}
      {showNewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowNewItem(false)}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ width: '420px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', backgroundColor: '#003c71' }}>
              <h2 className="text-sm font-semibold text-white">New Item</h2>
              <button onClick={() => setShowNewItem(false)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-scroll" style={{ padding: '0.15in' }}>

              {/* Photo upload */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Photo</label>
                <label className="flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#00539F] transition-colors" style={{ minHeight: '100px' }}>
                  {newPhoto ? (
                    <img src={newPhoto} alt="Item" className="w-full object-contain rounded-lg" style={{ maxHeight: '120px' }} />
                  ) : (
                    <div className="flex flex-col items-center py-4 text-gray-400">
                      <Package className="w-8 h-8 mb-1" />
                      <span className="text-xs">Click to upload photo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>

              {/* Sport */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Sport</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value as Sport)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select sport…</option>
                  {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Category */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select category…</option>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Unit */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Unit</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. Each, Pair, Set"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Year */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Year</label>
                <input
                  type="text"
                  value="2026-27"
                  readOnly
                  className="w-full border border-gray-100 rounded text-xs text-gray-400 bg-gray-50 cursor-default"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Description */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Item description…"
                  rows={3}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] resize-none"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Manufacturer */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Manufacturer</label>
                <select
                  value={newManufacturer}
                  onChange={(e) => setNewManufacturer(e.target.value as 'Adidas' | 'Other' | '')}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
                  style={{ padding: '0.05in' }}
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
                    className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    style={{ padding: '0.05in', marginTop: '0.1in' }}
                  />
                )}
              </div>

              {/* Model */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Model</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Model name or number…"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Qty */}
              <div className="flex gap-3" style={{ marginBottom: '0.1in' }}>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Qty On Hand</label>
                  <input
                    type="number"
                    min="0"
                    value={newQtyOnHand}
                    onChange={(e) => setNewQtyOnHand(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    style={{ padding: '0.05in' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Qty On Order</label>
                  <input
                    type="number"
                    min="0"
                    value={newQtyOnOrder}
                    onChange={(e) => setNewQtyOnOrder(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    style={{ padding: '0.05in' }}
                  />
                </div>
              </div>

              {/* Submit */}
              {/* Price */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Price per Unit ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in', marginBottom: '0.1in' }}
                />
              </div>

              <button
                onClick={handleAddItem}
                className="w-full text-white font-semibold rounded text-xs"
                style={{ backgroundColor: '#00539F', padding: '0.08in' }}
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
