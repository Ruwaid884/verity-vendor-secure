import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : 'Internal server error',
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
      details: error.message,
    }),
  });
};

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error creators
export const createNotFoundError = (resource: string, id?: string): AppError => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return new AppError(message, 404);
};

export const createValidationError = (message: string): AppError => {
  return new AppError(message, 400);
};

export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(message, 401);
};

export const createForbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(message, 403);
};

export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409);
}; 