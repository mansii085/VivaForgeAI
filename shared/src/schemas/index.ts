import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
});

// ============================================
// Resume Schemas
// ============================================
export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  tags: z.array(z.string()).optional(),
});

// ============================================
// JD Matching Schemas
// ============================================
export const jdMatchSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  companyName: z.string().optional(),
  roleName: z.string().optional(),
});

// ============================================
// Mock Interview Schemas
// ============================================
export const interviewConfigSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  experienceLevel: z.enum(['Fresher', 'Junior', 'Mid', 'Senior', 'Lead']),
  interviewType: z.enum(['Technical', 'Behavioral', 'System Design', 'HR', 'Mixed']),
  numberOfQuestions: z.number().min(3).max(15).default(5),
});

export const interviewAnswerSchema = z.object({
  answer: z.string().min(1, 'Answer cannot be empty'),
});

// ============================================
// Learning Roadmap Schemas
// ============================================
export const generateRoadmapSchema = z.object({
  goal: z.string().min(5, 'Goal must be descriptive'),
  targetRole: z.string().min(1, 'Target role is required'),
  currentSkills: z.array(z.string()).min(1, 'List at least one current skill'),
  duration: z.number().min(1).max(24).default(4),
});

// ============================================
// RAG Schemas
// ============================================
export const ragQuerySchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
});

// Type exports from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type JDMatchInput = z.infer<typeof jdMatchSchema>;
export type InterviewConfigInput = z.infer<typeof interviewConfigSchema>;
export type InterviewAnswerInput = z.infer<typeof interviewAnswerSchema>;
export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;
export type RAGQueryInput = z.infer<typeof ragQuerySchema>;
