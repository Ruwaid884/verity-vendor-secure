
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { VendorRegistration } from '@/components/vendor/VendorRegistration';
import { VendorApprover } from '@/components/vendor/VendorApprover';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleLogout = async () => {
    // This will be handled by the auth context
    navigate('/auth');
  };

  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard user={{ role: profile.role, name: profile.full_name }} onLogout={handleLogout} />;
      case 'vendor':
        return <VendorRegistration user={{ role: profile.role, name: profile.full_name }} onLogout={handleLogout} />;
      case 'approver':
        return <VendorApprover user={{ role: profile.role, name: profile.full_name }} onLogout={handleLogout} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderDashboard()}
    </div>
  );
};

export default Index;
