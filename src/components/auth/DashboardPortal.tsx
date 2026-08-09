import { AuthProvider } from '../../context/AuthContext';
import { AdminGate } from './AdminGate';
import Dashboard from '../../pages/Dashboard';

export default function DashboardPortal() {
  return (
    <AuthProvider>
      <AdminGate>
        <Dashboard />
      </AdminGate>
    </AuthProvider>
  );
}
