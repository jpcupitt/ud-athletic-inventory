import { Fragment, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Upload, Printer, Link as LinkIcon, Share2, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { useAthletes } from '../../context/AthletesContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import { useActiveSport } from '../../context/SportContext';
import { usePendingIntakes } from '../../context/PendingIntakesContext';
import type { Athlete, Sport, CustomSizeEntry } from '../../data/types';

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

const SPORT_ABBR: Partial<Record<Sport, string>> = {
  'Baseball': 'BASE', "Basketball, Men's": 'MBB', "Basketball, Women's": 'WBB',
  'Cross Country': 'XC', 'Field Hockey': 'FH', 'Football': 'FB',
  "Golf, Men's": 'MGOLF', "Golf, Women's": 'WGOLF', 'Ice Hockey': 'IH',
  "Lacrosse, Men's": 'MLAX', "Lacrosse, Women's": 'WLAX', 'Rowing': 'ROW',
  "Soccer, Men's": 'MSOC', "Soccer, Women's": 'WSOC', 'Softball': 'SB',
  "Swimming & Diving, Men's": 'MSWIM', "Swimming & Diving, Women's": 'WSWIM',
  "Tennis, Men's": 'MTEN', "Tennis, Women's": 'WTEN',
  'Track & Field, Indoor': 'TRK', 'Track & Field, Outdoor': 'TRK', 'Volleyball': 'VB',
};

/** Sport + initials + jersey number, e.g. "FB-NM4" — consistent across every
 *  sport. Falls back to appending the current year (then a counter) on a
 *  collision, e.g. a repeat jersey number the following season. */
function smartAthleteId(sport: Sport, firstName: string, lastName: string, jersey: string, existing: Set<string>): string {
  const abbr = SPORT_ABBR[sport] ?? 'ATH';
  const initials = `${(firstName[0] ?? '').toUpperCase()}${(lastName[0] ?? '').toUpperCase()}`;
  const base = jersey.trim() ? `${abbr}-${initials}${jersey.trim()}` : `${abbr}-${initials}`;
  if (!existing.has(base)) return base;
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  let candidate = `${base}-${yearSuffix}`;
  let n = 2;
  while (existing.has(candidate)) { candidate = `${base}-${yearSuffix}${n}`; n++; }
  return candidate;
}

export default function AthletesList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { athletes: allAthletes, addAthlete } = useAthletes();

  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const isManager = user?.role === 'manager';
  const { activeSport: sportFilter, setActiveSport: setSportFilter } = useActiveSport();
  const { pendingIntakes, createIntakeLink, markApproved, dismissIntake } = usePendingIntakes();
  const [yearFilter, setYearFilter] = useState('All Years');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [rosterUploadMsg, setRosterUploadMsg] = useState('');
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickFormEmails, setQuickFormEmails] = useState('');
  const [quickFormSport, setQuickFormSport] = useState<Sport | ''>('');
  const [quickFormLinks, setQuickFormLinks] = useState<{ token: string; url: string; lastName: string }[]>([]);

  // New Athlete modal state
  const [showNewAthlete, setShowNewAthlete] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newJersey, setNewJersey] = useState('');
  const [newPosition, setNewPosition] = useState('');
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
    setNewPhotoUrl('');
    setNewFirstName('');
    setNewLastName('');
    setNewJersey('');
    setNewPosition('');
    setNewBarcode('');
    setNewYear('');
    setNewSport('');
    setNewShirtSize('');
    setNewShortsSize('');
    setNewShoeSize('');
  }

  const existingAthleteIds = useMemo(() => new Set(allAthletes.map((a) => a.athleteId)), [allAthletes]);
  const previewAthleteId = newSport
    ? smartAthleteId(newSport as Sport, newFirstName, newLastName, newJersey, existingAthleteIds)
    : '';

  function handleAddAthlete() {
    if (!newFirstName || !newLastName || !newYear || !newSport) return;
    const id = `local-${Date.now()}`;
    const athlete: Athlete = {
      id,
      athleteId: previewAthleteId,
      firstName: newFirstName,
      lastName: newLastName,
      position: newPosition || undefined,
      barcode: newBarcode || id,
      sports: [newSport as Sport],
      year: newYear as typeof YEARS[number],
      photoUrl: newPhoto ?? newPhotoUrl ?? undefined,
      shirtSize: newShirtSize || undefined,
      shortsSize: newShortsSize || undefined,
      shoeSize: newShoeSize || undefined,
      notes: newJersey ? `Jersey #${newJersey}.` : '',
      issuedItems: [],
    };
    addAthlete(athlete);
    resetNewAthlete();
    setShowNewAthlete(false);
  }

  // Bulk roster upload: first name / last name / jersey # (optionally position,
  // year) columns -> creates every athlete at once instead of one at a time.
  function handleRosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !newSport) { setRosterUploadMsg('Pick a sport above first, then upload the roster.'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const used = new Set(existingAthleteIds);
      const created: Athlete[] = [];
      rows.forEach((row, i) => {
        const rowKeys = Object.keys(row).map((k) => k.toLowerCase());
        const get = (candidates: string[]) => {
          for (const c of candidates) {
            const k = rowKeys.find((k) => k.includes(c));
            if (k) return String(row[Object.keys(row)[rowKeys.indexOf(k)]] ?? '').trim();
          }
          return '';
        };
        const first = get(['first']);
        const last = get(['last']);
        if (!first || !last) return;
        const jersey = get(['jersey', 'number', '#']);
        const position = get(['position', 'pos']);
        const year = get(['year', 'class']);
        const athleteId = smartAthleteId(newSport as Sport, first, last, jersey, used);
        used.add(athleteId);
        const localId = `local-${Date.now()}-${i}`;
        created.push({
          id: localId,
          athleteId,
          firstName: first,
          lastName: last,
          position: position || undefined,
          barcode: localId,
          sports: [newSport as Sport],
          year: (YEARS as readonly string[]).includes(year) ? (year as typeof YEARS[number]) : 'Freshman',
          notes: jersey ? `Jersey #${jersey}.` : '',
          issuedItems: [],
        });
      });
      created.forEach((a) => addAthlete(a));
      setRosterUploadMsg(created.length > 0 ? `Added ${created.length} athlete${created.length !== 1 ? 's' : ''} from the roster.` : 'No rows with a first and last name were found.');
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  function printBlankIntakeForm() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Equipment Intake Form</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { font-size: 20px; border-bottom: 2px solid #003c71; padding-bottom: 8px; }
        .field { margin: 18px 0; }
        label { display: block; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; }
        .line { border-bottom: 1px solid #999; height: 24px; }
        .row { display: flex; gap: 24px; }
        .row .field { flex: 1; }
      </style></head><body>
      <h1>UD Athletics Equipment — New Athlete Intake Form</h1>
      <div class="row">
        <div class="field"><label>First Name</label><div class="line"></div></div>
        <div class="field"><label>Last Name</label><div class="line"></div></div>
      </div>
      <div class="row">
        <div class="field"><label>Sport</label><div class="line"></div></div>
        <div class="field"><label>Position</label><div class="line"></div></div>
        <div class="field"><label>Preferred Jersey #</label><div class="line"></div></div>
      </div>
      <div class="row">
        <div class="field"><label>Shirt Size</label><div class="line"></div></div>
        <div class="field"><label>Shorts Size</label><div class="line"></div></div>
        <div class="field"><label>Shoe Size</label><div class="line"></div></div>
      </div>
      <div class="field"><label>Notes / Special Requests</label><div class="line"></div><div class="line" style="margin-top:12px"></div></div>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  const submittedIntakes = pendingIntakes.filter((i) => i.status === 'submitted');

  function approveIntakeAsAthlete(tokenRow: typeof submittedIntakes[number]) {
    const sub = tokenRow.submission;
    if (!sub) return;
    const used = new Set(existingAthleteIds);
    const athleteId = smartAthleteId(tokenRow.sport, sub.firstName, sub.lastName, sub.jersey, used);
    const localId = `local-${Date.now()}`;
    const customSizes: CustomSizeEntry[] = [
      sub.gloveSize && { id: `${localId}-glove`, label: 'Glove Size', value: sub.gloveSize },
      sub.cleatSize && { id: `${localId}-cleat`, label: 'Cleat Size', value: sub.cleatSize },
      sub.practiceJerseySize && { id: `${localId}-pj`, label: 'Practice Jersey Size', value: sub.practiceJerseySize },
      sub.practicePantSize && { id: `${localId}-pp`, label: 'Practice Pant Size', value: sub.practicePantSize },
    ].filter((e): e is CustomSizeEntry => Boolean(e));
    addAthlete({
      id: localId,
      athleteId,
      firstName: sub.firstName,
      lastName: sub.lastName,
      position: sub.position || undefined,
      barcode: localId,
      sports: [tokenRow.sport],
      year: 'Freshman',
      shirtSize: sub.shirtSize || undefined,
      shortsSize: sub.shortsSize || undefined,
      shoeSize: sub.shoeSize || undefined,
      customSizes: customSizes.length ? customSizes : undefined,
      notes: [sub.jersey && `Jersey #${sub.jersey}.`, sub.notes].filter(Boolean).join(' '),
      issuedItems: [],
    });
    markApproved(tokenRow.token);
  }

  function handleCreateQuickLinks() {
    if (!quickFormSport) return;
    const names = quickFormEmails.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const links = names.map((name) => {
      const { token, url } = createIntakeLink(quickFormSport as Sport, name);
      return { token, url, lastName: name };
    });
    setQuickFormLinks(links);
  }

  async function shareIntakeLink(url: string, lastName: string) {
    const shareData = { title: 'UD Athletics Equipment Form', text: `Fill out your equipment sizing for ${lastName}:`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* user cancelled — fall through to copy */ }
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
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
                className="text-[#003c71] font-semibold text-sm border-none focus:outline-none cursor-pointer rounded-md"
                style={{ backgroundColor: '#FFD200', padding: '0.025in 0.1in' }}
              >
                + New Athlete
              </button>
              <button
                onClick={() => { setQuickFormLinks([]); setQuickFormEmails(''); setQuickFormSport(''); setShowQuickForm(true); }}
                className="flex items-center gap-1 text-[#00539F] font-semibold text-sm border border-[#00539F] bg-transparent focus:outline-none cursor-pointer rounded-md hover:bg-[#EFF6FF]"
                style={{ padding: '0.025in 0.1in' }}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Quick Equipment Form
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

      {/* Submitted intake forms awaiting approval */}
      {isManager && submittedIntakes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg mb-3" style={{ padding: '0.12in' }}>
          <p className="text-xs font-semibold text-amber-800 mb-2">
            {submittedIntakes.length} equipment form{submittedIntakes.length !== 1 ? 's' : ''} submitted — review and approve to add them as athletes
          </p>
          <div className="flex flex-col gap-2">
            {submittedIntakes.map((intake) => (
              <div key={intake.token} className="flex items-center justify-between gap-3 bg-white rounded border border-amber-100" style={{ padding: '0.08in 0.12in' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {intake.submission?.firstName} {intake.submission?.lastName} <span className="text-gray-400 font-normal">· {intake.sport}</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {intake.submission?.jersey && `#${intake.submission.jersey} · `}
                    {intake.submission?.position && `${intake.submission.position} · `}
                    Shirt {intake.submission?.shirtSize || '—'} · Shorts {intake.submission?.shortsSize || '—'} · Shoe {intake.submission?.shoeSize || '—'} · Glove {intake.submission?.gloveSize || '—'} · Cleat {intake.submission?.cleatSize || '—'} · Practice Jersey {intake.submission?.practiceJerseySize || '—'} · Practice Pant {intake.submission?.practicePantSize || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => approveIntakeAsAthlete(intake)} className="text-xs font-semibold text-white rounded" style={{ backgroundColor: '#00539F', padding: '0.05in 0.12in' }}>Approve</button>
                  <button onClick={() => dismissIntake(intake.token)} className="text-xs text-gray-400 hover:text-red-500">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
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
                  <label className="cursor-pointer text-xs text-[#003c71] hover:text-[#00539F] border border-gray-200 rounded" style={{ padding: '0.05in 0.1in' }}>
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Or paste a roster photo URL"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] mt-1.5"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Athlete ID (auto, from sport + initials + jersey) */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Athlete ID (auto)</label>
                <input
                  type="text"
                  readOnly
                  value={previewAthleteId || 'Select a sport first'}
                  className="w-full border border-gray-200 rounded text-xs text-gray-400 bg-gray-50 focus:outline-none"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Jersey # */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Jersey #</label>
                <input
                  type="text"
                  value={newJersey}
                  onChange={(e) => setNewJersey(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Position */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Position</label>
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="e.g. Kicker"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              {/* Barcode (optional — not actively used) */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Barcode (optional)</label>
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

              {/* Bulk roster upload — adds every row at once instead of one athlete at a time */}
              <div style={{ padding: '0.05in 0' }}>
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-[#00539F] hover:bg-[#f0f7ff] transition-colors text-xs text-gray-500 hover:text-[#00539F] p-[0.1in]">
                  <Upload className="w-3.5 h-3.5" />
                  Or bulk-upload the full roster (.xlsx — First, Last, Jersey #)
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleRosterUpload} />
                </label>
                {rosterUploadMsg && <p className="text-[10px] text-gray-500 text-center mt-1">{rosterUploadMsg}</p>}
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
              <div style={{ marginTop: '0.1in', padding: '0.05in 0' }} className="flex flex-col gap-2">
                <button
                  onClick={handleAddAthlete}
                  disabled={!newFirstName || !newLastName || !newYear || !newSport}
                  className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
                  style={{ backgroundColor: '#003c71', padding: '0.08in' }}
                >
                  Add Athlete
                </button>
                <button
                  onClick={printBlankIntakeForm}
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  style={{ padding: '0.07in' }}
                >
                  <Printer className="w-3.5 h-3.5" /> Print Blank Intake Form Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Equipment Form — generate self-service sizing links for new/transfer athletes */}
      {showQuickForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
              <span className="text-white font-semibold text-sm">Quick Equipment Form</span>
              <button onClick={() => setShowQuickForm(false)} className="text-white hover:opacity-70"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-scroll flex-1" style={{ padding: '0.15in 0.2in' }}>
              <p className="text-xs text-gray-500 mb-3">
                Generate a link for a new or transferring athlete to fill out their own sizing on their phone.
                Copy it into a text or email yourself — approve the submission here once it comes in.
              </p>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Sport</label>
                <select
                  value={quickFormSport}
                  onChange={(e) => setQuickFormSport(e.target.value as Sport)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select Sport</option>
                  {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Last Name(s) — one per line, for mass distribution</label>
                <textarea
                  value={quickFormEmails}
                  onChange={(e) => setQuickFormEmails(e.target.value)}
                  placeholder={'Hart\nDaniels\nJohnson'}
                  rows={4}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              <button
                onClick={handleCreateQuickLinks}
                disabled={!quickFormSport || !quickFormEmails.trim()}
                className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
                style={{ backgroundColor: '#003c71', padding: '0.08in', marginTop: '0.05in' }}
              >
                Generate Link{quickFormEmails.split(/[,\n]/).filter((s) => s.trim()).length > 1 ? 's' : ''}
              </button>

              {quickFormLinks.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {quickFormLinks.map((link) => (
                    <div key={link.token} className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-xs font-medium text-gray-700 truncate">{link.lastName}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#00539F] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Form
                        </button>
                        <button
                          onClick={() => shareIntakeLink(link.url, link.lastName)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#00539F] hover:underline"
                        >
                          <Share2 className="w-3 h-3" /> Share
                        </button>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    "Open Form" opens the real sign-up page — a full page in its own tab, exactly what the athlete will see. "Share" opens your phone's share sheet (text, email, etc.), or copies the link.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
