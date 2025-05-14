
import rateLimit from 'express-rate-limit';
import { Express, Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

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

// Initialize CSRF protection
const csrfProtection = csurf({ cookie: true });

// CSRF token middleware - adds token to res.locals for templates
const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export function setupMiddleware(app: Express): void {
  // Apply the global limiter to all routes
  app.use(globalLimiter);
  
  // Apply the auth limiter specifically to login and register routes
  app.use(['/api/login', '/api/register'], authLimiter);
  
  // Apply CSRF protection to non-JSON routes (skip for API routes)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for API routes and JSON requests
    if (req.path.startsWith('/api') || req.headers['content-type'] === 'application/json') {
      return next();
    }
    
    // Apply CSRF protection and add token to res.locals
    csrfProtection(req, res, (err: any) => {
      if (err) return next(err);
      csrfTokenMiddleware(req, res, next);
    });
  });
}
