
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

/**
 * Initializes CSRF protection middleware.
 * 
 * @description This middleware creates a CSRF token for each request and validates it
 * on state-changing requests (POST, PUT, DELETE, etc.) to prevent cross-site request forgery attacks.
 * 
 * @configuration
 * - cookie: true - Stores the CSRF token in a cookie instead of using sessions
 * - The cookie is HttpOnly and matches the path of the request
 * - A new token is generated for each request
 */
const csrfProtection = csurf({ cookie: true });

/**
 * Makes the CSRF token available to templates.
 * 
 * @description This middleware extracts the generated CSRF token and adds it
 * to res.locals where it can be accessed by server-side templates.
 *
 * @usage In templates, the token can be accessed as `csrfToken` and should be
 * included in forms as a hidden input with name="_csrf" or as a custom header
 * for AJAX requests.
 * 
 * @example
 * <form method="POST">
 *   <input type="hidden" name="_csrf" value="{{ csrfToken }}">
 *   <!-- rest of the form -->
 * </form>
 */
const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export function setupMiddleware(app: Express): void {
  // Apply the global limiter to all routes
  app.use(globalLimiter);
  
  // Apply the auth limiter specifically to login and register routes
  app.use(['/api/login', '/api/register'], authLimiter);
  
  /**
   * Applies CSRF protection selectively based on request type.
   * 
   * @description This middleware applies CSRF protection only to non-API routes
   * and non-JSON requests. API routes (starting with '/api') and requests with
   * content-type 'application/json' bypass CSRF checks.
   * 
   * @security
   * - Protects forms and server-rendered pages from CSRF attacks
   * - API routes typically use other authentication mechanisms (e.g., JWT)
   * - JSON requests are usually from scripts that include their own authentication
   *
   * @behavior When enabled:
   * 1. Validates the CSRF token on state-changing requests
   * 2. Adds the token to res.locals for use in templates
   * 3. Rejects requests with invalid/missing tokens with a 403 error
   */
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
