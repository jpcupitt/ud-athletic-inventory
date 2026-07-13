import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, MoreHorizontal, UserCog, BarChart3, Settings, LogOut, Shirt, ClipboardCheck, PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Inventory', to: '/inventory', icon: Package },
  { label: 'Orders', to: '/orders', icon: ShoppingCart },
  { label: 'Athletes', to: '/athletes', icon: Users },
];

const MORE_LINKS = [
  { label: 'Staff', to: '/staff', icon: UserCog },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const EQUIPMENT_ROOM_LINKS = [
  { label: 'Fitting Day', to: '/fitting', icon: Shirt },
  { label: 'Return Day', to: '/returns', icon: ClipboardCheck },
  { label: 'Smart Reorder', to: '/reorder', icon: PackagePlus },
];

export default function MobileTabBar() {
  const { user, logout } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const moreActive = [...MORE_LINKS, ...EQUIPMENT_ROOM_LINKS].some((l) => location.pathname.startsWith(l.to));

  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EQ';

  return (
    <div className="md:hidden">
      {/* More sheet */}
      {showMore && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-1 rounded-full bg-gray-300 mx-auto mt-2.5 mb-1" />

            {/* User card */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#FFD200] flex items-center justify-center text-[#002855] text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="py-1">
              {MORE_LINKS.map((link) => {
                const Icon = link.icon;
                const active = location.pathname.startsWith(link.to);
                return (
                  <button
                    key={link.to}
                    onClick={() => { setShowMore(false); navigate(link.to); }}
                    className={`flex items-center gap-3 w-full px-5 min-h-12 text-left transition-colors ${active ? 'bg-[#EFF6FF] text-[#00539F] font-semibold' : 'text-gray-700 active:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Equipment Room tools */}
            <div className="border-t border-gray-100 py-1">
              <p className="px-5 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Equipment Room</p>
              {EQUIPMENT_ROOM_LINKS.map((link) => {
                const Icon = link.icon;
                const active = location.pathname.startsWith(link.to);
                return (
                  <button
                    key={link.to}
                    onClick={() => { setShowMore(false); navigate(link.to); }}
                    className={`flex items-center gap-3 w-full px-5 min-h-12 text-left transition-colors ${active ? 'bg-[#EFF6FF] text-[#00539F] font-semibold' : 'text-gray-700 active:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => { setShowMore(false); logout(); }}
                className="flex items-center gap-3 w-full px-5 min-h-12 text-left text-red-500 active:bg-red-50"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="bg-[#002855] border-t border-white/10 flex shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              onClick={() => setShowMore(false)}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 ${
                  isActive && !showMore ? 'text-[#FFD200]' : 'text-gray-300 active:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setShowMore((v) => !v)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 ${
            showMore || moreActive ? 'text-[#FFD200]' : 'text-gray-300 active:text-white'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>
    </div>
  );
}
