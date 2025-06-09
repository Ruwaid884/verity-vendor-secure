import { Tables, TablesInsert, TablesUpdate, Enums } from '@/types/database.types';
import { v4 as uuidv4 } from 'uuid';

export class VendorEntity {
  public readonly id: string;
  public companyId: string;
  public companyName: string;
  public vendorUserId: string | null;
  public status: Enums<'vendor_status'> | null;
  public description: string | null;
  public address: string | null;
  public city: string | null;
  public state: string | null;
  public zipCode: string | null;
  public phone: string | null;
  public website: string | null;
  public taxId: string | null;
  public bankName: string | null;
  public routingNumber: string | null;
  public accountNumberEncrypted: string | null;
  public accountType: string | null;
  public submittedAt: Date | null;
  public approvedAt: Date | null;
  public approverUserId: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(data: Tables<'vendors'>) {
    this.id = data.id;
    this.companyId = data.company_id;
    this.companyName = data.company_name;
    this.vendorUserId = data.vendor_user_id;
    this.status = data.status;
    this.description = data.description;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.zipCode = data.zip_code;
    this.phone = data.phone;
    this.website = data.website;
    this.taxId = data.tax_id;
    this.bankName = data.bank_name;
    this.routingNumber = data.routing_number;
    this.accountNumberEncrypted = data.account_number_encrypted;
    this.accountType = data.account_type;
    this.submittedAt = data.submitted_at ? new Date(data.submitted_at) : null;
    this.approvedAt = data.approved_at ? new Date(data.approved_at) : null;
    this.approverUserId = data.approver_user_id;
    this.createdAt = new Date(data.created_at || Date.now());
    this.updatedAt = new Date(data.updated_at || Date.now());
  }

  static create(data: Omit<TablesInsert<'vendors'>, 'id' | 'created_at' | 'updated_at'>): VendorEntity {
    const now = new Date().toISOString();
    const vendorData: Tables<'vendors'> = {
      id: uuidv4(),
      company_id: data.company_id,
      company_name: data.company_name,
      vendor_user_id: data.vendor_user_id || null,
      status: data.status || 'draft',
      description: data.description || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      phone: data.phone || null,
      website: data.website || null,
      tax_id: data.tax_id || null,
      bank_name: data.bank_name || null,
      routing_number: data.routing_number || null,
      account_number_encrypted: data.account_number_encrypted || null,
      account_type: data.account_type || null,
      submitted_at: data.submitted_at || null,
      approved_at: data.approved_at || null,
      approver_user_id: data.approver_user_id || null,
      created_at: now,
      updated_at: now,
    };

    return new VendorEntity(vendorData);
  }

  // Business logic methods
  canSubmit(): boolean {
    return this.status === 'draft' && this.hasRequiredFields();
  }

  canApprove(): boolean {
    return this.status === 'submitted';
  }

  canReject(): boolean {
    return this.status === 'submitted';
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  hasRequiredFields(): boolean {
    return !!(
      this.companyName &&
      this.address &&
      this.city &&
      this.state &&
      this.zipCode &&
      this.taxId
    );
  }

  hasBankingInfo(): boolean {
    return !!(
      this.bankName &&
      this.routingNumber &&
      this.accountNumberEncrypted &&
      this.accountType
    );
  }

  submit(): void {
    if (!this.canSubmit()) {
      throw new Error('Vendor cannot be submitted in current state');
    }
    this.status = 'submitted';
    this.submittedAt = new Date();
    this.updatedAt = new Date();
  }

  approve(approverUserId: string): void {
    if (!this.canApprove()) {
      throw new Error('Vendor cannot be approved in current state');
    }
    this.status = 'approved';
    this.approvedAt = new Date();
    this.approverUserId = approverUserId;
    this.updatedAt = new Date();
  }

  reject(): void {
    if (!this.canReject()) {
      throw new Error('Vendor cannot be rejected in current state');
    }
    this.status = 'rejected';
    this.updatedAt = new Date();
  }

  activate(): void {
    if (this.status !== 'approved') {
      throw new Error('Only approved vendors can be activated');
    }
    this.status = 'active';
    this.updatedAt = new Date();
  }

  update(data: Partial<TablesUpdate<'vendors'>>): void {
    if (data.company_name !== undefined) this.companyName = data.company_name;
    if (data.description !== undefined) this.description = data.description;
    if (data.address !== undefined) this.address = data.address;
    if (data.city !== undefined) this.city = data.city;
    if (data.state !== undefined) this.state = data.state;
    if (data.zip_code !== undefined) this.zipCode = data.zip_code;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.website !== undefined) this.website = data.website;
    if (data.tax_id !== undefined) this.taxId = data.tax_id;
    if (data.bank_name !== undefined) this.bankName = data.bank_name;
    if (data.routing_number !== undefined) this.routingNumber = data.routing_number;
    if (data.account_number_encrypted !== undefined) this.accountNumberEncrypted = data.account_number_encrypted;
    if (data.account_type !== undefined) this.accountType = data.account_type;
    
    this.updatedAt = new Date();
  }

  // Convert to database format
  toDatabase(): Tables<'vendors'> {
    return {
      id: this.id,
      company_id: this.companyId,
      company_name: this.companyName,
      vendor_user_id: this.vendorUserId,
      status: this.status,
      description: this.description,
      address: this.address,
      city: this.city,
      state: this.state,
      zip_code: this.zipCode,
      phone: this.phone,
      website: this.website,
      tax_id: this.taxId,
      bank_name: this.bankName,
      routing_number: this.routingNumber,
      account_number_encrypted: this.accountNumberEncrypted,
      account_type: this.accountType,
      submitted_at: this.submittedAt?.toISOString() || null,
      approved_at: this.approvedAt?.toISOString() || null,
      approver_user_id: this.approverUserId,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  // Convert to public format (excluding sensitive data)
  toPublic(): Omit<Tables<'vendors'>, 'account_number_encrypted'> {
    const data = this.toDatabase();
    const { account_number_encrypted, ...publicData } = data;
    return publicData;
  }
} 