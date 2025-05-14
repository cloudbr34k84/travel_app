import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    // Use type intersection instead of interface extension
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      firstName: string | null;
      lastName: string | null;
      bio: string | null;
      location: string | null;
      phone: string | null;
      avatar: string | null;
      createdAt: Date;
    }
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
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) return next(err);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
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
}