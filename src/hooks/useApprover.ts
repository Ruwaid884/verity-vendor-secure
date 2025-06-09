
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useApprover = () => {
  const { user, profile } = useAuth();
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingVendors = async () => {
    if (!user || !profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          vendor_user:profiles!vendor_user_id(full_name, email),
          documents:vendor_documents(*)
        `)
        .eq('company_id', profile.company_id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setPendingVendors(data || []);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (vendorId: string, comments?: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approver_user_id: user?.id,
        })
        .eq('id', vendorId);

      if (error) throw error;

      // Log the approval action
      await supabase
        .from('audit_logs')
        .insert([{
          vendor_id: vendorId,
          user_id: user?.id,
          action: 'vendor_approved',
          details: { comments }
        }]);

      await fetchPendingVendors();
    } catch (error) {
      console.error('Error approving vendor:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectVendor = async (vendorId: string, comments?: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({
          status: 'rejected',
          approver_user_id: user?.id,
        })
        .eq('id', vendorId);

      if (error) throw error;

      // Log the rejection action
      await supabase
        .from('audit_logs')
        .insert([{
          vendor_id: vendorId,
          user_id: user?.id,
          action: 'vendor_rejected',
          details: { comments }
        }]);

      await fetchPendingVendors();
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'approver') {
      fetchPendingVendors();
    }
  }, [user, profile]);

  return {
    pendingVendors,
    loading,
    approveVendor,
    rejectVendor,
    refetch: fetchPendingVendors,
  };
};
