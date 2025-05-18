/**
 * Unit tests for environment configuration
 * 
 * These tests verify that the environment configuration system works correctly:
 * - Required variables are enforced
 * - getEnv() returns properly typed values
 * - Environment variables are accessible in a type-safe way
 * 
 * @jest
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock process.env before importing the module
const originalEnv = process.env;

describe('Environment Configuration', () => {
  // Reset process.env before each test
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Set required environment variables to test values
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
  });
  
  // Restore original process.env after tests
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('should provide access to environment variables via getEnv()', () => {
    // Import the module after setting up the environment
    const { getEnv } = require('../server/utils/env');
    
    const env = getEnv();
    
    // Test that environment variables are accessible with correct types
    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/testdb');
    expect(typeof env.DATABASE_URL).toBe('string');
  });
  
  it('should throw an error if required environment variables are missing', () => {
    // Remove required environment variable
    delete process.env.DATABASE_URL;
    
    // Importing the module should throw an error
    expect(() => {
      require('../server/utils/env');
    }).toThrow(/Missing required environment variables: DATABASE_URL/);
  });
  
  it('should handle optional environment variables', () => {
    // Set an optional environment variable
    process.env.NODE_ENV = 'test';
    
    // Import the module after setting up the environment
    const { getEnv } = require('../server/utils/env');
    
    const env = getEnv();
    
    // Test that optional environment variables are accessible
    expect(env.NODE_ENV).toBe('test');
    
    // Test that missing optional variables don't cause errors
    expect(env.PORT).toBeUndefined();
  });
});
