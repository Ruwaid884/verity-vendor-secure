import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vendorApi, VendorResponse, ApiError } from '@/lib/api';

export const useApprover = () => {
  const { user, profile } = useAuth();
  const [pendingVendors, setPendingVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingVendors = async () => {
    if (!user || !profile?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      // Get pending vendors from the backend API
      const vendors = await vendorApi.getPendingApprovals();
      
      // Filter by company if needed (the backend should handle this, but as a safeguard)
      const companyVendors = vendors.filter(vendor => vendor.company_id === profile.company_id);
      
      setPendingVendors(companyVendors);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to fetch pending vendors');
      }
      console.error('Error fetching pending vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (vendorId: string, comments?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Approve vendor via backend API
      const updatedVendor = await vendorApi.approveVendor(vendorId);
      
      // Update local state - remove from pending list
      setPendingVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      
      return updatedVendor;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        throw new Error(error.message);
      } else {
        setError('Failed to approve vendor');
        throw new Error('Failed to approve vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  const rejectVendor = async (vendorId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Reject vendor via backend API
      const updatedVendor = await vendorApi.rejectVendor(vendorId, reason);
      
      // Update local state - remove from pending list
      setPendingVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      
      return updatedVendor;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        throw new Error(error.message);
      } else {
        setError('Failed to reject vendor');
        throw new Error('Failed to reject vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  const activateVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Activate vendor via backend API
      const updatedVendor = await vendorApi.activateVendor(vendorId);
      
      return updatedVendor;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        throw new Error(error.message);
      } else {
        setError('Failed to activate vendor');
        throw new Error('Failed to activate vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, [user, profile]);

  return {
    pendingVendors,
    loading,
    error,
    approveVendor,
    rejectVendor,
    activateVendor,
    refetch: fetchPendingVendors,
  };
};
