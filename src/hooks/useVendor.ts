
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VendorData {
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
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchVendor = async () => {
    if (!user || !profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_user_id', user.id)
        .eq('company_id', profile.company_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vendor:', error);
        return;
      }

      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateVendor = async (vendorData: VendorData) => {
    if (!user || !profile?.company_id) {
      throw new Error('User not authenticated or no company assigned');
    }

    try {
      setLoading(true);

      const dataToSave = {
        vendor_user_id: user.id,
        company_id: profile.company_id,
        company_name: vendorData.company_name,
        tax_id: vendorData.tax_id,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        zip_code: vendorData.zip_code,
        phone: vendorData.phone,
        website: vendorData.website,
        description: vendorData.description,
        bank_name: vendorData.bank_name,
        routing_number: vendorData.routing_number,
        account_number_encrypted: vendorData.account_number, // This should be encrypted in production
        account_type: vendorData.account_type,
      };

      let result;
      if (vendor?.id) {
        // Update existing vendor
        result = await supabase
          .from('vendors')
          .update(dataToSave)
          .eq('id', vendor.id)
          .select()
          .single();
      } else {
        // Create new vendor
        result = await supabase
          .from('vendors')
          .insert([dataToSave])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setVendor(result.data);
      return result.data;
    } catch (error) {
      console.error('Error saving vendor:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    if (!vendor?.id) {
      throw new Error('No vendor to submit');
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', vendor.id)
        .select()
        .single();

      if (error) throw error;

      setVendor(data);
      return data;
    } catch (error) {
      console.error('Error submitting vendor:', error);
      throw error;
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
    createOrUpdateVendor,
    submitForApproval,
    refetch: fetchVendor,
  };
};
