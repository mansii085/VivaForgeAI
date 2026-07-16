import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  googleId?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  refreshTokens: { token: string; expiresAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: '',
    },
    googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Clean up expired refresh tokens on save
userSchema.pre('save', function (next) {
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter(
      (rt) => rt.expiresAt > new Date()
    );
  }
  next();
});

const User = mongoose.model<IUserDocument>('User', userSchema);
export default User;
