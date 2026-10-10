import { useState, useEffect, useMemo } from 'react';
import { Upload, ChevronRight, RotateCcw, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAthletes } from '../context/AthletesContext';
import { useSportsAccess } from '../hooks/useSportsAccess';
import { clearPersistedState, clearPersistedKeys, usePersistentState } from '../hooks/usePersistentState';

interface Member {
  name: string;
  phone: string;
  email: string;
  assignedSports: string[];
  role: 'Equipment Manager' | 'Student Manager' | 'Assistant Coach' | 'Viewer';
}

const DEFAULT_MEMBERS: Member[] = [
  { name: 'Peter Stevens', phone: '', email: 'pstevens@udel.edu', assignedSports: [], role: 'Equipment Manager' },
  { name: 'Taylor Reed', phone: '', email: 'treed@udel.edu', assignedSports: [], role: 'Student Manager' },
  { name: 'Coach Demo', phone: '', email: 'demo@udel.edu', assignedSports: [], role: 'Viewer' },
  { name: 'Sarah Collins', phone: '', email: 'scollins@udel.edu', assignedSports: [], role: 'Viewer' },
  { name: 'Marcus Reed', phone: '', email: 'mreed@udel.edu', assignedSports: [], role: 'Viewer' },
];

const ROLE_BADGE_STYLE: Record<Member['role'], string> = {
  'Equipment Manager': 'bg-[#DAEAF5] text-[#00539F]',
  'Student Manager': 'bg-amber-50 text-amber-700',
  'Assistant Coach': 'bg-purple-50 text-purple-700',
  'Viewer': 'bg-gray-100 text-gray-600',
};

type Tab = 'general' | 'notifications' | 'security' | 'appearance' | 'members';

const ALL_SPORTS = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'general',       label: 'General' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security',      label: 'Security' },
  { id: 'appearance',    label: 'Appearance' },
  { id: 'members',       label: 'Members & Roles' },
];

function FieldRow({ label, value, onEdit, editLabel = 'Edit' }: { label: string; value: React.ReactNode; onEdit?: () => void; editLabel?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100" style={{ padding: '0.05in 0' }}>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-gray-800">{value}</div>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-[#00539F] hover:underline font-medium shrink-0 ml-4">
          {editLabel}
        </button>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-[#00539F]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function roleLabel(role: string | undefined): string {
  if (role === 'manager') return 'Equipment Manager';
  if (role === 'student_manager') return 'Student Manager';
  return 'Viewer';
}

function NotifRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100" style={{ padding: '0.05in 0' }}>
      <div className="mr-4">
        <p className="text-sm text-gray-800 font-medium">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { isLead } = useSportsAccess();
  const { athletes, archivedIds: archivedAthleteIds, rolloverSeason } = useAthletes();
  const isManager = user?.role === 'manager';
  const [tab, setTab] = useState<Tab>('general');
  const [rolloverMsg, setRolloverMsg] = useState('');

  // Live preview of what a rollover would do, recomputed as the roster changes.
  const rolloverPreview = useMemo(() => {
    let graduating = 0, promoting = 0;
    for (const a of athletes) {
      if (archivedAthleteIds.has(a.id)) continue;
      if (a.year === 'Senior' || a.year === 'Graduate') graduating++;
      else promoting++;
    }
    return { graduating, promoting };
  }, [athletes, archivedAthleteIds]);

  function handleRollover() {
    const { graduating, promoting } = rolloverPreview;
    if (graduating === 0 && promoting === 0) return;
    if (!window.confirm(
      `Roll over the season?\n\n${graduating} Senior/Graduate athlete${graduating !== 1 ? 's' : ''} will be archived (graduated).\n${promoting} athlete${promoting !== 1 ? 's' : ''} will be promoted one class year.\n\nThis cannot be undone.`
    )) return;
    const result = rolloverSeason();
    setRolloverMsg(`Done — ${result.graduated} graduated and archived, ${result.promoted} promoted to their next class year.`);
  }

  // General editing state
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [editingSports, setEditingSports] = useState(false);
  const [assignedSports, setAssignedSports] = useState<string[]>(user?.assignedSports ?? []);

  function toggleSport(sport: string) {
    setAssignedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  // Members & Roles / Invite Member
  const [members, setMembers] = usePersistentState<Member[]>('members', () => DEFAULT_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSports, setInviteSports] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<'Student Manager' | 'Assistant Coach'>('Student Manager');

  function toggleInviteSport(sport: string) {
    setInviteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  function resetInviteForm() {
    setInviteName('');
    setInvitePhone('');
    setInviteEmail('');
    setInviteSports([]);
    setInviteRole('Student Manager');
  }

  function handleInviteMember() {
    setMembers((prev) => [
      ...prev,
      { name: inviteName, phone: invitePhone, email: inviteEmail, assignedSports: inviteSports, role: inviteRole },
    ]);
    setShowInviteModal(false);
    resetInviteForm();
  }

  // Notification toggles
  const [notifs, setNotifs] = useState({
    lowStock: true,
    overdueReturns: true,
    orderApprovals: true,
    emailDigest: false,
  });

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  function handlePwSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw) { setPwMsg('Enter your current password.'); return; }
    if (newPw.length < 6) { setPwMsg('New password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match.'); return; }
    setPwMsg('Password updated successfully.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  const initials = user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'UD';

  return (
    <div>
      <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4 block mb-6" style={{ color: '#00539F' }}>
        Settings
      </span>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Sidebar */}
        <div className="w-full md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 flex flex-row overflow-x-auto md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-auto shrink-0 whitespace-nowrap md:w-full text-left text-sm pr-4 transition-colors flex items-center justify-between gap-1 ${
                tab === t.id
                  ? 'text-[#00539F] font-semibold bg-[#EEF4FB]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: '0.1in', paddingTop: '0.1in', paddingBottom: '0.1in' }}
            >
              {t.label}
              {tab === t.id && <ChevronRight className="w-3.5 h-3.5 text-[#00539F]" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '0.25in' }}>

          {/* GENERAL */}
          {tab === 'general' && (
            <div className="flex flex-col" style={{ gap: '0.1in' }}>
              {/* Avatar row */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFD200] flex items-center justify-center text-[#003c71] text-xl font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{roleLabel(user?.role)}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50">
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </button>
              </div>

              {/* Name */}
              {editingName ? (
                <div className="border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Name</p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    />
                    <button onClick={() => { updateUser({ name }); setEditingName(false); }} className="px-3 py-1.5 bg-[#00539F] text-white text-xs rounded hover:bg-[#003D75]">Save</button>
                    <button onClick={() => { setName(user?.name ?? ''); setEditingName(false); }} className="px-3 py-1.5 border border-gray-300 text-xs rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <FieldRow label="Name" value={name} onEdit={() => setEditingName(true)} />
              )}

              {/* Email */}
              {editingEmail ? (
                <div className="border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                    />
                    <button onClick={() => { updateUser({ email }); setEditingEmail(false); }} className="px-3 py-1.5 bg-[#00539F] text-white text-xs rounded hover:bg-[#003D75]">Save</button>
                    <button onClick={() => { setEmail(user?.email ?? ''); setEditingEmail(false); }} className="px-3 py-1.5 border border-gray-300 text-xs rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <FieldRow label="Email" value={email} onEdit={() => setEditingEmail(true)} />
              )}

              {/* Role — read-only */}
              <FieldRow label="Role" value={
                <span className={`text-sm font-medium ${user?.role === 'manager' ? 'text-[#00539F]' : 'text-gray-600'}`}>
                  {roleLabel(user?.role)}
                </span>
              } />

              {/* Assigned Sports (read) */}
              <div className="border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Assigned Sports</p>
                  {isLead && (
                    <button
                      onClick={() => setEditingSports(!editingSports)}
                      className="text-xs text-[#00539F] hover:underline font-medium ml-4 shrink-0"
                    >
                      {editingSports ? 'Done' : 'Edit'}
                    </button>
                  )}
                </div>

                {editingSports ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SPORTS.map((sport) => {
                        const active = assignedSports.includes(sport);
                        return (
                          <button
                            key={sport}
                            onClick={() => toggleSport(sport)}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                              active
                                ? 'bg-[#00539F] text-white border-[#00539F]'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-[#00539F] hover:text-[#00539F]'
                            }`}
                          >
                            {sport}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {assignedSports.length > 0 ? assignedSports.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded text-xs font-medium border bg-[#00539F] text-white border-[#00539F]">{s}</span>
                    )) : (
                      <span className="text-xs text-gray-400 italic">No sports assigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Season rollover */}
              {isManager && (
                <div className="border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Season Rollover</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Archives every active Senior/Graduate athlete as graduated, and promotes everyone else
                    one class year (Freshman → Sophomore → Junior → Senior). Run this once per season.
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Next run: <span className="font-semibold text-[#00539F]">{rolloverPreview.graduating}</span> will graduate,{' '}
                    <span className="font-semibold text-[#00539F]">{rolloverPreview.promoting}</span> will be promoted.
                  </p>
                  <button
                    onClick={handleRollover}
                    disabled={rolloverPreview.graduating === 0 && rolloverPreview.promoting === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#00539F] text-xs text-[#00539F] hover:bg-[#EEF4FB] font-medium disabled:opacity-40"
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> Run Season Rollover
                  </button>
                  {rolloverMsg && <p className="text-xs text-green-600 mt-2">{rolloverMsg}</p>}
                </div>
              )}

              {/* Reset demo data */}
              <div className="border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Demo Data</p>
                <p className="text-xs text-gray-500 mb-2">
                  Inventory, orders, athletes, and staff changes are saved on this device. Reset to restore the original sample data. This also clears your session and signs you out.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Clear out inventory (items, archive) to start real data entry? Athletes, staff, and orders stay as-is. This cannot be undone.')) {
                        clearPersistedKeys(['inventory2', 'archived']);
                        window.location.href = '/inventory';
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-amber-300 text-xs text-amber-600 hover:bg-amber-50 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Inventory Only
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all saved data back to the original demo data? This will also sign you out. This cannot be undone.')) {
                        clearPersistedState();
                        window.location.href = '/';
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-300 text-xs text-red-500 hover:bg-red-50 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Everything
                  </button>
                </div>
              </div>

              {/* Sign out */}
              <div style={{ paddingTop: '0.1in' }}>
                <button onClick={logout} className="text-sm text-red-500 hover:underline font-medium">
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div className="flex flex-col" style={{ gap: '0.05in' }}>
              <p className="text-sm font-semibold text-gray-700 mb-2">Alert Preferences</p>
              <NotifRow
                label="Low Stock Alerts"
                description="Notify when an item falls below 10 units on hand"
                checked={notifs.lowStock}
                onChange={(v) => setNotifs((n) => ({ ...n, lowStock: v }))}
              />
              <NotifRow
                label="Overdue Return Alerts"
                description="Notify when a non-expendable item is past its return date"
                checked={notifs.overdueReturns}
                onChange={(v) => setNotifs((n) => ({ ...n, overdueReturns: v }))}
              />
              <NotifRow
                label="Order Approval Alerts"
                description="Notify when a submitted order is awaiting approval"
                checked={notifs.orderApprovals}
                onChange={(v) => setNotifs((n) => ({ ...n, orderApprovals: v }))}
              />
              <NotifRow
                label="Daily Email Digest"
                description="Receive a daily summary email of inventory activity"
                checked={notifs.emailDigest}
                onChange={(v) => setNotifs((n) => ({ ...n, emailDigest: v }))}
              />
            </div>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div className="flex flex-col" style={{ gap: '0.1in' }}>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
                <form onSubmit={handlePwSave} className="flex flex-col gap-3 max-w-sm">
                  {[
                    { label: 'Current Password', value: currentPw, set: setCurrentPw },
                    { label: 'New Password',     value: newPw,     set: setNewPw },
                    { label: 'Confirm Password', value: confirmPw, set: setConfirmPw },
                  ].map(({ label, value, set }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">{label}</label>
                      <input
                        type="password"
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                      />
                    </div>
                  ))}
                  {pwMsg && (
                    <p className={`text-xs ${pwMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{pwMsg}</p>
                  )}
                  <button type="submit" className="px-4 py-2 bg-[#00539F] text-white text-sm rounded hover:bg-[#003D75] self-start">
                    Update Password
                  </button>
                </form>
              </div>

              <div className="border-t border-gray-100" style={{ paddingTop: '0.1in' }}>
                <p className="text-sm font-semibold text-gray-700 mb-1">Session</p>
                <p className="text-xs text-gray-400 mb-3">Sign out of all active sessions across all devices.</p>
                <button onClick={logout} className="px-4 py-2 border border-red-300 text-red-500 text-sm rounded hover:bg-red-50">
                  Sign Out All Devices
                </button>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <div className="flex flex-col" style={{ gap: '0.1in' }}>
              <p className="text-sm font-semibold text-gray-700 mb-1">Theme</p>
              <div className="flex gap-3">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-colors ${
                      theme === t ? 'border-[#00539F] bg-[#EEF4FB]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-16 h-10 rounded flex items-center justify-center text-xs font-medium ${
                      t === 'light' ? 'bg-gray-100 text-gray-700 border border-gray-200' : 'bg-gray-800 text-gray-200'
                    }`}>
                      Aa
                    </div>
                    <span className={`text-xs font-medium capitalize ${theme === t ? 'text-[#00539F]' : 'text-gray-600'}`}>
                      {t === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">Dark mode is a preview feature and may not apply to all pages.</p>
            </div>
          )}

          {/* MEMBERS & ROLES */}
          {tab === 'members' && (
            <div className="flex flex-col" style={{ gap: '0.1in' }}>
              <p className="text-sm font-semibold text-gray-700 mb-1">Members & Roles</p>
              {members.map((m) => (
                <div key={m.email} className="flex items-center justify-between gap-3 border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#DAEAF5] flex items-center justify-center text-[#00539F] text-xs font-bold shrink-0">
                      {m.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate">{m.name}</p>
                      <p className="text-xs text-gray-400 truncate">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                      {m.assignedSports.length > 0 && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{m.assignedSports.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ROLE_BADGE_STYLE[m.role]}`}>
                    {m.role}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setShowInviteModal(true)}
                className="self-start mt-2 px-4 py-1.5 border border-[#00539F] text-[#00539F] text-xs rounded hover:bg-[#EEF4FB] font-medium"
              >
                + Invite Member
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Invite Member modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInviteModal(false)}>
          <div
            className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl shrink-0" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
              <span className="text-white font-semibold text-sm">Invite Member</span>
              <button onClick={() => { setShowInviteModal(false); resetInviteForm(); }} className="text-white hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1" style={{ padding: '0.15in 0.2in' }}>
              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Phone</label>
                <input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="(302) 555-0100"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@udel.edu"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'Student Manager' | 'Assistant Coach')}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="Student Manager">Student</option>
                  <option value="Assistant Coach">Assistant</option>
                </select>
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Assigned Sports</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SPORTS.map((sport) => {
                    const active = inviteSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleInviteSport(sport)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                          active
                            ? 'bg-[#00539F] text-white border-[#00539F]'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-[#00539F] hover:text-[#00539F]'
                        }`}
                      >
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div style={{ marginTop: '0.1in', padding: '0.05in 0' }}>
                <button
                  onClick={handleInviteMember}
                  disabled={!inviteName || !inviteEmail}
                  className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
                  style={{ backgroundColor: '#003c71', padding: '0.08in' }}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
