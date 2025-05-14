import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";
import { z } from "zod";

// Import User type from schema
import type { User as SchemaUser } from "@shared/schema";

declare global {
  namespace Express {
    // Use the schema type directly to ensure consistency
    interface User extends SchemaUser {}
  }
}

// Cost factor: higher is more secure but slower
const SALT_ROUNDS = 12;

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // Set up session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "travel-planner-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: 'sid_travel_planner',
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration validation schema
  const registrationSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional()
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate the request body
      const validatedData = registrationSchema.parse(req.body);

      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create the user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      try {
        // Get current login count or default to 0
        const currentLoginCount = typeof user.loginCount === 'number' ? user.loginCount : 0;
        
        // Update login tracking information
        await storage.updateUser(user.id, {
          lastLogin: new Date(),
          loginCount: currentLoginCount + 1
        });
        
        // Refresh user data after update
        const updatedUser = await storage.getUser(user.id);
        if (!updatedUser) {
          return res.status(500).json({ message: "Failed to retrieve updated user data" });
        }

        // Type assertion for login - we've already validated updatedUser is not null above
        const typedUser = updatedUser as Express.User;
        req.login(typedUser, (err) => {
          if (err) return next(err);

          // Remove password from response
          const { password, ...userWithoutPassword } = updatedUser;
          res.json(userWithoutPassword);
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as Express.User;
    res.json(userWithoutPassword);
  });

  /**
   * Update User Profile Endpoint
   * 
   * @description Allows authenticated users to update their profile information
   * excluding sensitive fields like password.
   * 
   * @security
   * - Requires authentication
   * - Validates input data
   * - Only allows updates to the authenticated user's profile
   * 
   * @returns Updated user profile without sensitive fields like password
   */
  const updateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional()
  });

  app.put("/api/user", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate request body
      const validatedData = updateProfileSchema.parse(req.body);

      // If email is being updated, check if it already exists
      if (validatedData.email) {
        const existingUserWithEmail = await storage.getUserByEmail(validatedData.email);
        if (existingUserWithEmail && existingUserWithEmail.id !== req.user.id) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Update user profile
      const updatedUser = await storage.updateUser(req.user.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session with fresh user data
      const freshUser = await storage.getUser(req.user.id);
      if (!freshUser) {
        return res.status(500).json({ message: "Failed to refresh user data" });
      }
      
      // Type assertion for login - freshUser is validated above
      const typedUser = freshUser as Express.User;
      req.login(typedUser, (err) => {
        if (err) return next(err);
        
        // Return user without password
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  /**
   * Change Password Endpoint
   * 
   * @description Allows authenticated users to update their password
   * 
   * @security
   * - Requires authentication
   * - Validates current password before allowing change
   * - Enforces password complexity requirements
   * - Securely hashes the new password
   * 
   * @returns Success message on successful password change
   */
  const passwordChangeSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
  });

  app.post("/api/user/change-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate request body
      const validatedData = passwordChangeSchema.parse(req.body);

      // Verify current password
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isCurrentPasswordValid = await comparePasswords(
        validatedData.currentPassword, 
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(validatedData.newPassword);

      // Update password
      await storage.updateUser(req.user.id, { password: hashedNewPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
}