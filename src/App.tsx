import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserPrefsProvider } from './context/UserPrefsContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/Inventory/InventoryList';
import InventoryDetail from './pages/Inventory/InventoryDetail';
import OrdersList from './pages/Orders/OrdersList';
import OrderDetail from './pages/Orders/OrderDetail';
import AthletesList from './pages/Athletes/AthletesList';
import AthleteProfile from './pages/Athletes/AthleteProfile';
import StaffList from './pages/Staff/StaffList';
import StaffProfile from './pages/Staff/StaffProfile';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings';
import ReturnDay from './pages/ReturnDay';
import FittingDay from './pages/FittingDay';
import SmartReorder from './pages/SmartReorder';
import { SubmittedOrdersProvider } from './context/SubmittedOrdersContext';
import { SportProvider } from './context/SportContext';
import { InventoryProvider } from './context/InventoryContext';
import { OrdersProvider } from './context/OrdersContext';
import { AthletesProvider } from './context/AthletesContext';
import { StaffProvider } from './context/StaffContext';

function AppRoutes() {
  const { user, isLoading, page } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#003c71] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return page === 'signup' ? <SignUp /> : <Login />;

  return (
    <InventoryProvider>
    <OrdersProvider>
    <AthletesProvider>
    <StaffProvider>
    <SubmittedOrdersProvider>
    <UserPrefsProvider>
    <SportProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/:itemId" element={<InventoryDetail />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/athletes" element={<AthletesList />} />
          <Route path="/athletes/:athleteId" element={<AthleteProfile />} />
          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/:staffId" element={<StaffProfile />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/returns" element={<ReturnDay />} />
          <Route path="/fitting" element={<FittingDay />} />
          <Route path="/reorder" element={<SmartReorder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SportProvider>
    </UserPrefsProvider>
    </SubmittedOrdersProvider>
    </StaffProvider>
    </AthletesProvider>
    </OrdersProvider>
    </InventoryProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Navy strip behind the iPhone status bar (clock) — zero height everywhere
          except installed/standalone mode on a device with a notch. */}
      <div
        className="fixed top-0 inset-x-0 z-[100] pointer-events-none"
        style={{ height: 'env(safe-area-inset-top)', backgroundColor: '#003c71' }}
      />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
