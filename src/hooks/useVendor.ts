import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vendorApi, VendorData, VendorResponse, ApiError } from '@/lib/api';

interface VendorFormData {
  company_name: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  website?: string;
  description?: string;
  bank_name?: string;
  routing_number?: string;
  account_number?: string;
  account_type?: string;
}

export const useVendor = () => {
  const { user, profile } = useAuth();
  const [vendor, setVendor] = useState<VendorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = async () => {
    if (!user || !profile?.company_id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get vendors for this user and company
      const response = await vendorApi.getVendors({
        companyId: profile.company_id,
        vendorUserId: user.id,
        limit: 1
      });

      // Get the first vendor if exists
      const vendorData = response.vendors.length > 0 ? response.vendors[0] : null;
      setVendor(vendorData);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to fetch vendor data');
      }
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateVendor = async (vendorData: VendorFormData) => {
    if (!user || !profile?.company_id) {
      throw new Error('User not authenticated or missing company ID');
    }

    try {
      setLoading(true);
      setError(null);

      // Convert form data to API format
      const apiData: VendorData = {
        companyId: profile.company_id,
        companyName: vendorData.company_name,
        vendorUserId: user.id,
        description: vendorData.description,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        zipCode: vendorData.zip_code,
        phone: vendorData.phone,
        website: vendorData.website,
        taxId: vendorData.tax_id,
        bankName: vendorData.bank_name,
        routingNumber: vendorData.routing_number,
        accountNumber: vendorData.account_number,
        accountType: vendorData.account_type,
      };

      let updatedVendor: VendorResponse;

      if (vendor) {
        // Update existing vendor
        updatedVendor = await vendorApi.updateVendor(vendor.id, apiData);
      } else {
        // Create new vendor
        updatedVendor = await vendorApi.createVendor(apiData);
      }

      setVendor(updatedVendor);
      return updatedVendor;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        throw new Error(error.message);
      } else {
        setError('Failed to save vendor data');
        throw new Error('Failed to save vendor data');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    if (!vendor) {
      throw new Error('No vendor to submit');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedVendor = await vendorApi.submitVendor(vendor.id);
      setVendor(updatedVendor);
      return updatedVendor;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        throw new Error(error.message);
      } else {
        setError('Failed to submit vendor for approval');
        throw new Error('Failed to submit vendor for approval');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async () => {
    if (!vendor) {
      throw new Error('No vendor to delete');
    }

    try {
      setLoading(true);
      setError(null);

      await vendorApi.deleteVendor(vendor.id);
      setVendor(null);
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

  useEffect(() => {
    fetchVendor();
  }, [user, profile]);

  return {
    vendor,
    loading,
    error,
    createOrUpdateVendor,
    submitForApproval,
    deleteVendor,
    refetch: fetchVendor,
  };
};
