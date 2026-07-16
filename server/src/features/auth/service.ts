// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { config } from '../../config/index.js';
// import User, { IUserDocument } from './model.js';
// import { ApiError } from '../../middleware/errorHandler.js';

// class AuthService {
//   /**
//    * Generate JWT access token (short-lived)
//    */
//   generateAccessToken(user: IUserDocument): string {
//     const secret = config.jwtAccessSecret as unknown as jwt.Secret;
//     const options: jwt.SignOptions = {
//       expiresIn: config.jwtAccessExpiry as jwt.SignOptions['expiresIn'],
//     };

//     return jwt.sign(
//       { userId: user._id, email: user.email, role: user.role },
//       secret,
//       options
//     );
//   }

//   /**
//    * Generate JWT refresh token (long-lived)
//    */
//   generateRefreshToken(user: IUserDocument): string {
//     const secret = config.jwtRefreshSecret as unknown as jwt.Secret;
//     const options: jwt.SignOptions = {
//       expiresIn: config.jwtRefreshExpiry as jwt.SignOptions['expiresIn'],
//     };

//     return jwt.sign(
//       { userId: user._id, tokenVersion: Date.now() },
//       secret,
//       options
//     );
//   }

//   /**
//    * Register new user
//    */
//   async signup(name: string, email: string, password: string) {
//     const normalizedEmail = email.trim().toLowerCase();
//     const existingUser = await User.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       throw new ApiError(409, 'Email already registered');
//     }

//     const user = await User.create({ name, email: normalizedEmail, password });

//     const accessToken = this.generateAccessToken(user);
//     const refreshToken = this.generateRefreshToken(user);

//     // Store refresh token
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);
//     user.refreshTokens.push({ token: refreshToken, expiresAt });
//     await user.save();

//     return {
//       user: this.sanitizeUser(user),
//       accessToken,
//       refreshToken,
//     };
//   }

//   /**
//    * Login with email/password
//    */
//   async login(email: string, password: string) {
//     const normalizedEmail = email.trim().toLowerCase();
//     const user = await User.findOne({ email: normalizedEmail }).select('+password');
//     if (!user || !user.password) {
//       throw new ApiError(401, 'Invalid email or password');
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       throw new ApiError(401, 'Invalid email or password');
//     }

//     const accessToken = this.generateAccessToken(user);
//     const refreshToken = this.generateRefreshToken(user);

//     // Store refresh token
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);
//     user.refreshTokens.push({ token: refreshToken, expiresAt });
//     await user.save();

//     return {
//       user: this.sanitizeUser(user),
//       accessToken,
//       refreshToken,
//     };
//   }

//   /**
//    * Refresh access token using refresh token (with rotation)
//    */
//   async refreshAccessToken(oldRefreshToken: string) {
//     let decoded: any;
//     try {
//       decoded = jwt.verify(oldRefreshToken, config.jwtRefreshSecret);
//     } catch {
//       throw new ApiError(401, 'Invalid or expired refresh token');
//     }

//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       throw new ApiError(401, 'User not found');
//     }

//     // Check if token exists in user's refresh tokens
//     const tokenIndex = user.refreshTokens.findIndex(
//       (rt) => rt.token === oldRefreshToken
//     );
//     if (tokenIndex === -1) {
//       // Token not found — possible token reuse attack, invalidate all
//       user.refreshTokens = [];
//       await user.save();
//       throw new ApiError(401, 'Token reuse detected — all sessions invalidated');
//     }

//     // Remove old token (rotation)
//     user.refreshTokens.splice(tokenIndex, 1);

//     // Generate new tokens
//     const accessToken = this.generateAccessToken(user);
//     const refreshToken = this.generateRefreshToken(user);

//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);
//     user.refreshTokens.push({ token: refreshToken, expiresAt });
//     await user.save();

//     return { accessToken, refreshToken };
//   }

//   /**
//    * Logout — remove specific refresh token
//    */
//   async logout(userId: string, refreshToken: string) {
//     await User.findByIdAndUpdate(userId, {
//       $pull: { refreshTokens: { token: refreshToken } },
//     });
//   }

//   /**
//    * Generate password reset token
//    */
//   async forgotPassword(email: string) {
//     const user = await User.findOne({ email });
//     if (!user) {
//       // Don't reveal if email exists
//       return { message: 'If email exists, a reset link has been sent' };
//     }

//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = crypto
//       .createHash('sha256')
//       .update(resetToken)
//       .digest('hex');
//     user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
//     await user.save();

//     // TODO: Send email with reset link
//     // For dev, return the token
//     const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
//     console.log(`🔑 Password reset URL: ${resetUrl}`);

//     return { message: 'If email exists, a reset link has been sent', resetToken };
//   }

//   /**
//    * Reset password using token
//    */
//   async resetPassword(token: string, newPassword: string) {
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpiry: { $gt: new Date() },
//     });

//     if (!user) {
//       throw new ApiError(400, 'Invalid or expired reset token');
//     }

//     user.password = newPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpiry = undefined;
//     user.refreshTokens = []; // Invalidate all sessions
//     await user.save();

//     return { message: 'Password reset successful' };
//   }

//   /**
//    * Handle Google OAuth login/signup
//    */
//   async handleGoogleAuth(profile: {
//     id: string;
//     displayName: string;
//     email: string;
//     photo?: string;
//   }) {
//     let user = await User.findOne({
//       $or: [{ googleId: profile.id }, { email: profile.email }],
//     });

//     if (user) {
//       // Link Google account if not already linked
//       if (!user.googleId) {
//         user.googleId = profile.id;
//         if (!user.avatar && profile.photo) {
//           user.avatar = profile.photo;
//         }
//         await user.save();
//       }
//     } else {
//       // Create new user
//       user = await User.create({
//         name: profile.displayName,
//         email: profile.email,
//         googleId: profile.id,
//         avatar: profile.photo || '',
//         isVerified: true,
//       });
//     }

//     const accessToken = this.generateAccessToken(user);
//     const refreshToken = this.generateRefreshToken(user);

//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);
//     user.refreshTokens.push({ token: refreshToken, expiresAt });
//     await user.save();

//     return {
//       user: this.sanitizeUser(user),
//       accessToken,
//       refreshToken,
//     };
//   }

//   /**
//    * Get user profile
//    */
//   async getProfile(userId: string) {
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new ApiError(404, 'User not found');
//     }
//     return this.sanitizeUser(user);
//   }

//   /**
//    * Update user profile
//    */
//   async updateProfile(userId: string, updates: { name?: string; avatar?: string }) {
//     const user = await User.findByIdAndUpdate(userId, updates, {
//       new: true,
//       runValidators: true,
//     });
//     if (!user) {
//       throw new ApiError(404, 'User not found');
//     }
//     return this.sanitizeUser(user);
//   }

//   /**
//    * Remove sensitive fields from user object
//    */
//   private sanitizeUser(user: IUserDocument) {
//     return {
//       _id: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       avatar: user.avatar,
//       role: user.role,
//       isVerified: user.isVerified,
//       createdAt: user.createdAt.toISOString(),
//       updatedAt: user.updatedAt.toISOString(),
//     };
//   }
// }

// export default new AuthService();


import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/index.js';
import User, { IUserDocument } from './model.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { sendPasswordResetEmail } from '../../utils/email.js';

class AuthService {
  /**
   * Generate JWT access token (short-lived)
   */
  generateAccessToken(user: IUserDocument): string {
    const secret = config.jwtAccessSecret as unknown as jwt.Secret;
    const options: jwt.SignOptions = {
      expiresIn: config.jwtAccessExpiry as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      secret,
      options
    );
  }

  /**
   * Generate JWT refresh token (long-lived)
   */
  generateRefreshToken(user: IUserDocument): string {
    const secret = config.jwtRefreshSecret as unknown as jwt.Secret;
    const options: jwt.SignOptions = {
      expiresIn: config.jwtRefreshExpiry as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(
      { userId: user._id, tokenVersion: Date.now() },
      secret,
      options
    );
  }

  /**
   * Register new user
   */
  async signup(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const user = await User.create({ name, email: normalizedEmail, password });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login with email/password
   */
  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !user.password) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token (with rotation)
   */
  async refreshAccessToken(oldRefreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(oldRefreshToken, config.jwtRefreshSecret);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Check if token exists in user's refresh tokens
    const tokenIndex = user.refreshTokens.findIndex(
      (rt) => rt.token === oldRefreshToken
    );
    if (tokenIndex === -1) {
      // Token not found — possible token reuse attack, invalidate all
      user.refreshTokens = [];
      await user.save();
      throw new ApiError(401, 'Token reuse detected — all sessions invalidated');
    }

    // Remove old token (rotation)
    user.refreshTokens.splice(tokenIndex, 1);

    // Generate new tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    return { accessToken, refreshToken };
  }

  /**
   * Logout — remove specific refresh token
   */
  async logout(userId: string, refreshToken: string) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
  }

  /**
   * Generate password reset token
   */
  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (err) {
      // Don't leak email-sending failures to the client (avoids user enumeration
      // and info disclosure) — just log it server-side for debugging.
      console.error('❌ Failed to send password reset email:', err);
    }

    return { message: 'If email exists, a reset link has been sent' };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return { message: 'Password reset successful' };
  }

  /**
   * Handle Google OAuth login/signup
   */
  async handleGoogleAuth(profile: {
    id: string;
    displayName: string;
    email: string;
    photo?: string;
  }) {
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.email }],
    });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = profile.id;
        if (!user.avatar && profile.photo) {
          user.avatar = profile.photo;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.email,
        googleId: profile.id,
        avatar: profile.photo || '',
        isVerified: true,
      });
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: { name?: string; avatar?: string }) {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: IUserDocument) {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export default new AuthService();
