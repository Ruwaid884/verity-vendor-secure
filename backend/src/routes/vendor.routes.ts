import { Router } from 'express';
import { VendorController } from '@/controllers/VendorController';

export const vendorRoutes = (vendorController: VendorController): Router => {
  const router = Router();

  // GET /api/v1/vendors - Get all vendors with filtering
  router.get('/', vendorController.getVendors);

  // POST /api/v1/vendors - Create a new vendor
  router.post('/', VendorController.validateCreateVendor, vendorController.createVendor);

  // GET /api/v1/vendors/pending - Get vendors pending approval
  router.get('/pending', vendorController.getPendingApprovals);

  // GET /api/v1/vendors/:id - Get vendor by ID
  router.get('/:id', VendorController.validateVendorId, vendorController.getVendor);

  // PUT /api/v1/vendors/:id - Update vendor
  router.put('/:id', VendorController.validateUpdateVendor, vendorController.updateVendor);

  // PATCH /api/v1/vendors/:id/submit - Submit vendor for approval
  router.patch('/:id/submit', VendorController.validateVendorId, vendorController.submitVendor);

  // PATCH /api/v1/vendors/:id/approve - Approve vendor
  router.patch('/:id/approve', VendorController.validateVendorId, vendorController.approveVendor);

  // PATCH /api/v1/vendors/:id/reject - Reject vendor
  router.patch('/:id/reject', VendorController.validateVendorId, vendorController.rejectVendor);

  // PATCH /api/v1/vendors/:id/activate - Activate vendor
  router.patch('/:id/activate', VendorController.validateVendorId, vendorController.activateVendor);

  // DELETE /api/v1/vendors/:id - Delete vendor
  router.delete('/:id', VendorController.validateVendorId, vendorController.deleteVendor);

  return router;
}; 