"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragQuerySchema = exports.generateRoadmapSchema = exports.interviewAnswerSchema = exports.interviewConfigSchema = exports.jdMatchSchema = exports.createResumeSchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Auth Schemas
// ============================================
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).optional(),
    avatar: zod_1.z.string().url().optional(),
});
// ============================================
// Resume Schemas
// ============================================
exports.createResumeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// ============================================
// JD Matching Schemas
// ============================================
exports.jdMatchSchema = zod_1.z.object({
    resumeId: zod_1.z.string().min(1, 'Resume ID is required'),
    jobDescription: zod_1.z.string().min(50, 'Job description must be at least 50 characters'),
    companyName: zod_1.z.string().optional(),
    roleName: zod_1.z.string().optional(),
});
// ============================================
// Mock Interview Schemas
// ============================================
exports.interviewConfigSchema = zod_1.z.object({
    company: zod_1.z.string().min(1, 'Company name is required'),
    role: zod_1.z.string().min(1, 'Role is required'),
    experienceLevel: zod_1.z.enum(['Fresher', 'Junior', 'Mid', 'Senior', 'Lead']),
    interviewType: zod_1.z.enum(['Technical', 'Behavioral', 'System Design', 'HR', 'Mixed']),
    numberOfQuestions: zod_1.z.number().min(3).max(15).default(5),
});
exports.interviewAnswerSchema = zod_1.z.object({
    answer: zod_1.z.string().min(1, 'Answer cannot be empty'),
});
// ============================================
// Learning Roadmap Schemas
// ============================================
exports.generateRoadmapSchema = zod_1.z.object({
    goal: zod_1.z.string().min(5, 'Goal must be descriptive'),
    targetRole: zod_1.z.string().min(1, 'Target role is required'),
    currentSkills: zod_1.z.array(zod_1.z.string()).min(1, 'List at least one current skill'),
    duration: zod_1.z.number().min(1).max(24).default(4),
});
// ============================================
// RAG Schemas
// ============================================
exports.ragQuerySchema = zod_1.z.object({
    question: zod_1.z.string().min(5, 'Question must be at least 5 characters'),
});
//# sourceMappingURL=index.js.map