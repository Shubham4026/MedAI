import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mediaisecret2025",
    resave: true,
    saveUninitialized: false,
    rolling: true, // Refresh session with each request
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  // Google OAuth2 Strategy
  // Scope for Google Fit API
  const GOOGLE_SCOPES = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.body.read'
  ];

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
    scope: GOOGLE_SCOPES,
  }, async (accessToken: string, refreshToken: string | undefined, profile: Profile, done: VerifyCallback) => {
    try {
      // Use email from Google profile
      const email = profile.emails?.[0]?.value;
      if (!email) return done(null, false, { message: "No email from Google" });
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          password: "", // No password for Google users
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken || null,
          googleTokenExpiry: new Date(Date.now() + 3600 * 1000), // Token expires in 1 hour
        });
        await storage.createHealthProfile({
          userId: user.id,
          age: null,
          gender: null,
          height: null,
          weight: null,
          bloodType: null,
          allergies: [],
          chronicConditions: [],
          medications: [],
          familyHistory: [],
          lifestyleHabits: {}
        });
      } else {
        // Update tokens for existing user
        await storage.updateUser(user.id, {
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken || null,
          googleTokenExpiry: new Date(Date.now() + 3600 * 1000) // Token expires in 1 hour
        });
        user.googleAccessToken = accessToken;
        user.googleRefreshToken = refreshToken || null;
        user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // API Routes for authentication
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      // Create empty health profile
      await storage.createHealthProfile({
        userId: user.id,
        age: null,
        gender: null,
        height: null,
        weight: null,
        bloodType: null,
        allergies: [],
        chronicConditions: [],
        medications: [],
        familyHistory: [],
        lifestyleHabits: {}
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password in response
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: `Registration failed: ${error.message}` });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password in response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Middleware to refresh session
  app.use((req, res, next) => {
    if (req.isAuthenticated()) {
      req.session.touch(); // Refresh session on each authenticated request
    }
    next();
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Don't send password in response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}