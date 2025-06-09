
import { useState } from 'react';
import { LoginPage } from '../components/auth/LoginPage';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { VendorRegistration } from '../components/vendor/VendorRegistration';
import { VendorApprover } from '../components/vendor/VendorApprover';

export type UserRole = 'admin' | 'vendor' | 'approver' | null;

const Index = () => {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; name: string } | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'dashboard'>('login');

  const handleLogin = (role: UserRole, name: string) => {
    setCurrentUser({ role, name });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case 'vendor':
        return <VendorRegistration user={currentUser} onLogout={handleLogout} />;
      case 'approver':
        return <VendorApprover user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {currentView === 'login' ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        renderDashboard()
      )}
    </div>
  );
};

export default Index;
