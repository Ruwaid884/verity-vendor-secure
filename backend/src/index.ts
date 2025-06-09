import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { DatabaseConfig } from '@/config/database';
import { VendorRepository } from '@/repositories/VendorRepository';
import { AuditLogRepository } from '@/repositories/AuditLogRepository';
import { VendorService } from '@/services/VendorService';
import { VendorController } from '@/controllers/VendorController';
import { vendorRoutes } from '@/routes/vendor.routes';
import { authRoutes } from '@/routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

class App {
  public express: express.Application;
  private vendorController!: VendorController;

  constructor() {
    this.express = express();
    this.setupDependencies();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupDependencies(): void {
    // Initialize database connection
    const supabase = DatabaseConfig.getInstance();

    // Initialize repositories
    const vendorRepository = new VendorRepository(supabase);
    const auditLogRepository = new AuditLogRepository(supabase);

    // Initialize services
    const vendorService = new VendorService(vendorRepository, auditLogRepository);

    // Initialize controllers
    this.vendorController = new VendorController(vendorService);
  }

  private setupMiddleware(): void {
    // Security middleware
    this.express.use(helmet({
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration - hardcoded values
    const corsOptions = {
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8082'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };
    this.express.use(cors(corsOptions));

    // Rate limiting - hardcoded values
    const limiter = rateLimit({
      windowMs: 900000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.express.use(limiter);

    // Body parsing middleware
    this.express.use(express.json({ limit: '10mb' }));
    this.express.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.express.use(compression());

    // Request logging
    this.express.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.express.get('/health', (_req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'development',
      });
    });

    // API routes - hardcoded version
    const apiVersion = 'v1';
    this.express.use(`/api/${apiVersion}/auth`, authRoutes);
    this.express.use(`/api/${apiVersion}/vendors`, vendorRoutes(this.vendorController));

    // 404 handler
    this.express.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
      });
    });
  }

  private setupErrorHandling(): void {
    this.express.use(errorHandler);
  }

  public async start(): Promise<void> {
    const port = 3001; // Hardcoded port

    try {
      // Test database connection
      const dbConnected = await DatabaseConfig.testConnection();
      if (!dbConnected) {
        throw new Error('Failed to connect to database');
      }

      // Start server
      this.express.listen(port, () => {
        logger.info(`🚀 Server running on port ${port}`, {
          environment: 'development',
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new App();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app; 