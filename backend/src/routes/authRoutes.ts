import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { AuthService } from '@/services/AuthService';

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

// Auth routes
router.post('/signup', AuthController.signupValidation, authController.signup);
router.post('/login', AuthController.loginValidation, authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.post('/refresh', authController.refreshToken);

export { router as authRoutes }; 