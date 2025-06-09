// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          action: string
          user_id: string | null
          vendor_id: string | null
          details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          action: string
          user_id?: string | null
          vendor_id?: string | null
          details?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          action?: string
          user_id?: string | null
          vendor_id?: string | null
          details?: Json | null
          created_at?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          admin_user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          admin_user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          admin_user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'vendor' | 'approver'
          company_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'vendor' | 'approver'
          company_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'vendor' | 'approver'
          company_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vendors: {
        Row: {
          id: string
          company_id: string
          company_name: string
          vendor_user_id: string | null
          status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | null
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          phone: string | null
          website: string | null
          tax_id: string | null
          bank_name: string | null
          routing_number: string | null
          account_number_encrypted: string | null
          account_type: string | null
          submitted_at: string | null
          approved_at: string | null
          approver_user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          company_name: string
          vendor_user_id?: string | null
          status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          phone?: string | null
          website?: string | null
          tax_id?: string | null
          bank_name?: string | null
          routing_number?: string | null
          account_number_encrypted?: string | null
          account_type?: string | null
          submitted_at?: string | null
          approved_at?: string | null
          approver_user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          company_name?: string
          vendor_user_id?: string | null
          status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          phone?: string | null
          website?: string | null
          tax_id?: string | null
          bank_name?: string | null
          routing_number?: string | null
          account_number_encrypted?: string | null
          account_type?: string | null
          submitted_at?: string | null
          approved_at?: string | null
          approver_user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vendor_documents: {
        Row: {
          id: string
          vendor_id: string | null
          document_type: 'w9' | 'insurance_certificate' | 'bank_verification' | 'business_license'
          file_name: string
          file_url: string | null
          status: 'pending' | 'verified' | 'flagged' | null
          uploaded_at: string | null
          verified_at: string | null
          verification_notes: string | null
        }
        Insert: {
          id?: string
          vendor_id?: string | null
          document_type: 'w9' | 'insurance_certificate' | 'bank_verification' | 'business_license'
          file_name: string
          file_url?: string | null
          status?: 'pending' | 'verified' | 'flagged' | null
          uploaded_at?: string | null
          verified_at?: string | null
          verification_notes?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string | null
          document_type?: 'w9' | 'insurance_certificate' | 'bank_verification' | 'business_license'
          file_name?: string
          file_url?: string | null
          status?: 'pending' | 'verified' | 'flagged' | null
          uploaded_at?: string | null
          verified_at?: string | null
          verification_notes?: string | null
        }
      }
    }
    Enums: {
      user_role: 'admin' | 'vendor' | 'approver'
      vendor_status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active'
      document_status: 'pending' | 'verified' | 'flagged'
      document_type: 'w9' | 'insurance_certificate' | 'bank_verification' | 'business_license'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T] 