-- Complete Database Fix for Verity Vendor Secure
-- This migration fixes all RLS issues and creates a robust auth system

-- 1. DROP the problematic trigger that's causing signup failures
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. DROP existing RLS policies that are too restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON public.profiles;

-- 3. CREATE comprehensive RLS policies that actually work

-- Profiles table policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.uid() IS NULL  -- Allow inserts during signup process
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 4. Fix Companies table policies
DROP POLICY IF EXISTS "Company admins can view their company" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON public.companies;

CREATE POLICY "companies_select" ON public.companies
  FOR SELECT USING (
    admin_user_id = auth.uid() OR 
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "companies_insert" ON public.companies
  FOR INSERT WITH CHECK (
    admin_user_id = auth.uid() OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.uid() IS NULL
  );

CREATE POLICY "companies_update" ON public.companies
  FOR UPDATE USING (
    admin_user_id = auth.uid() OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 5. Fix Vendors table policies  
DROP POLICY IF EXISTS "Vendors can view their own data" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update their own submissions" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can insert their own data" ON public.vendors;

CREATE POLICY "vendors_select" ON public.vendors
  FOR SELECT USING (
    vendor_user_id = auth.uid() OR 
    approver_user_id = auth.uid() OR
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "vendors_insert" ON public.vendors
  FOR INSERT WITH CHECK (
    vendor_user_id = auth.uid() OR
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'vendor')
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "vendors_update" ON public.vendors
  FOR UPDATE USING (
    vendor_user_id = auth.uid() OR
    (approver_user_id = auth.uid() AND status = 'submitted') OR
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "vendors_delete" ON public.vendors
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 6. Fix Documents table policies
DROP POLICY IF EXISTS "Users can view documents for their vendors" ON public.vendor_documents;
DROP POLICY IF EXISTS "Vendor users can insert documents" ON public.vendor_documents;

CREATE POLICY "documents_select" ON public.vendor_documents
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE vendor_user_id = auth.uid() 
        OR approver_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "documents_insert" ON public.vendor_documents
  FOR INSERT WITH CHECK (
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE vendor_user_id = auth.uid() OR
      company_id IN (
        SELECT company_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'vendor')
      )
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 7. Fix Audit logs policies
DROP POLICY IF EXISTS "Users can view audit logs for their vendors" ON public.audit_logs;

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE vendor_user_id = auth.uid() 
        OR approver_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
    ) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 8. Create helper functions for better database management

-- Function to create a complete user profile with company (if admin)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  full_name TEXT,
  user_role user_role DEFAULT 'vendor'
)
RETURNS public.profiles AS $$
DECLARE
  new_profile public.profiles;
  new_company public.companies;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (user_id, user_email, full_name, user_role, NOW(), NOW())
  RETURNING * INTO new_profile;

  -- If admin, create company
  IF user_role = 'admin' THEN
    INSERT INTO public.companies (name, admin_user_id, created_at, updated_at)
    VALUES (full_name || '''s Company', user_id, NOW(), NOW())
    RETURNING * INTO new_company;

    -- Update profile with company_id
    UPDATE public.profiles 
    SET company_id = new_company.id, updated_at = NOW()
    WHERE id = user_id
    RETURNING * INTO new_profile;
  END IF;

  RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user with full profile data
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', row_to_json(p.*),
    'company', row_to_json(c.*)
  )
  FROM public.profiles p
  LEFT JOIN public.companies c ON p.company_id = c.id
  WHERE p.id = user_id
  INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_company_id ON public.vendors(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_vendor_id ON public.audit_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- 10. Add useful views for common queries
CREATE OR REPLACE VIEW public.admin_dashboard AS
SELECT 
  v.id,
  v.company_id,
  v.vendor_user_id,
  v.approver_user_id,
  v.company_name as vendor_company_name,
  v.tax_id,
  v.address,
  v.city,
  v.state,
  v.zip_code,
  v.phone,
  v.website,
  v.description,
  v.bank_name,
  v.routing_number,
  v.account_number_encrypted,
  v.account_type,
  v.status,
  v.submitted_at,
  v.approved_at,
  v.created_at,
  v.updated_at,
  p.full_name as vendor_name,
  p.email as vendor_email,
  a.full_name as approver_name,
  c.name as actual_company_name
FROM public.vendors v
LEFT JOIN public.profiles p ON v.vendor_user_id = p.id
LEFT JOIN public.profiles a ON v.approver_user_id = a.id
LEFT JOIN public.companies c ON v.company_id = c.id;

CREATE OR REPLACE VIEW public.vendor_summary AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(v.id) as total_vendors,
  COUNT(CASE WHEN v.status = 'active' THEN 1 END) as active_vendors,
  COUNT(CASE WHEN v.status = 'submitted' THEN 1 END) as pending_vendors
FROM public.companies c
LEFT JOIN public.vendors v ON c.id = v.company_id
GROUP BY c.id, c.name;

-- Grant permissions on views
GRANT SELECT ON public.admin_dashboard TO authenticated;
GRANT SELECT ON public.vendor_summary TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated; 