/**
 * Vite Environment Configuration
 * 
 * This file provides environment variable access for Vite configuration.
 * Since Vite's config runs outside the normal application flow, we can't use
 * our standard getEnv() function. Instead, we provide a simplified version here.
 * 
 * This should only be used in vite.config.ts or similar build configuration files.
 */

import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

// Load environment variables from .env file if it exists
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

/**
 * Simplified environment interface for build configuration
 */
export interface BuildEnv {
  NODE_ENV?: string;
  REPL_ID?: string;
}

/**
 * Get environment variables for build configuration
 * No validation is performed since this is only for build configuration
 */
export function getBuildEnv(): BuildEnv {
  return {
    NODE_ENV: process.env.NODE_ENV,
    REPL_ID: process.env.REPL_ID,
  };
}
