import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserPrefsProvider } from './context/UserPrefsContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/Inventory/InventoryList';
import InventoryDetail from './pages/Inventory/InventoryDetail';
import OrdersList from './pages/Orders/OrdersList';
import OrderDetail from './pages/Orders/OrderDetail';
import AthletesList from './pages/Athletes/AthletesList';
import AthleteProfile from './pages/Athletes/AthleteProfile';
import StaffList from './pages/Staff/StaffList';
import StaffProfile from './pages/Staff/StaffProfile';
import OnHandReport from './pages/Reports/OnHandReport';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1e2a3a] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <UserPrefsProvider>
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
          <Route path="/reports" element={<OnHandReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </UserPrefsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
