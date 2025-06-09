import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert } from '@/types/database.types';

export interface IAuditLogRepository {
  create(data: CreateAuditLogDto): Promise<Tables<'audit_logs'>>;
  findByVendorId(vendorId: string): Promise<Tables<'audit_logs'>[]>;
  findByUserId(userId: string): Promise<Tables<'audit_logs'>[]>;
  findRecent(limit?: number): Promise<Tables<'audit_logs'>[]>;
}

export interface CreateAuditLogDto {
  action: string;
  user_id?: string | null;
  vendor_id?: string | null;
  details?: any;
}

export class AuditLogRepository implements IAuditLogRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: CreateAuditLogDto): Promise<Tables<'audit_logs'>> {
    const auditLog: TablesInsert<'audit_logs'> = {
      action: data.action,
      user_id: data.user_id || null,
      vendor_id: data.vendor_id || null,
      details: data.details || null,
    };

    const { data: result, error } = await this.supabase
      .from('audit_logs')
      .insert(auditLog)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to create audit log: ${error?.message}`);
    }

    return result;
  }

  async findByVendorId(vendorId: string): Promise<Tables<'audit_logs'>[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  async findByUserId(userId: string): Promise<Tables<'audit_logs'>[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  async findRecent(limit: number = 100): Promise<Tables<'audit_logs'>[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent audit logs: ${error.message}`);
    }

    return data || [];
  }
} 