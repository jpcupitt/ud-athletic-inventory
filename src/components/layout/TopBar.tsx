import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export default function TopBar() {
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
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 gap-4 shrink-0 z-40">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00539F] focus:bg-white transition-colors"
        />
      </form>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        onClick={() => navigate('/')}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Settings */}
      <button
        onClick={() => navigate('/')}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#00539F] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name.split(' ')[0]}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-50 w-64">
            <div className="flex items-center border-b border-gray-100" style={{ gap: '0.12in', padding: '0.15in 0.2in' }}>
              <div className="w-9 h-9 rounded-full bg-[#00539F] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
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
    </header>
  );
}
