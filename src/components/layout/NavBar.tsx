import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, ChevronDown, User, Trophy, AlertTriangle, Package, ShoppingCart, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import { useActiveSport, type ActiveSport } from '../../context/SportContext';
import GlobalSearch from '../GlobalSearch';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Orders', to: '/orders' },
  { label: 'Athletes', to: '/athletes' },
  { label: 'Staff', to: '/staff' },
  { label: 'Reports', to: '/reports' },
];

const EQUIPMENT_ROOM_LINKS = [
  { label: 'Fitting Day', to: '/fitting', hint: 'Bulk-issue a kit to the roster' },
  { label: 'Return Day', to: '/returns', hint: 'Check gear back in, build the owes list' },
  { label: 'Smart Reorder', to: '/reorder', hint: 'Draft orders for low-stock items' },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const { overdueReturns, lowInventory, ordersForApproval } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const [showEquipRoom, setShowEquipRoom] = useState(false);
  const [equipPos, setEquipPos] = useState<DOMRect | null>(null);
  const location = useLocation();
  const { isLead, accessibleSports } = useSportsAccess();
  const { activeSport, setActiveSport } = useActiveSport();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const sportsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  function dismiss(key: string) {
    setDismissed((prev) => new Set([...prev, key]));
  }

  function dismissAll() {
    const allKeys = [
      ...overdueReturns.map((n) => n.key),
      ...lowInventory.map((n) => n.key),
      ...ordersForApproval.map((n) => n.key),
    ];
    setDismissed(new Set(allKeys));
  }

  function handleNotifClick(key: string, url: string) {
    dismiss(key);
    setShowNotifMenu(false);
    navigate(url);
  }

  const visibleOverdue = overdueReturns.filter((n) => !dismissed.has(n.key));
  const visibleLow = lowInventory.filter((n) => !dismissed.has(n.key));
  const visibleOrders = ordersForApproval.filter((n) => !dismissed.has(n.key));
  const totalVisible = visibleOverdue.length + visibleLow.length + visibleOrders.length;

  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EQ';

  return (
    <nav
      className="bg-[#002855] text-white flex items-center h-14 shrink-0 relative z-50 md:min-w-[900px]"
      style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
    >
      {/* Scrollable left section: logo + links */}
      <div className="flex items-center self-stretch overflow-x-auto px-4 gap-4 flex-1 min-w-0">
        {/* Logo */}
        <div className="flex items-center mr-2 shrink-0">
          <img src="/Delaware-Blue-Hens-logo.png" alt="Delaware Blue Hens" className="h-8 w-auto" />
        </div>

        {/* Nav links (desktop only — mobile uses the bottom tab bar) */}
        <div className="hidden md:flex self-stretch gap-3">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 text-sm font-medium transition-colors border-b-4 whitespace-nowrap ${
                  isActive
                    ? 'border-[#FFD200] text-white'
                    : 'border-transparent text-gray-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Equipment Room dropdown — panel is position:fixed so the scrollable
              links container (overflow-x-auto) can't clip it */}
          <div
            className="flex"
            onMouseEnter={(e) => {
              setEquipPos(e.currentTarget.getBoundingClientRect());
              setShowEquipRoom(true);
            }}
            onMouseLeave={() => setShowEquipRoom(false)}
          >
            <button
              onClick={(e) => {
                setEquipPos((e.currentTarget.parentElement as HTMLElement).getBoundingClientRect());
                setShowEquipRoom(true);
              }}
              className={`flex items-center gap-1 px-3 text-sm font-medium transition-colors border-b-4 whitespace-nowrap ${
                EQUIPMENT_ROOM_LINKS.some((l) => location.pathname.startsWith(l.to))
                  ? 'border-[#FFD200] text-white'
                  : 'border-transparent text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Equipment Room <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showEquipRoom && equipPos && (
              <div
                className="fixed w-64 bg-white rounded-b-lg shadow-xl border border-gray-100 py-1 z-50"
                style={{ top: equipPos.bottom, left: equipPos.left }}
              >
                {EQUIPMENT_ROOM_LINKS.map((link) => (
                  <button
                    key={link.to}
                    onClick={() => { setShowEquipRoom(false); navigate(link.to); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <span className="block text-sm font-medium text-gray-800">{link.label}</span>
                    <span className="block text-xs text-gray-400 mt-0.5">{link.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section: always visible, never scrolls */}
      <div className="flex items-center gap-3 px-4 shrink-0">
        {/* Global sport picker — one selection shared by every page */}
        <select
          value={activeSport}
          onChange={(e) => setActiveSport(e.target.value as ActiveSport)}
          title="Active sport — filters every page"
          className="hidden md:block max-w-44 text-xs rounded px-2 py-1.5 bg-[#003D75] text-white border border-white/30 focus:outline-none focus:ring-1 focus:ring-white/50 cursor-pointer"
        >
          <option value="All Sports">{isLead ? 'All Sports' : 'All My Sports'}</option>
          {accessibleSports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Search — items, athletes, staff, orders */}
        <GlobalSearch />

        {/* Search (mobile) — full-screen global search */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="p-2.5 -m-1 text-gray-300 hover:text-white md:hidden"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        {showMobileSearch && <GlobalSearch mobile onClose={() => setShowMobileSearch(false)} />}

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifMenu((v) => !v); setShowUserMenu(false); }}
            className="relative p-1.5 text-gray-300 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalVisible > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {totalVisible}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-xl shadow-xl z-50 w-96 max-w-[calc(100vw-1rem)] border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100" style={{ padding: '0.15in 0.2in' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  {totalVisible > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {totalVisible}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {totalVisible > 0 && (
                    <button onClick={dismissAll} className="text-xs text-[#00539F] hover:underline font-medium">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setShowNotifMenu(false)} className="text-gray-300 hover:text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                {totalVisible === 0 ? (
                  <div className="text-center" style={{ padding: '0.4in 0.2in' }}>
                    <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-400">You're all caught up</p>
                    <p className="text-xs text-gray-300 mt-1">No new notifications</p>
                  </div>
                ) : (
                  <>
                    {/* Overdue Returns */}
                    {visibleOverdue.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest" style={{ padding: '0.12in 0.2in 0.05in' }}>Overdue Returns</p>
                        {visibleOverdue.map((n) => (
                          <button
                            key={n.key}
                            onClick={() => handleNotifClick(n.key, `/${n.personType === 'athlete' ? 'athletes' : 'staff'}/${n.personId}`)}
                            className="flex items-start w-full hover:bg-red-50 text-left transition-colors border-b border-gray-50"
                            style={{ gap: '0.12in', padding: '0.1in 0.2in' }}
                          >
                            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{n.personName}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{n.description}</p>
                              <p className="text-xs text-red-500 mt-1 font-medium">Due {n.returnByDate}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Low Inventory */}
                    {visibleLow.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest" style={{ padding: '0.12in 0.2in 0.05in' }}>Low Inventory</p>
                        {visibleLow.map((n) => (
                          <button
                            key={n.key}
                            onClick={() => handleNotifClick(n.key, `/inventory/${n.id}`)}
                            className="flex items-start w-full hover:bg-amber-50 text-left transition-colors border-b border-gray-50"
                            style={{ gap: '0.12in', padding: '0.1in 0.2in' }}
                          >
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Package className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{n.description}</p>
                              <p className="text-xs text-amber-600 mt-1 font-medium">{n.qtyOnHand} unit{n.qtyOnHand !== 1 ? 's' : ''} remaining</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Pending Orders */}
                    {visibleOrders.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest" style={{ padding: '0.12in 0.2in 0.05in' }}>Incomplete Orders</p>
                        {visibleOrders.map((n) => (
                          <button
                            key={n.key}
                            onClick={() => handleNotifClick(n.key, `/orders/${n.id}`)}
                            className="flex items-start w-full hover:bg-blue-50 text-left transition-colors border-b border-gray-50"
                            style={{ gap: '0.12in', padding: '0.1in 0.2in' }}
                          >
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                              <ShoppingCart className="w-3.5 h-3.5 text-[#00539F]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{n.refNumber}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{n.sport} · {n.vendor}</p>
                              <p className="text-xs text-[#00539F] mt-1 font-medium">{n.id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings (desktop — mobile reaches Settings via the More tab) */}
        <button
          onClick={() => navigate('/settings')}
          className="hidden md:block p-1.5 text-gray-300 hover:text-white"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu((v) => !v); setShowNotifMenu(false); setShowSports(false); }}
            className="flex items-center gap-1 hover:opacity-80"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFD200] flex items-center justify-center text-[#002855] text-xs font-bold">
              {initials}
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-xl shadow-xl z-50 w-64 border border-gray-100">
              {/* User info header */}
              <div className="flex items-center border-b border-gray-100" style={{ gap: '0.12in', padding: '0.15in 0.2in' }}>
                <div className="w-9 h-9 rounded-full bg-[#FFD200] flex items-center justify-center text-[#002855] text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '0.08in 0' }}>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="flex items-center w-full hover:bg-gray-50 text-gray-700 transition-colors"
                  style={{ gap: '0.12in', padding: '0.08in 0.2in' }}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Profile</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="flex items-center w-full hover:bg-gray-50 text-gray-700 transition-colors"
                  style={{ gap: '0.12in', padding: '0.08in 0.2in' }}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Settings className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Settings</span>
                </button>

                {/* Assigned Sports */}
                <div
                  onMouseEnter={() => { sportsTimer.current = setTimeout(() => setShowSports(true), 500); }}
                  onMouseLeave={() => { if (sportsTimer.current) clearTimeout(sportsTimer.current); setShowSports(false); }}
                >
                  <button
                    onClick={() => setShowSports((v) => !v)}
                    className="flex items-center justify-between w-full hover:bg-gray-50 text-gray-700 transition-colors"
                    style={{ gap: '0.12in', padding: '0.08in 0.2in' }}
                  >
                    <div className="flex items-center" style={{ gap: '0.12in' }}>
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Trophy className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="text-sm">Assigned Sports</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${showSports ? 'rotate-180' : ''}`} />
                  </button>
                  {showSports && (
                    <div className="bg-gray-50 border-t border-b border-gray-100" style={{ padding: '0.05in 0' }}>
                      {(user?.assignedSports ?? []).map((s) => (
                        <div key={s} className="text-xs text-gray-600" style={{ padding: '0.04in 0.2in 0.04in 0.55in' }}>{s}</div>
                      ))}
                      {(user?.assignedSports ?? []).length === 0 && (
                        <div className="text-xs text-gray-400 italic" style={{ padding: '0.04in 0.2in 0.04in 0.55in' }}>No sports assigned</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sign Out */}
              <div className="border-t border-gray-100" style={{ padding: '0.08in 0' }}>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="flex items-center w-full hover:bg-red-50 text-red-500 transition-colors"
                  style={{ gap: '0.12in', padding: '0.08in 0.2in' }}
                >
                  <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
