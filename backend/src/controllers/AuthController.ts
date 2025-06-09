import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { body, validationResult } from 'express-validator';

export class AuthController {
  constructor(private authService: AuthService) {}

  // Validation rules
  static signupValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').trim().isLength({ min: 1 }),
    body('role').isIn(['admin', 'vendor', 'approver']).optional()
  ];

  static loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ];

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password, fullName, role = 'vendor' } = req.body;

      const result = await this.authService.signUp(email, password, fullName, role);

      if (result.error) {
        res.status(400).json({
          success: false,
          message: result.error.message
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: result.user,
          session: result.session,
          profile: result.profile
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during signup'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      const result = await this.authService.signIn(email, password);

      if (result.error) {
        res.status(401).json({
          success: false,
          message: result.error.message
        });
        return;
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          session: result.session,
          profile: result.profile
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No authorization token provided'
        });
        return;
      }

      const token = authHeader.substring(7);
      await this.authService.signOut(token);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No authorization token provided'
        });
        return;
      }

      const token = authHeader.substring(7);
      const result = await this.authService.getProfile(token);

      if (result.error) {
        res.status(401).json({
          success: false,
          message: result.error.message
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          profile: result.profile
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error getting profile'
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
        return;
      }

      const result = await this.authService.refreshSession(refreshToken);

      if (result.error) {
        res.status(401).json({
          success: false,
          message: result.error.message
        });
        return;
      }

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          session: result.session
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error refreshing token'
      });
    }
  };
} 