/**
 * Environment Configuration
 * 
 * This file loads and validates environment variables from a .env file into process.env.
 * It should be imported at the very beginning of the application entry point
 * before any other imports that might use environment variables.
 * 
 * The module:
 * 1. Loads variables from the .env file (if it exists)
 * 2. Validates that all required variables are present
 * 3. Provides typed access to environment variables
 * 4. Throws an error if any critical variables are missing
 * 
 * @module server/utils/env
 */

import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Application Environment Configuration
 * 
 * This interface defines the environment variables required or used by the application.
 * 
 * To add a new environment variable:
 * 1. Add it to this interface
 * 2. Add JSDoc comment explaining its purpose and format
 * 3. If it's required, add it to the requiredEnvVars array below
 */
export interface EnvConfig {
  /**
   * PostgreSQL connection string
   * Format: postgresql://username:password@hostname:port/database
   * Required for database connectivity
   */
  DATABASE_URL: string;
  
  /**
   * Node.js environment
   * Affects logging, error handling, and other environment-specific behaviors
   * Default: 'development'
   */
  NODE_ENV?: 'development' | 'production' | 'test';
  
  /**
   * Server port
   * The port on which the HTTP server will listen
   * Default: 5000
   */
  PORT?: string;
  
  // Add new environment variables here
}

// Determine the location of the .env file
const envPath = join(process.cwd(), '.env');

// Load environment variables from .env file if it exists
if (existsSync(envPath)) {
  const result = config({ path: envPath });
  
  if (result.error) {
    console.warn(`Error loading .env file: ${result.error.message}`);
  } else {
    console.log(`Environment variables loaded from ${envPath}`);
  }
} else {
  console.log('.env file not found, using existing environment variables');
}

/**
 * List of environment variables that are required for the application to function.
 * If any of these are missing, the application will throw an error and exit.
 */
const requiredEnvVars: Array<keyof EnvConfig> = ['DATABASE_URL'];

/**
 * Validates that all required environment variables are set.
 * Throws an error if any required variables are missing.
 * 
 * @throws {Error} If any required environment variables are missing
 */
function validateEnv(): void {
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Application cannot start: Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
      `Please ensure these variables are set in your .env file or environment.`
    );
  }
}

/**
 * Gets the environment variables with proper TypeScript typing.
 * 
 * @returns {EnvConfig} The typed environment configuration
 */
export function getEnv(): EnvConfig {
  // Ensure all required variables exist before returning
  validateEnv();
  
  return process.env as unknown as EnvConfig;
}

// Immediately validate environment on module import
validateEnv();
