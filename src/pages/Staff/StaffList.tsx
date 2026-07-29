import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStaff } from '../../context/StaffContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import { useActiveSport } from '../../context/SportContext';
import type { Sport, StaffMember } from '../../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SHORTS_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

type ViewMode = 'active' | 'archived';

function nextStaffId(all: StaffMember[]): string {
  const nums = all.map((s) => parseInt(s.staffId.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `UDSG${max + 1}`;
}

export default function StaffList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { staff: allStaff, addStaff } = useStaff();

  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const isManager = user?.role === 'manager';
  const { activeSport: sportFilter, setActiveSport: setSportFilter } = useActiveSport();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // New Staff modal state
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocker, setNewLocker] = useState('');
  const [newSport, setNewSport] = useState<Sport | ''>('');
  const [newShirtSize, setNewShirtSize] = useState('');
  const [newShortsSize, setNewShortsSize] = useState('');
  const [newShoeSize, setNewShoeSize] = useState('');

  const scopedStaff = useMemo(() => filterBySports(allStaff, (s) => s.sports as string[]), [allStaff, filterBySports]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedStaff.filter((s) => {
      if (archivedIds.has(s.id)) return false;
      const matchSport = sportFilter === 'All Sports' || s.sports.includes(sportFilter as Sport);
      const matchSearch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.staffId.toLowerCase().includes(q) || s.title.toLowerCase().includes(q);
      return matchSport && matchSearch;
    });
  }, [sportFilter, search, archivedIds, scopedStaff]);

  const archivedStaff = useMemo(
    () => scopedStaff.filter((s) => archivedIds.has(s.id)),
    [archivedIds, scopedStaff]
  );

  const displayList = viewMode === 'archived' ? archivedStaff : filtered;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === displayList.length ? new Set() : new Set(displayList.map((s) => s.id))
    );
  }

  function archiveSelected() {
    setArchivedIds((prev) => new Set([...prev, ...selectedIds]));
    setSelectedIds(new Set());
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function resetNewStaff() {
    setNewPhoto(null);
    setNewFirstName('');
    setNewLastName('');
    setNewBarcode('');
    setNewTitle('');
    setNewLocker('');
    setNewSport('');
    setNewShirtSize('');
    setNewShortsSize('');
    setNewShoeSize('');
  }

  function handleAddStaff() {
    if (!newFirstName || !newLastName || !newTitle) return;
    const id = `local-staff-${Date.now()}`;
    const member: StaffMember = {
      id,
      staffId: nextStaffId(allStaff),
      firstName: newFirstName,
      lastName: newLastName,
      barcode: newBarcode || id,
      title: newTitle,
      locker: newLocker || undefined,
      sports: newSport ? [newSport as Sport] : [],
      photoUrl: newPhoto ?? undefined,
      shirtSize: newShirtSize || undefined,
      shortsSize: newShortsSize || undefined,
      shoeSize: newShoeSize || undefined,
      notes: '',
      issuedItems: [],
    };
    addStaff(member);
    resetNewStaff();
    setShowNewStaff(false);
  }

  return (
    <div>
      {/* Page title */}
      <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>Staff</span>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm flex-wrap gap-y-1">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value as Sport | 'All Sports')}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="All Sports">{isLead ? 'All Sports' : 'All My Sports'}</option>
            {(isLead ? ALL_SPORTS : accessibleSports).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {isManager && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => { resetNewStaff(); setShowNewStaff(true); }}
                className="text-[#003c71] font-semibold text-sm border-none focus:outline-none cursor-pointer rounded-md"
                style={{ backgroundColor: '#FFD200', padding: '0.025in 0.1in' }}
              >
                + New Staff
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* View mode dropdown */}
          <div className="relative shrink-0" ref={viewDropdownRef}>
            <button
              onClick={() => setShowViewDropdown((v) => !v)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none capitalize"
            >
              {viewMode}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showViewDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showViewDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-36 overflow-hidden">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest" style={{ padding: '0.1in 0.15in 0.05in' }}>View</p>
                <div style={{ padding: '0 0 0.08in' }}>
                  {(['active', 'archived'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setViewMode(mode); setSelectedIds(new Set()); setShowViewDropdown(false); }}
                      className={`w-full text-left text-sm capitalize transition-colors ${viewMode === mode ? 'bg-[#EFF6FF] text-[#00539F] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ padding: '0.07in 0.15in' }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or staff ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-9 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00539F] w-full md:w-52 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ marginTop: '0.1in' }}>
        <table className="w-full text-xs hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-center text-gray-500">
              {isManager && (
                <th style={{ padding: '0.05in' }} className="font-bold w-8">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedIds.size === displayList.length && displayList.length > 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              <th style={{ padding: '0.05in' }} className="font-bold">Staff ID</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Barcode</th>
              <th style={{ padding: '0.05in' }} className="font-bold text-left">Name</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Title</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Locker</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Assigned Sports</th>
              {viewMode !== 'archived' && (
                <th style={{ padding: '0.05in' }} className="font-bold">Items Issued</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={(isManager ? 1 : 0) + (viewMode !== 'archived' ? 7 : 6)} className="px-4 py-8 text-center text-gray-400">
                  No staff members found.
                </td>
              </tr>
            ) : (
              displayList.map((s) => {
                const activeItems = s.issuedItems.filter((i) => !i.returned);
                return (
                  <tr
                    key={s.id}
                    onClick={() => viewMode !== 'archived' && navigate(`/staff/${s.id}`)}
                    className={`${viewMode !== 'archived' ? 'hover:bg-[#EFF6FF] cursor-pointer' : ''} transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50' : ''}`}
                  >
                    {isManager && (
                      <td style={{ padding: '0.05in' }} className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                        />
                      </td>
                    )}
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-[#00539F]">{s.staffId}</td>
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-gray-500">{s.barcode}</td>
                    <td style={{ padding: '0.05in' }}>
                      <div className="flex items-center gap-2">
                        {s.photoUrl ? (
                          <img src={s.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold shrink-0" style={{ fontSize: '10px' }}>
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">{s.lastName}, {s.firstName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{s.title}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{s.locker ?? '—'}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{s.sports.join(', ')}</td>
                    {viewMode !== 'archived' && (
                      <td style={{ padding: '0.05in' }} className="text-center font-medium text-gray-700">{activeItems.length || '—'}</td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-100">
          {displayList.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No staff members found.</p>
          ) : (
            displayList.map((s) => {
              const activeItems = s.issuedItems.filter((i) => !i.returned);
              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-3 px-4 py-3 min-h-12 ${viewMode !== 'archived' ? 'active:bg-[#EFF6FF] cursor-pointer' : ''} text-left w-full ${selectedIds.has(s.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => viewMode !== 'archived' && navigate(`/staff/${s.id}`)}
                >
                  {isManager && (
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 mt-1 shrink-0"
                      checked={selectedIds.has(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(s.id)}
                    />
                  )}
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold shrink-0 text-xs">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-800 truncate">{s.lastName}, {s.firstName}</span>
                      <span className="font-mono text-xs text-[#00539F] shrink-0">{s.staffId}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{s.title}{s.sports.length > 0 ? ` · ${s.sports.join(', ')}` : ''}</p>
                    {viewMode !== 'archived' && (
                      <p className="text-xs text-gray-500">{activeItems.length || 0} item{activeItems.length !== 1 ? 's' : ''} issued</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">{displayList.length} member{displayList.length !== 1 ? 's' : ''}</p>

      {/* Floating delete bar */}
      {isManager && selectedIds.size > 0 && viewMode !== 'archived' && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-xl" style={{ padding: '0.1in 0.2in' }}>
          <span className="text-sm text-gray-600 font-medium">
            {selectedIds.size} member{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={archiveSelected}
            className="text-white text-sm font-medium rounded"
            style={{ backgroundColor: '#dc2626', padding: '0.05in 0.15in' }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* New Staff modal */}
      {showNewStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
              <span className="text-white font-semibold text-sm">New Staff Member</span>
              <button onClick={() => setShowNewStaff(false)} className="text-white hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-scroll flex-1" style={{ padding: '0.15in 0.2in' }}>

              {/* Headshot */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Headshot</label>
                <div className="flex items-center gap-3">
                  {newPhoto ? (
                    <img src={newPhoto} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">Photo</div>
                  )}
                  <label className="cursor-pointer text-xs text-[#003c71] hover:text-[#00539F] border border-gray-200 rounded" style={{ padding: '0.05in 0.1in' }}>
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>

              {/* Staff ID */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Staff ID</label>
                <input
                  type="text"
                  readOnly
                  value={nextStaffId(allStaff)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-400 bg-gray-50 focus:outline-none"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Barcode */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Barcode</label>
                <input
                  type="text"
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  placeholder="Scan or enter barcode"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Name */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="First"
                    className="flex-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    style={{ padding: '0.05in' }}
                  />
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Last"
                    className="flex-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    style={{ padding: '0.05in' }}
                  />
                </div>
              </div>

              {/* Title */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Head Coach, Equipment Manager"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Locker */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Locker</label>
                <input
                  type="text"
                  value={newLocker}
                  onChange={(e) => setNewLocker(e.target.value)}
                  placeholder="e.g. A1"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Sport */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Sport</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value as Sport)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select Sport</option>
                  {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Sizes */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Shirt Size</label>
                <select
                  value={newShirtSize}
                  onChange={(e) => setNewShirtSize(e.target.value)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select Size</option>
                  {SHIRT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Shorts Size</label>
                <select
                  value={newShortsSize}
                  onChange={(e) => setNewShortsSize(e.target.value)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select Size</option>
                  {SHORTS_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Shoe Size</label>
                <input
                  type="text"
                  value={newShoeSize}
                  onChange={(e) => setNewShoeSize(e.target.value)}
                  placeholder="e.g. 10.5"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Submit */}
              <div style={{ marginTop: '0.1in', padding: '0.05in 0' }}>
                <button
                  onClick={handleAddStaff}
                  disabled={!newFirstName || !newLastName || !newTitle}
                  className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
                  style={{ backgroundColor: '#003c71', padding: '0.08in' }}
                >
                  Add Staff Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
