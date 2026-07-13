import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import MobileTabBar from './MobileTabBar';

export default function Layout() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      <NavBar />
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden md:overflow-x-auto overscroll-contain">
        <div className="px-6 py-5 md:p-[1in]">
          <Outlet />
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
}
