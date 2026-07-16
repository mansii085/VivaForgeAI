// ============================================
// User Roles
// ============================================
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// ============================================
// Interview Constants
// ============================================
export const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'] as const;
export const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'HR', 'Mixed'] as const;
export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export const READINESS_LEVELS = ['Not Ready', 'Needs Work', 'Almost Ready', 'Ready'] as const;

// ============================================
// ATS Score Dimensions
// ============================================
export const ATS_DIMENSIONS = [
  'formatting',
  'grammar',
  'skills',
  'experience',
  'keywords',
  'impact',
] as const;

// ============================================
// RAG Document Categories
// ============================================
export const RAG_CATEGORIES = ['notes', 'book', 'interview-experience', 'other'] as const;

// ============================================
// Activity Types
// ============================================
export const ACTIVITY_TYPES = ['interview', 'ats', 'jd-match', 'learning', 'rag'] as const;

// ============================================
// API Limits
// ============================================
export const API_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_RESUME_PAGES: 5,
  MAX_JD_LENGTH: 10000,
  MAX_QUESTIONS_PER_INTERVIEW: 15,
  MIN_QUESTIONS_PER_INTERVIEW: 3,
  MAX_ROADMAP_WEEKS: 24,
  ITEMS_PER_PAGE: 10,
} as const;
