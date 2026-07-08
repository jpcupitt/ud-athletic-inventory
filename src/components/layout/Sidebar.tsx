import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog, BarChart3, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Inventory', to: '/inventory', icon: Package, end: false },
  { label: 'Orders', to: '/orders', icon: ShoppingCart, end: false },
  { label: 'Athletes', to: '/athletes', icon: Users, end: false },
  { label: 'Staff', to: '/staff', icon: UserCog, end: false },
  { label: 'Reports', to: '/reports', icon: BarChart3, end: false },
];

export default function Sidebar() {
  return (
    <aside className="w-52 shrink-0 bg-[#111827] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-white/10">
        <img src="/ud-athletics-logo-white.png" alt="Delaware Blue Hens" className="h-6 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-[#00539F] text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} style={{ width: '1.1rem', height: '1.1rem' }} />
                <span className="flex-1">{item.label}</span>
                {item.to !== '/' && item.to !== '/reports' && (
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white/70' : 'text-gray-600 group-hover:text-gray-400'}`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-gray-600">University of Delaware</p>
        <p className="text-xs text-gray-700">Athletic Equipment Inventory</p>
      </div>
    </aside>
  );
}
