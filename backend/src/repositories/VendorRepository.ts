import { SupabaseClient } from '@supabase/supabase-js';
import { Database, TablesUpdate } from '@/types/database.types';
import { VendorEntity } from '@/entities/Vendor.entity';

export interface IVendorRepository {
  findById(id: string): Promise<VendorEntity | null>;
  findByCompanyId(companyId: string): Promise<VendorEntity[]>;
  findByStatus(status: string): Promise<VendorEntity[]>;
  findByVendorUserId(vendorUserId: string): Promise<VendorEntity[]>;
  create(vendor: VendorEntity): Promise<VendorEntity>;
  update(id: string, data: TablesUpdate<'vendors'>): Promise<VendorEntity>;
  delete(id: string): Promise<boolean>;
  findAll(filters?: VendorFilters): Promise<VendorEntity[]>;
  count(filters?: VendorFilters): Promise<number>;
  findPendingApproval(): Promise<VendorEntity[]>;
}

export interface VendorFilters {
  companyId?: string;
  status?: string;
  vendorUserId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class VendorRepository implements IVendorRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findById(id: string): Promise<VendorEntity | null> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return new VendorEntity(data);
  }

  async findByCompanyId(companyId: string): Promise<VendorEntity[]> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(vendor => new VendorEntity(vendor));
  }

  async findByStatus(status: string): Promise<VendorEntity[]> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(vendor => new VendorEntity(vendor));
  }

  async findByVendorUserId(vendorUserId: string): Promise<VendorEntity[]> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('*')
      .eq('vendor_user_id', vendorUserId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(vendor => new VendorEntity(vendor));
  }

  async create(vendor: VendorEntity): Promise<VendorEntity> {
    const vendorData = vendor.toDatabase();
    const { data, error } = await this.supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create vendor: ${error?.message}`);
    }

    return new VendorEntity(data);
  }

  async update(id: string, updateData: TablesUpdate<'vendors'>): Promise<VendorEntity> {
    const { data, error } = await this.supabase
      .from('vendors')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update vendor: ${error?.message}`);
    }

    return new VendorEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    return !error;
  }

  async findAll(filters: VendorFilters = {}): Promise<VendorEntity[]> {
    let query = this.supabase.from('vendors').select('*');

    // Apply filters
    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.vendorUserId) {
      query = query.eq('vendor_user_id', filters.vendorUserId);
    }

    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    // Order by created_at
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map(vendor => new VendorEntity(vendor));
  }

  async count(filters: VendorFilters = {}): Promise<number> {
    let query = this.supabase.from('vendors').select('*', { count: 'exact', head: true });

    // Apply same filters as findAll
    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.vendorUserId) {
      query = query.eq('vendor_user_id', filters.vendorUserId);
    }

    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count vendors: ${error.message}`);
    }

    return count || 0;
  }

  // Additional utility methods
  async findPendingApproval(): Promise<VendorEntity[]> {
    return this.findByStatus('submitted');
  }

  async findApprovedVendors(companyId?: string): Promise<VendorEntity[]> {
    const filters: VendorFilters = { status: 'approved' };
    if (companyId) {
      filters.companyId = companyId;
    }
    return this.findAll(filters);
  }

  async findActiveVendors(companyId?: string): Promise<VendorEntity[]> {
    const filters: VendorFilters = { status: 'active' };
    if (companyId) {
      filters.companyId = companyId;
    }
    return this.findAll(filters);
  }
} 