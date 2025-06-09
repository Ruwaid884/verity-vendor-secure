
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'approver');
CREATE TYPE vendor_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'active');
CREATE TYPE document_type AS ENUM ('w9', 'insurance_certificate', 'bank_verification', 'business_license');
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'flagged');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'vendor',
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  admin_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  vendor_user_id UUID REFERENCES public.profiles(id),
  approver_user_id UUID REFERENCES public.profiles(id),
  company_name TEXT NOT NULL,
  tax_id TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  bank_name TEXT,
  routing_number TEXT,
  account_number_encrypted TEXT,
  account_type TEXT,
  status vendor_status DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.vendor_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  status document_status DEFAULT 'pending',
  verification_notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Create audit trail table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.vendors(id),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for company_id in profiles
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_company 
  FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for companies
CREATE POLICY "Company admins can view their company" ON public.companies
  FOR SELECT USING (
    admin_user_id = auth.uid() OR 
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Company admins can update their company" ON public.companies
  FOR UPDATE USING (admin_user_id = auth.uid());

-- Create RLS policies for vendors
CREATE POLICY "Vendors can view their own data" ON public.vendors
  FOR SELECT USING (
    vendor_user_id = auth.uid() OR 
    approver_user_id = auth.uid() OR
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Vendors can update their own submissions" ON public.vendors
  FOR UPDATE USING (
    vendor_user_id = auth.uid() OR
    (approver_user_id = auth.uid() AND status = 'submitted') OR
    (company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "Vendors can insert their own data" ON public.vendors
  FOR INSERT WITH CHECK (vendor_user_id = auth.uid());

-- Create RLS policies for documents
CREATE POLICY "Users can view documents for their vendors" ON public.vendor_documents
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE vendor_user_id = auth.uid() 
        OR approver_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
    )
  );

CREATE POLICY "Vendor users can insert documents" ON public.vendor_documents
  FOR INSERT WITH CHECK (
    vendor_id IN (SELECT id FROM public.vendors WHERE vendor_user_id = auth.uid())
  );

-- Create RLS policies for audit logs
CREATE POLICY "Users can view audit logs for their vendors" ON public.audit_logs
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE vendor_user_id = auth.uid() 
        OR approver_user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendor')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON public.companies 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON public.vendors 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
