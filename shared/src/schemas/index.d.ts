import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const signupSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}>, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatar?: string | undefined;
}, {
    name?: string | undefined;
    avatar?: string | undefined;
}>;
export declare const createResumeSchema: z.ZodObject<{
    title: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    tags?: string[] | undefined;
}, {
    title: string;
    tags?: string[] | undefined;
}>;
export declare const jdMatchSchema: z.ZodObject<{
    resumeId: z.ZodString;
    jobDescription: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    roleName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    resumeId: string;
    jobDescription: string;
    companyName?: string | undefined;
    roleName?: string | undefined;
}, {
    resumeId: string;
    jobDescription: string;
    companyName?: string | undefined;
    roleName?: string | undefined;
}>;
export declare const interviewConfigSchema: z.ZodObject<{
    company: z.ZodString;
    role: z.ZodString;
    experienceLevel: z.ZodEnum<["Fresher", "Junior", "Mid", "Senior", "Lead"]>;
    interviewType: z.ZodEnum<["Technical", "Behavioral", "System Design", "HR", "Mixed"]>;
    numberOfQuestions: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    company: string;
    role: string;
    experienceLevel: "Fresher" | "Junior" | "Mid" | "Senior" | "Lead";
    interviewType: "Technical" | "Behavioral" | "System Design" | "HR" | "Mixed";
    numberOfQuestions: number;
}, {
    company: string;
    role: string;
    experienceLevel: "Fresher" | "Junior" | "Mid" | "Senior" | "Lead";
    interviewType: "Technical" | "Behavioral" | "System Design" | "HR" | "Mixed";
    numberOfQuestions?: number | undefined;
}>;
export declare const interviewAnswerSchema: z.ZodObject<{
    answer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    answer: string;
}, {
    answer: string;
}>;
export declare const generateRoadmapSchema: z.ZodObject<{
    goal: z.ZodString;
    targetRole: z.ZodString;
    currentSkills: z.ZodArray<z.ZodString, "many">;
    duration: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    goal: string;
    targetRole: string;
    currentSkills: string[];
    duration: number;
}, {
    goal: string;
    targetRole: string;
    currentSkills: string[];
    duration?: number | undefined;
}>;
export declare const ragQuerySchema: z.ZodObject<{
    question: z.ZodString;
}, "strip", z.ZodTypeAny, {
    question: string;
}, {
    question: string;
}>;
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
//# sourceMappingURL=index.d.ts.map