import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vendorApi, VendorResponse, VendorFilters, VendorsListResponse, ApiError } from '@/lib/api';

export const useAdmin = () => {
  const { user, profile } = useAuth();
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async (filters: VendorFilters = {}) => {
    if (!user || !profile?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      // Get all vendors for the company
      const response: VendorsListResponse = await vendorApi.getVendors({
        companyId: profile.company_id,
        ...filters,
      });

      setVendors(response.vendors);
      setPagination(response.pagination);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to fetch vendors');
      }
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVendorsByStatus = async (status: string) => {
    return fetchVendors({ status });
  };

  const searchVendors = async (searchTerm: string) => {
    return fetchVendors({ search: searchTerm });
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      setError(null);

      await vendorApi.deleteVendor(vendorId);
      
      // Update local state - remove from list
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit),
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        throw new Error(error.message);
      } else {
        setError('Failed to delete vendor');
        throw new Error('Failed to delete vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedVendor = await vendorApi.approveVendor(vendorId);
      
      // Update local state
      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId ? updatedVendor : vendor
        )
      );
      
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

      const updatedVendor = await vendorApi.rejectVendor(vendorId, reason);
      
      // Update local state
      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId ? updatedVendor : vendor
        )
      );
      
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

      const updatedVendor = await vendorApi.activateVendor(vendorId);
      
      // Update local state
      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === vendorId ? updatedVendor : vendor
        )
      );
      
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

  const loadPage = async (page: number) => {
    return fetchVendors({ page, limit: pagination.limit });
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchVendors();
    }
  }, [user, profile]);

  return {
    vendors,
    pagination,
    loading,
    error,
    fetchVendors,
    getVendorsByStatus,
    searchVendors,
    deleteVendor,
    approveVendor,
    rejectVendor,
    activateVendor,
    loadPage,
    refetch: () => fetchVendors(),
  };
}; 