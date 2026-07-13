import { Fragment, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAthletes } from '../../context/AthletesContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import { useActiveSport } from '../../context/SportContext';
import type { Athlete, Sport } from '../../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'] as const;
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SHORTS_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

type ViewMode = 'active' | 'archived';

function nextAthleteId(all: Athlete[]): string {
  const nums = all.map((a) => parseInt(a.athleteId.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `ATH${String(max + 1).padStart(3, '0')}`;
}

export default function AthletesList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { athletes: allAthletes, addAthlete } = useAthletes();

  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const isManager = user?.role === 'manager';
  const { activeSport: sportFilter, setActiveSport: setSportFilter } = useActiveSport();
  const [yearFilter, setYearFilter] = useState('All Years');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  // New Athlete modal state
  const [showNewAthlete, setShowNewAthlete] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newYear, setNewYear] = useState<typeof YEARS[number] | ''>('');
  const [newSport, setNewSport] = useState<Sport | ''>('');
  const [newShirtSize, setNewShirtSize] = useState('');
  const [newShortsSize, setNewShortsSize] = useState('');
  const [newShoeSize, setNewShoeSize] = useState('');

  const scopedAthletes = useMemo(() => filterBySports(allAthletes, (a) => a.sports as string[]), [allAthletes, filterBySports]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedAthletes.filter((a) => {
      if (archivedIds.has(a.id)) return false;
      const matchSport = sportFilter === 'All Sports' || a.sports.includes(sportFilter as Sport);
      const matchYear = yearFilter === 'All Years' || a.year === yearFilter;
      const matchSearch = !q || `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) || a.athleteId.toLowerCase().includes(q);
      return matchSport && matchYear && matchSearch;
    });
  }, [sportFilter, yearFilter, search, archivedIds, scopedAthletes]);

  const archivedAthletes = useMemo(
    () => scopedAthletes.filter((a) => archivedIds.has(a.id)),
    [archivedIds, scopedAthletes]
  );

  const displayList = viewMode === 'archived' ? archivedAthletes : filtered;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === displayList.length ? new Set() : new Set(displayList.map((a) => a.id))
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

  function resetNewAthlete() {
    setNewPhoto(null);
    setNewFirstName('');
    setNewLastName('');
    setNewBarcode('');
    setNewYear('');
    setNewSport('');
    setNewShirtSize('');
    setNewShortsSize('');
    setNewShoeSize('');
  }

  function handleAddAthlete() {
    if (!newFirstName || !newLastName || !newYear || !newSport) return;
    const id = `local-${Date.now()}`;
    const athlete: Athlete = {
      id,
      athleteId: nextAthleteId(allAthletes),
      firstName: newFirstName,
      lastName: newLastName,
      barcode: newBarcode || id,
      sports: [newSport as Sport],
      year: newYear as typeof YEARS[number],
      photoUrl: newPhoto ?? undefined,
      shirtSize: newShirtSize || undefined,
      shortsSize: newShortsSize || undefined,
      shoeSize: newShoeSize || undefined,
      notes: '',
      issuedItems: [],
    };
    addAthlete(athlete);
    resetNewAthlete();
    setShowNewAthlete(false);
  }

  return (
    <div>
      {/* Page title */}
      <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>Athletes</span>

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
              <button
                onClick={() => { resetNewAthlete(); setShowNewAthlete(true); }}
                className="text-[#002855] font-semibold text-sm border-none focus:outline-none cursor-pointer rounded-md"
                style={{ backgroundColor: '#FFD200', padding: '0.025in 0.1in' }}
              >
                + New Athlete
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm shrink-0">
            {(['active', 'archived'] as ViewMode[]).map((mode, i) => (
              <Fragment key={mode}>
                {i > 0 && <span className="text-gray-300">|</span>}
                <button
                  onClick={() => { setViewMode(mode); setSelectedIds(new Set()); }}
                  className={`capitalize bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 ${viewMode === mode ? 'font-semibold text-gray-700' : 'text-gray-500'}`}
                >
                  {mode}
                </button>
              </Fragment>
            ))}
          </div>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or athlete ID"
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
              <th style={{ padding: '0.05in' }} className="font-bold">Athlete ID</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Barcode</th>
              <th style={{ padding: '0.05in' }} className="font-bold text-left">Name</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Year</th>
              <th style={{ padding: '0.05in' }} className="font-bold">Assigned Sports</th>
              {viewMode !== 'archived' && (
                <th style={{ padding: '0.05in' }} className="font-bold">Items Issued</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={(isManager ? 1 : 0) + (viewMode !== 'archived' ? 6 : 5)} className="px-4 py-8 text-center text-gray-400">
                  No athletes found.
                </td>
              </tr>
            ) : (
              displayList.map((a) => {
                const activeItems = a.issuedItems.filter((i) => !i.returned);
                return (
                  <tr
                    key={a.id}
                    onClick={() => viewMode !== 'archived' && navigate(`/athletes/${a.id}`)}
                    className={`${viewMode !== 'archived' ? 'hover:bg-[#EFF6FF] cursor-pointer' : ''} transition-colors ${selectedIds.has(a.id) ? 'bg-blue-50' : ''}`}
                  >
                    {isManager && (
                      <td style={{ padding: '0.05in' }} className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.has(a.id)}
                          onChange={() => toggleSelect(a.id)}
                        />
                      </td>
                    )}
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-[#00539F]">{a.athleteId}</td>
                    <td style={{ padding: '0.05in' }} className="text-center font-mono text-gray-500">{a.barcode}</td>
                    <td style={{ padding: '0.05in' }}>
                      <div className="flex items-center gap-2">
                        {a.photoUrl ? (
                          <img src={a.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#00539F] flex items-center justify-center text-white font-bold shrink-0" style={{ fontSize: '10px' }}>
                            {a.firstName[0]}{a.lastName[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">{a.lastName}, {a.firstName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{a.year}</td>
                    <td style={{ padding: '0.05in' }} className="text-center text-gray-600">{a.sports.join(', ')}</td>
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
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No athletes found.</p>
          ) : (
            displayList.map((a) => {
              const activeItems = a.issuedItems.filter((i) => !i.returned);
              return (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 px-4 py-3 min-h-12 ${viewMode !== 'archived' ? 'active:bg-[#EFF6FF] cursor-pointer' : ''} text-left w-full ${selectedIds.has(a.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => viewMode !== 'archived' && navigate(`/athletes/${a.id}`)}
                >
                  {isManager && (
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 mt-1 shrink-0"
                      checked={selectedIds.has(a.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(a.id)}
                    />
                  )}
                  {a.photoUrl ? (
                    <img src={a.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#00539F] flex items-center justify-center text-white font-bold shrink-0 text-xs">
                      {a.firstName[0]}{a.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-800 truncate">{a.lastName}, {a.firstName}</span>
                      <span className="font-mono text-xs text-[#00539F] shrink-0">{a.athleteId}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{a.year} · {a.sports.join(', ')}</p>
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

      <p className="text-xs text-gray-400 mt-2">{displayList.length} athlete{displayList.length !== 1 ? 's' : ''}</p>

      {/* Floating delete bar */}
      {isManager && selectedIds.size > 0 && viewMode !== 'archived' && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-xl" style={{ padding: '0.1in 0.2in' }}>
          <span className="text-sm text-gray-600 font-medium">
            {selectedIds.size} athlete{selectedIds.size !== 1 ? 's' : ''} selected
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

      {/* New Athlete modal */}
      {showNewAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl" style={{ backgroundColor: '#002855', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
              <span className="text-white font-semibold text-sm">New Athlete</span>
              <button onClick={() => setShowNewAthlete(false)} className="text-white hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
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
                  <label className="cursor-pointer text-xs text-[#002855] hover:text-[#00539F] border border-gray-200 rounded" style={{ padding: '0.05in 0.1in' }}>
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>

              {/* Athlete ID (read-only) */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Athlete ID</label>
                <input
                  type="text"
                  readOnly
                  value={nextAthleteId(allAthletes)}
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

              {/* Year */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Year</label>
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value as typeof YEARS[number])}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select Year</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
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
                  onClick={handleAddAthlete}
                  disabled={!newFirstName || !newLastName || !newYear || !newSport}
                  className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
                  style={{ backgroundColor: '#002855', padding: '0.08in' }}
                >
                  Add Athlete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
