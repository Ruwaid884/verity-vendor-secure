import { VendorEntity } from '@/entities/Vendor.entity';
import { IVendorRepository, VendorFilters } from '@/repositories/VendorRepository';
import { IAuditLogRepository } from '@/repositories/AuditLogRepository';
import { TablesUpdate } from '@/types/database.types';

export interface IVendorService {
  createVendor(data: CreateVendorDto, userId: string): Promise<VendorEntity>;
  updateVendor(id: string, data: UpdateVendorDto, userId: string): Promise<VendorEntity>;
  submitVendor(id: string, userId: string): Promise<VendorEntity>;
  approveVendor(id: string, approverId: string): Promise<VendorEntity>;
  rejectVendor(id: string, approverId: string, reason?: string): Promise<VendorEntity>;
  activateVendor(id: string, userId: string): Promise<VendorEntity>;
  getVendor(id: string): Promise<VendorEntity | null>;
  getVendors(filters: VendorFilters): Promise<{ vendors: VendorEntity[]; total: number }>;
  deleteVendor(id: string, userId: string): Promise<boolean>;
  getVendorsByCompany(companyId: string): Promise<VendorEntity[]>;
  getPendingApprovals(): Promise<VendorEntity[]>;
}

export interface CreateVendorDto {
  companyId: string;
  companyName: string;
  vendorUserId?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string; // Will be encrypted
  accountType?: string;
}

export interface UpdateVendorDto {
  companyName?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string; // Will be encrypted
  accountType?: string;
}

export class VendorService implements IVendorService {
  constructor(
    private vendorRepository: IVendorRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async createVendor(data: CreateVendorDto, userId: string): Promise<VendorEntity> {
    // Validate required fields
    if (!data.companyId || !data.companyName) {
      throw new Error('Company ID and name are required');
    }

    // Encrypt account number if provided
    const accountNumberEncrypted = data.accountNumber 
      ? await this.encryptAccountNumber(data.accountNumber)
      : null;

    // Create vendor entity
    const vendor = VendorEntity.create({
      company_id: data.companyId,
      company_name: data.companyName,
      vendor_user_id: data.vendorUserId || null,
      description: data.description || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zipCode || null,
      phone: data.phone || null,
      website: data.website || null,
      tax_id: data.taxId || null,
      bank_name: data.bankName || null,
      routing_number: data.routingNumber || null,
      account_number_encrypted: accountNumberEncrypted,
      account_type: data.accountType || null,
    });

    // Save to database
    const savedVendor = await this.vendorRepository.create(vendor);

    // Log the action
    await this.auditLogRepository.create({
      action: 'VENDOR_CREATED',
      user_id: userId,
      vendor_id: savedVendor.id,
      details: { company_name: data.companyName },
    });

    return savedVendor;
  }

  async updateVendor(id: string, data: UpdateVendorDto, userId: string): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Check if vendor can be updated
    if (vendor.status === 'submitted' || vendor.status === 'approved') {
      throw new Error('Cannot update vendor in current status');
    }

    // Prepare update data
    const updateData: TablesUpdate<'vendors'> = {};
    
    if (data.companyName !== undefined) updateData.company_name = data.companyName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipCode !== undefined) updateData.zip_code = data.zipCode;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.taxId !== undefined) updateData.tax_id = data.taxId;
    if (data.bankName !== undefined) updateData.bank_name = data.bankName;
    if (data.routingNumber !== undefined) updateData.routing_number = data.routingNumber;
    if (data.accountType !== undefined) updateData.account_type = data.accountType;

    // Handle account number encryption
    if (data.accountNumber !== undefined) {
      updateData.account_number_encrypted = data.accountNumber 
        ? await this.encryptAccountNumber(data.accountNumber)
        : null;
    }

    // Update vendor
    const updatedVendor = await this.vendorRepository.update(id, updateData);

    // Log the action
    await this.auditLogRepository.create({
      action: 'VENDOR_UPDATED',
      user_id: userId,
      vendor_id: id,
      details: { updates: Object.keys(updateData) },
    });

    return updatedVendor;
  }

  async submitVendor(id: string, userId: string): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Use entity business logic
    vendor.submit();

    // Update in database
    const updatedVendor = await this.vendorRepository.update(id, {
      status: vendor.status,
      submitted_at: vendor.submittedAt?.toISOString() || null,
    });

    // Log the action
    await this.auditLogRepository.create({
      action: 'VENDOR_SUBMITTED',
      user_id: userId,
      vendor_id: id,
      details: { company_name: vendor.companyName },
    });

    return updatedVendor;
  }

  async approveVendor(id: string, approverId: string): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Use entity business logic
    vendor.approve(approverId);

    // Update in database
    const updatedVendor = await this.vendorRepository.update(id, {
      status: vendor.status,
      approved_at: vendor.approvedAt?.toISOString() || null,
      approver_user_id: vendor.approverUserId,
    });

    // Log the action
    await this.auditLogRepository.create({
      action: 'VENDOR_APPROVED',
      user_id: approverId,
      vendor_id: id,
      details: { company_name: vendor.companyName },
    });

    return updatedVendor;
  }

  async rejectVendor(id: string, approverId: string, reason?: string): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Use entity business logic
    vendor.reject();

    // Update in database
    const updatedVendor = await this.vendorRepository.update(id, {
      status: vendor.status,
    });

    // Log the action
    await this.auditLogRepository.create({
      action: 'VENDOR_REJECTED',
      user_id: approverId,
      vendor_id: id,
      details: { 
        company_name: vendor.companyName,
        reason: reason || 'No reason provided'
      },
    });

    return updatedVendor;
  }

  async activateVendor(id: string, userId: string): Promise<VendorEntity> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Use entity business logic
    vendor.activate();

    // Update in database
    const updatedVendor = await this.vendorRepository.update(id, {
      status: vendor.status,
    });

    // Log the action
    await this.auditLogRepository.create({
      action: 'VENDOR_ACTIVATED',
      user_id: userId,
      vendor_id: id,
      details: { company_name: vendor.companyName },
    });

    return updatedVendor;
  }

  async getVendor(id: string): Promise<VendorEntity | null> {
    return await this.vendorRepository.findById(id);
  }

  async getVendors(filters: VendorFilters): Promise<{ vendors: VendorEntity[]; total: number }> {
    const [vendors, total] = await Promise.all([
      this.vendorRepository.findAll(filters),
      this.vendorRepository.count(filters),
    ]);

    return { vendors, total };
  }

  async deleteVendor(id: string, userId: string): Promise<boolean> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Only allow deletion of draft vendors
    if (vendor.status !== 'draft') {
      throw new Error('Can only delete draft vendors');
    }

    const success = await this.vendorRepository.delete(id);

    if (success) {
      // Log the action
      await this.auditLogRepository.create({
        action: 'VENDOR_DELETED',
        user_id: userId,
        vendor_id: id,
        details: { company_name: vendor.companyName },
      });
    }

    return success;
  }

  async getVendorsByCompany(companyId: string): Promise<VendorEntity[]> {
    return await this.vendorRepository.findByCompanyId(companyId);
  }

  async getPendingApprovals(): Promise<VendorEntity[]> {
    return await this.vendorRepository.findPendingApproval();
  }

  // Private helper methods
  private async encryptAccountNumber(accountNumber: string): Promise<string> {
    // TODO: Implement proper encryption
    // For now, this is a placeholder
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(accountNumber, 12);
  }
} 