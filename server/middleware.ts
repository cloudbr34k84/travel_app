
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

// Global rate limiter - 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.' }
});

// Auth-specific rate limiter - 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' }
});

export function setupMiddleware(app: Express): void {
  // Apply the global limiter to all routes
  app.use(globalLimiter);
  
  // Apply the auth limiter specifically to login and register routes
  app.use(['/api/login', '/api/register'], authLimiter);
}
