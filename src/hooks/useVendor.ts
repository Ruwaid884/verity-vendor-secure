
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorData {
  id?: string;
  company_name: string;
  tax_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  website: string;
  description: string;
  bank_name: string;
  routing_number: string;
  account_number_encrypted: string;
  account_type: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active';
}

export const useVendor = () => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'vendor') {
      fetchVendorData();
    }
  }, [user, profile]);

  const fetchVendorData = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setVendorData(data);
        // Fetch uploaded documents
        const { data: documents } = await supabase
          .from('vendor_documents')
          .select('document_type')
          .eq('vendor_id', data.id);
        
        if (documents) {
          setUploadedFiles(documents.map(doc => doc.document_type));
        }
      }
    } catch (error: any) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVendorData = async (data: Partial<VendorData>) => {
    try {
      if (vendorData?.id) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update(data)
          .eq('id', vendorData.id);

        if (error) throw error;
      } else {
        // Create new vendor record
        const { data: newVendor, error } = await supabase
          .from('vendors')
          .insert({
            ...data,
            vendor_user_id: user?.id,
            company_id: profile?.company_id
          })
          .select()
          .single();

        if (error) throw error;
        setVendorData(newVendor);
      }

      toast({
        title: "Success",
        description: "Vendor data saved successfully"
      });
      
      await fetchVendorData();
    } catch (error: any) {
      console.error('Error saving vendor data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vendor data",
        variant: "destructive"
      });
    }
  };

  const submitForApproval = async () => {
    try {
      if (!vendorData?.id) {
        throw new Error('No vendor data to submit');
      }

      const { error } = await supabase
        .from('vendors')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', vendorData.id);

      if (error) throw error;

      // Log audit trail
      await supabase.from('audit_logs').insert({
        vendor_id: vendorData.id,
        user_id: user?.id,
        action: 'vendor_submitted',
        details: { message: 'Vendor submitted for approval' }
      });

      toast({
        title: "Submitted",
        description: "Your information has been submitted for approval"
      });

      await fetchVendorData();
    } catch (error: any) {
      console.error('Error submitting vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit for approval",
        variant: "destructive"
      });
    }
  };

  const uploadDocument = async (documentType: string, file: File) => {
    try {
      // For now, just simulate file upload
      setUploadedFiles(prev => [...prev, documentType]);
      
      toast({
        title: "Document Uploaded",
        description: `${documentType} has been uploaded successfully`
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  return {
    vendorData,
    uploadedFiles,
    loading,
    saveVendorData,
    submitForApproval,
    uploadDocument,
    refetch: fetchVendorData
  };
};
