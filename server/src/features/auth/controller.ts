import { Request, Response, NextFunction } from 'express';
import authService from './service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { config } from '../../config/index.js';
import { ApiError } from '../../middleware/errorHandler.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

class AuthController {
  /**
   * POST /api/auth/signup
   */
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.signup(name, email, password);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, error: 'No refresh token' });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.json({
        success: true,
        data: { accessToken: result.accessToken },
      });
    } catch (error) {
      // Clear cookie on refresh failure
      res.clearCookie('refreshToken', { path: '/api/auth' });
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (req.user && refreshToken) {
        await authService.logout(req.user._id, refreshToken);
      }

      res.clearCookie('refreshToken', { path: '/api/auth' });

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password/:token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
      const { password } = req.body;

      if (!token) {
        throw new ApiError(400, 'Reset token is required');
      }

      const result = await authService.resetPassword(token, password);

      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/config
   */
  async getConfig(_req: Request, res: Response, _next: NextFunction) {
    try {
      const googleEnabled = Boolean(config.googleClientId && config.googleClientSecret);
      res.json({ success: true, data: { googleEnabled } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Unable to load auth configuration' });
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!._id);

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!._id, req.body);

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
