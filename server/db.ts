/**
 * Database Connection Configuration
 * 
 * This file configures the connection to a local PostgreSQL database using Drizzle ORM
 * with node-postgres. It creates a connection pool for efficient database access and
 * exports the configured Drizzle instance along with utility functions for health checks
 * and resource management.
 * 
 * Environment variables:
 * - DATABASE_URL: PostgreSQL connection string (required)
 *   Format: postgresql://username:password@hostname:port/database
 * - NODE_ENV: Application environment ('development', 'production', or 'test')
 *   Controls connection pool configuration and optimization settings
 * 
 * Environment-specific configurations:
 * - Production: Optimized for high throughput with larger connection pools
 * - Development: Balanced for local development with moderate resources
 * - Test: Minimized resource usage for automated testing
 * 
 * Pool Configuration by Environment:
 * +-------------+--------+------------------+-------------------------+
 * | Environment | max    | idleTimeoutMillis| Notes                   |
 * +-------------+--------+------------------+-------------------------+
 * | production  | 20     | 30000 (30s)      | For high traffic        |
 * | development | 5      | 10000 (10s)      | For local development   |
 * | test        | 1      | 5000  (5s)       | For test suites         |
 * +-------------+--------+------------------+-------------------------+
 * 
 * To modify these settings, update the environment-specific configuration objects
 * defined in this file.
 * 
 * Usage:
 * - Import the `db` object to interact with the database through Drizzle ORM
 * - Use `isDatabaseHealthy()` to check database connectivity
 * - Call `closeDatabaseConnections()` during application shutdown
 * 
 * @module server/db
 */

import pg from "pg";
const { Pool } = pg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import { getEnv } from "./utils/env";

// Get typed environment variables
const env = getEnv();

/**
 * Environment-specific PostgreSQL connection pool configurations
 * 
 * These settings control how many connections are maintained in the pool,
 * how long idle connections are kept, and connection timeout behavior.
 * 
 * Adjust these values based on:
 * - Server resources (memory, CPU)
 * - Expected concurrent database access patterns
 * - Container or deployment environment constraints
 */
const poolConfigs = {
  // Production: Optimized for high traffic and performance
  production: {
    max: 20, // Higher number of max connections for production workloads
    idleTimeoutMillis: 30000, // 30 seconds - balanced for production stability
    connectionTimeoutMillis: 5000, // 5 seconds connection timeout
  },
  
  // Development: Balanced for local development
  development: {
    max: 5, // Fewer connections for development environments
    idleTimeoutMillis: 10000, // 10 seconds - faster recycling for development
    connectionTimeoutMillis: 5000, // 5 seconds connection timeout
  },
  
  // Test: Minimized for automated testing
  test: {
    max: 1, // Minimal connections for testing
    idleTimeoutMillis: 5000, // 5 seconds - quick recycling for tests
    connectionTimeoutMillis: 3000, // 3 seconds connection timeout
  }
};

// Select the appropriate pool config based on current environment
// Default to development if NODE_ENV is not set
const currentEnv = env.NODE_ENV || 'development';
const poolConfig = poolConfigs[currentEnv as keyof typeof poolConfigs] || poolConfigs.development;

// Create a pg connection pool with environment-specific configuration
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ...poolConfig
});

// Log pool configuration and current environment
console.log(`PostgreSQL pool configured for ${currentEnv} environment with max=${poolConfig.max} connections`);

// Log unexpected pool errors to prevent application crashes
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

// Create the Drizzle database client
export const db = drizzle(pool, { schema });

/**
 * Checks if the database is healthy and accessible
 * 
 * This function attempts to establish a connection from the pool and execute
 * a simple query to verify database connectivity. It uses the environment-specific
 * connection pool settings, which means:
 * - In production: Will draw from a larger connection pool (max: 20)
 * - In development: Will use a moderate pool size (max: 5)
 * - In test: Will use minimal connections (max: 1)
 * 
 * Connection attempts will respect the environment-specific timeouts.
 * 
 * @returns {Promise<boolean>} True if database is reachable, false otherwise
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Closes all database connections gracefully
 * 
 * This should be called during application shutdown to ensure all connections
 * are properly closed and resources are released. This is particularly important
 * in environments with limited connection resources or when running multiple
 * instances of the application.
 * 
 * The function will drain the connection pool based on the environment-specific
 * configuration:
 * - Production: Will close up to 20 connections
 * - Development: Will close up to 5 connections
 * - Test: Will close the single connection
 * 
 * @returns {Promise<void>}
 */
export async function closeDatabaseConnections(): Promise<void> {
  await pool.end();
  console.log('All database connections have been closed');
}
