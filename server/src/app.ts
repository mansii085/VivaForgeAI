import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './config/index.js';
import { errorHandler, notFound } from './middleware/index.js';

// Import routes
import authRoutes from './features/auth/routes.js';
import atsRoutes from './features/ats/routes.js';
import resumeRoutes from './features/resume/routes.js';
import jdMatcherRoutes from './features/jd-matcher/routes.js';
import interviewRoutes from './features/interview/routes.js';
import learningRoutes from './features/learning/routes.js';
import ragRoutes from './features/rag/routes.js';
import dashboardRoutes from './features/dashboard/routes.js';
const app: import('express').Express = express();

// ===========================================
// Security Middleware
// ===========================================
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting (Disabled in dev to avoid Vite proxy issues)
const isDev = config.nodeEnv === 'development';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: isDev ? 10000 : 100,
  message: { success: false, error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: isDev ? 10000 : 10, // Stricter for auth in production
  message: { success: false, error: 'Too many auth attempts, please try again later' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ===========================================
// Body Parsing
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===========================================
// Logging
// ===========================================
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ===========================================
// Passport Google OAuth Strategy
// ===========================================
if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
      },
      (_accessToken, _refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );
}
app.use(passport.initialize());

// ===========================================
// Health Check
// ===========================================
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Career Coach API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ===========================================
// Routes
// ===========================================
app.use('/api/auth', authRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jd-matcher', jdMatcherRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ===========================================
// Error Handling
// ===========================================
app.use(notFound);
app.use(errorHandler);

export default app;
