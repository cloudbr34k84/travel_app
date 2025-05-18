/**
 * Error Handling Utilities
 * 
 * This module provides standardized error handling functions for the API.
 * It helps maintain consistent error responses across all routes and
 * integrates with the global error handler defined in server/index.ts.
 * 
 * USAGE:
 * ------
 * Import the appropriate error functions in your route handlers:
 * 
 * ```
 * import { handleZodError, handleNotFoundError, handleServerError } from './utils/errorHandler';
 * ```
 * 
 * Then use them in your catch blocks:
 * 
 * ```
 * try {
 *   // Your code
 * } catch (error) {
 *   return handleSpecificErrorType(error, res, 'Custom error message');
 * }
 * ```
 * 
 * ERROR HIERARCHY:
 * ---------------
 * The functions prioritize different types of errors:
 * 1. Zod validation errors (400 Bad Request)
 * 2. Custom API errors with status codes
 * 3. Default 500 Server Error for uncaught exceptions
 * 
 * CUSTOM ERROR CLASSES:
 * -------------------
 * To create custom error types, extend the ApiError class.
 * 
 * @module server/utils/errorHandler
 */

import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * API Error class that extends the built-in Error class
 * with additional properties for API error handling.
 * 
 * @example
 * throw new ApiError('User not found', 404);
 * 
 * @example
 * throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', { 
 *   fields: ['name', 'email'] 
 * });
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, any>;

  constructor(
    message: string, 
    status = 500, 
    code?: string, 
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * NotFoundError is a specialized ApiError for 404 responses.
 * 
 * @example
 * throw new NotFoundError('Pet not found');
 */
export class NotFoundError extends ApiError {
  constructor(message: string, code = 'RESOURCE_NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Handles Zod validation errors and returns a properly formatted API response.
 * 
 * @param error - The error thrown during request handling
 * @param res - Express response object
 * @param defaultMessage - Default message for the error response
 * @returns Express response with 400 status code and error details
 */
export function handleZodError(
  error: unknown, 
  res: Response, 
  defaultMessage = 'Validation error'
): Response {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: defaultMessage,
      code: 'VALIDATION_ERROR',
      details: {
        errors: error.errors
      }
    });
  }
  
  // If not a Zod error, pass to general error handler
  return handleServerError(error, res);
}

/**
 * Handles 404 Not Found errors and returns a properly formatted API response.
 * 
 * @param message - The not found message
 * @param res - Express response object
 * @param code - Optional error code
 * @returns Express response with 404 status code
 */
export function handleNotFoundError(
  message: string, 
  res: Response, 
  code = 'RESOURCE_NOT_FOUND'
): Response {
  return res.status(404).json({
    message,
    code
  });
}

/**
 * Handles general server errors and returns a properly formatted API response.
 * For ApiError instances, uses their status code and details.
 * For other errors, defaults to a 500 server error.
 * 
 * @param error - The error thrown during request handling
 * @param res - Express response object
 * @param defaultMessage - Default message if error is not an ApiError instance
 * @returns Express response with appropriate status code
 */
export function handleServerError(
  error: unknown, 
  res: Response, 
  defaultMessage = 'Internal server error'
): Response {
  // Log the error regardless of type
  console.error('API Error:', error);
  
  // Handle ApiError types with their specific status and details
  if (error instanceof ApiError) {
    const response: { 
      message: string; 
      code?: string;
      details?: Record<string, any>;
    } = {
      message: error.message
    };
    
    if (error.code) {
      response.code = error.code;
    }
    
    if (error.details) {
      response.details = error.details;
    }
    
    return res.status(error.status).json(response);
  }
  
  // For general errors, return a 500 with default message
  return res.status(500).json({
    message: defaultMessage,
    code: 'INTERNAL_SERVER_ERROR'
  });
}

/**
 * Combined error handler for route handlers
 * Handles all common error types in a single function
 * 
 * @param error - The error thrown during request handling
 * @param res - Express response object
 * @param options - Options to customize error handling
 * @returns Express response with appropriate status and error details
 */
export function handleRouteError(
  error: unknown, 
  res: Response,
  options: {
    entityName: string;
    validationMessage?: string;
    serverErrorMessage?: string;
  }
): Response {
  const { 
    entityName,
    validationMessage = `Invalid ${entityName} data`,
    serverErrorMessage = `Failed to process ${entityName}` 
  } = options;
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: validationMessage,
      code: 'VALIDATION_ERROR',
      details: {
        errors: error.errors
      }
    });
  }
  
  // Handle NotFoundError (already has 404 status)
  if (error instanceof NotFoundError) {
    return res.status(error.status).json({
      message: error.message,
      code: error.code
    });
  }
  
  // Handle other ApiError types
  if (error instanceof ApiError) {
    const response: { 
      message: string; 
      code?: string;
      details?: Record<string, any>;
    } = {
      message: error.message
    };
    
    if (error.code) {
      response.code = error.code;
    }
    
    if (error.details) {
      response.details = error.details;
    }
    
    return res.status(error.status).json(response);
  }
  
  // For all other errors, return a 500 server error
  console.error(`${entityName} Error:`, error);
  return res.status(500).json({
    message: serverErrorMessage,
    code: 'INTERNAL_SERVER_ERROR'
  });
}