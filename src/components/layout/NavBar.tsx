import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Orders', to: '/orders' },
  { label: 'Athletes', to: '/athletes' },
  { label: 'Staff', to: '/staff' },
  { label: 'Reports', to: '/reports' },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const { count: notifCount } = useNotifications();
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/inventory?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EQ';

  return (
    <nav className="bg-[#1e2a3a] text-white flex items-center px-4 h-14 gap-4 shrink-0 relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 shrink-0">
        <div className="w-8 h-8 bg-[#0057a8] rounded flex items-center justify-center text-white font-bold text-sm">
          EQ
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#0057a8] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Global Item Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#2d3f52] text-white text-sm pl-8 pr-3 py-1.5 rounded w-52 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0057a8]"
        />
      </form>

      {/* Notification bell */}
      <button
        onClick={() => navigate('/')}
        className="relative p-1.5 text-gray-300 hover:text-white"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
            {notifCount}
          </span>
        )}
      </button>

      {/* Settings */}
      <button
        onClick={() => navigate('/')}
        className="p-1.5 text-gray-300 hover:text-white"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* User avatar + dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className="flex items-center gap-1 hover:opacity-80"
        >
          <div className="w-8 h-8 rounded-full bg-[#0057a8] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded shadow-lg py-1 w-44 z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); logout(); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
