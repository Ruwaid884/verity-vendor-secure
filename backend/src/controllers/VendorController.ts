import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { IVendorService, CreateVendorDto, UpdateVendorDto } from '@/services/VendorService';
import { VendorFilters } from '@/repositories/VendorRepository';

export class VendorController {
  constructor(private vendorService: IVendorService) {}

  // Validation middleware
  static validateCreateVendor = [
    body('companyId').isUUID().withMessage('Company ID must be a valid UUID'),
    body('companyName').trim().isLength({ min: 1, max: 255 }).withMessage('Company name is required and must be less than 255 characters'),
    body('vendorUserId').optional().isUUID().withMessage('Vendor user ID must be a valid UUID'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('address').optional().isLength({ max: 255 }).withMessage('Address must be less than 255 characters'),
    body('city').optional().isLength({ max: 100 }).withMessage('City must be less than 100 characters'),
    body('state').optional().isLength({ max: 50 }).withMessage('State must be less than 50 characters'),
    body('zipCode').optional().isPostalCode('any').withMessage('Invalid zip code format'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('taxId').optional().isLength({ max: 50 }).withMessage('Tax ID must be less than 50 characters'),
    body('bankName').optional().isLength({ max: 255 }).withMessage('Bank name must be less than 255 characters'),
    body('routingNumber').optional().isLength({ min: 9, max: 9 }).withMessage('Routing number must be 9 digits'),
    body('accountNumber').optional().isLength({ min: 1, max: 20 }).withMessage('Account number must be between 1-20 characters'),
    body('accountType').optional().isIn(['checking', 'savings']).withMessage('Account type must be checking or savings'),
  ];

  static validateUpdateVendor = [
    param('id').isUUID().withMessage('Vendor ID must be a valid UUID'),
    body('companyName').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Company name must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('address').optional().isLength({ max: 255 }).withMessage('Address must be less than 255 characters'),
    body('city').optional().isLength({ max: 100 }).withMessage('City must be less than 100 characters'),
    body('state').optional().isLength({ max: 50 }).withMessage('State must be less than 50 characters'),
    body('zipCode').optional().isPostalCode('any').withMessage('Invalid zip code format'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('taxId').optional().isLength({ max: 50 }).withMessage('Tax ID must be less than 50 characters'),
    body('bankName').optional().isLength({ max: 255 }).withMessage('Bank name must be less than 255 characters'),
    body('routingNumber').optional().isLength({ min: 9, max: 9 }).withMessage('Routing number must be 9 digits'),
    body('accountNumber').optional().isLength({ min: 1, max: 20 }).withMessage('Account number must be between 1-20 characters'),
    body('accountType').optional().isIn(['checking', 'savings']).withMessage('Account type must be checking or savings'),
  ];

  static validateVendorId = [
    param('id').isUUID().withMessage('Vendor ID must be a valid UUID'),
  ];

  // Create a new vendor
  createVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const vendorData: CreateVendorDto = req.body;
      const vendor = await this.vendorService.createVendor(vendorData, userId);

      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Update an existing vendor
  updateVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const updateData: UpdateVendorDto = req.body;
      const vendor = await this.vendorService.updateVendor(id, updateData, userId);

      res.json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get a vendor by ID
  getVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const vendor = await this.vendorService.getVendor(id);

      if (!vendor) {
        res.status(404).json({
          success: false,
          message: 'Vendor not found',
        });
        return;
      }

      res.json({
        success: true,
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Get vendors with filtering and pagination
  getVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        companyId,
        status,
        vendorUserId,
        search,
        page = '1',
        limit = '20',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const filters: VendorFilters = {
        companyId: companyId as string,
        status: status as string,
        vendorUserId: vendorUserId as string,
        search: search as string,
        limit: limitNum,
        offset,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof VendorFilters] === undefined) {
          delete filters[key as keyof VendorFilters];
        }
      });

      const result = await this.vendorService.getVendors(filters);

      res.json({
        success: true,
        data: {
          vendors: result.vendors.map(v => v.toPublic()),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: result.total,
            totalPages: Math.ceil(result.total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Submit vendor for approval
  submitVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const vendor = await this.vendorService.submitVendor(id, userId);

      res.json({
        success: true,
        message: 'Vendor submitted for approval',
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Approve vendor
  approveVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const vendor = await this.vendorService.approveVendor(id, userId);

      res.json({
        success: true,
        message: 'Vendor approved successfully',
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Reject vendor
  rejectVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const vendor = await this.vendorService.rejectVendor(id, userId, reason);

      res.json({
        success: true,
        message: 'Vendor rejected',
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Activate vendor
  activateVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const vendor = await this.vendorService.activateVendor(id, userId);

      res.json({
        success: true,
        message: 'Vendor activated successfully',
        data: vendor.toPublic(),
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete vendor
  deleteVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
        return;
      }

      const success = await this.vendorService.deleteVendor(id, userId);

      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete vendor',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Vendor deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get pending approvals
  getPendingApprovals = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vendors = await this.vendorService.getPendingApprovals();

      res.json({
        success: true,
        data: vendors.map(v => v.toPublic()),
      });
    } catch (error) {
      next(error);
    }
  };
} 