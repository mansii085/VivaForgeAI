import { Router } from 'express';
import passport from 'passport';
import authController from './controller.js';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, signupSchema, forgotPasswordSchema } from 'shared';
import { config } from '../../config/index.js';
import authService from './service.js';
import { Response } from 'express';

const router: import('express').Router = Router();

// Public routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/config', authController.getConfig);
// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.clientUrl}/login?error=google_auth_failed`,
  }),
  async (req: any, res: Response) => {
    try {
      const profile = req.user;
      const result = await authService.handleGoogleAuth({
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos?.[0]?.value,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });

      // Redirect to client with access token
      res.redirect(
        `${config.clientUrl}/auth/callback?token=${result.accessToken}`
      );
    } catch (error) {
      res.redirect(`${config.clientUrl}/login?error=auth_failed`);
    }
  }
);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

export default router;
