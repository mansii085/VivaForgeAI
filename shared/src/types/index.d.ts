export interface IUser {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    googleId?: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
export type UserRole = 'user' | 'admin';
export interface IAuthResponse {
    user: IUser;
    accessToken: string;
}
export interface ILoginRequest {
    email: string;
    password: string;
}
export interface ISignupRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export interface IForgotPasswordRequest {
    email: string;
}
export interface IResetPasswordRequest {
    password: string;
    confirmPassword: string;
}
export interface IUpdateProfileRequest {
    name?: string;
    avatar?: string;
}
export interface IResume {
    _id: string;
    userId: string;
    title: string;
    originalFileName: string;
    cloudinaryUrl: string;
    extractedText: string;
    parsedData: IParsedResumeData;
    version: number;
    parentVersion?: string;
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface IParsedResumeData {
    name: string;
    email: string;
    phone: string;
    summary?: string;
    skills: string[];
    experience: IExperience[];
    education: IEducation[];
    certifications: string[];
    projects: IProject[];
}
export interface IExperience {
    company: string;
    role: string;
    duration: string;
    description: string;
}
export interface IEducation {
    institution: string;
    degree: string;
    year: string;
}
export interface IProject {
    name: string;
    description: string;
    technologies: string[];
}
export interface IATSAnalysis {
    _id: string;
    userId: string;
    resumeId: string;
    overallScore: number;
    breakdown: IATSBreakdown;
    improvements: IImprovement[];
    formattingSuggestions: string[];
    createdAt: string;
}
export interface IATSBreakdown {
    formatting: IDimensionScore;
    grammar: IDimensionScore;
    skills: IDimensionScore;
    experience: IDimensionScore;
    keywords: IDimensionScore;
    impact: IDimensionScore;
}
export interface IDimensionScore {
    score: number;
    feedback: string[];
    issues?: IIssue[];
}
export interface IIssue {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
}
export interface IImprovement {
    priority: 'high' | 'medium' | 'low';
    section: string;
    suggestion: string;
    example?: string;
}
export interface IJDMatch {
    _id: string;
    userId: string;
    resumeId: string;
    jobDescription: string;
    companyName?: string;
    roleName?: string;
    matchResult: IJDMatchResult;
    createdAt: string;
}
export interface IJDMatchResult {
    overallMatch: number;
    skillMatch: {
        matched: string[];
        missing: string[];
        percentage: number;
    };
    experienceMatch: {
        score: number;
        feedback: string;
    };
    keywordAnalysis: {
        critical: IKeyword[];
        important: IKeyword[];
        niceToHave: IKeyword[];
    };
    interviewDifficulty: {
        level: 'Easy' | 'Medium' | 'Hard' | 'Expert';
        score: number;
        reasoning: string;
    };
    tailoredSuggestions: string[];
    coverLetterPoints: string[];
}
export interface IKeyword {
    keyword: string;
    found: boolean;
    context?: string;
}
export interface IInterview {
    _id: string;
    userId: string;
    config: IInterviewConfig;
    questions: IInterviewQuestion[];
    overallScores?: IInterviewScores;
    finalFeedback?: IInterviewFeedback;
    duration: number;
    status: 'in-progress' | 'completed' | 'abandoned';
    createdAt: string;
}
export interface IInterviewConfig {
    company: string;
    role: string;
    experienceLevel: ExperienceLevel;
    interviewType: InterviewType;
    numberOfQuestions: number;
}
export type ExperienceLevel = 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
export type InterviewType = 'Technical' | 'Behavioral' | 'System Design' | 'HR' | 'Mixed';
export interface IInterviewQuestion {
    question: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    userAnswer?: string;
    evaluation?: {
        score: number;
        strengths: string[];
        improvements: string[];
        idealAnswer: string;
    };
}
export interface IInterviewScores {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    overallScore: number;
}
export interface IInterviewFeedback {
    summary: string;
    topStrengths: string[];
    areasToImprove: string[];
    recommendedResources: string[];
    readinessLevel: 'Not Ready' | 'Needs Work' | 'Almost Ready' | 'Ready';
}
export interface IRoadmap {
    _id: string;
    userId: string;
    goal: string;
    targetRole: string;
    currentSkills: string[];
    targetSkills: string[];
    duration: number;
    roadmap: IWeekPlan[];
    progress: IRoadmapProgress;
    createdAt: string;
    updatedAt: string;
}
export interface IWeekPlan {
    week: number;
    theme: string;
    topics: ITopic[];
}
export interface ITopic {
    name: string;
    description: string;
    resources: IResource[];
    estimatedHours: number;
    day: number;
    isCompleted: boolean;
    completedAt?: string;
}
export interface IResource {
    title: string;
    url: string;
    type: 'video' | 'article' | 'practice';
}
export interface IRoadmapProgress {
    completedTopics: number;
    totalTopics: number;
    currentWeek: number;
    streak: number;
    lastActivityDate?: string;
}
export interface IRAGDocument {
    _id: string;
    userId: string;
    title: string;
    originalFileName: string;
    fileType: 'pdf' | 'txt' | 'md' | 'docx';
    cloudinaryUrl: string;
    chunkCount: number;
    status: 'processing' | 'ready' | 'error';
    category: 'notes' | 'book' | 'interview-experience' | 'other';
    tags: string[];
    createdAt: string;
}
export interface IRAGQuery {
    question: string;
    answer: string;
    sources: IRAGSource[];
    createdAt: string;
}
export interface IRAGSource {
    documentId: string;
    documentTitle: string;
    chunkText: string;
    relevanceScore: number;
}
export interface IDashboardOverview {
    totalInterviews: number;
    averageATSScore: number;
    skillsLearned: number;
    learningStreak: number;
    recentActivity: IActivity[];
}
export interface IActivity {
    type: 'interview' | 'ats' | 'jd-match' | 'learning' | 'rag';
    title: string;
    description: string;
    timestamp: string;
}
export interface IApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=index.d.ts.map