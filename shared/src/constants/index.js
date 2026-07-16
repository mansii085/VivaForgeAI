"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_LIMITS = exports.ACTIVITY_TYPES = exports.RAG_CATEGORIES = exports.ATS_DIMENSIONS = exports.READINESS_LEVELS = exports.DIFFICULTY_LEVELS = exports.INTERVIEW_TYPES = exports.EXPERIENCE_LEVELS = exports.USER_ROLES = void 0;
// ============================================
// User Roles
// ============================================
exports.USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
};
// ============================================
// Interview Constants
// ============================================
exports.EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];
exports.INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'HR', 'Mixed'];
exports.DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
exports.READINESS_LEVELS = ['Not Ready', 'Needs Work', 'Almost Ready', 'Ready'];
// ============================================
// ATS Score Dimensions
// ============================================
exports.ATS_DIMENSIONS = [
    'formatting',
    'grammar',
    'skills',
    'experience',
    'keywords',
    'impact',
];
// ============================================
// RAG Document Categories
// ============================================
exports.RAG_CATEGORIES = ['notes', 'book', 'interview-experience', 'other'];
// ============================================
// Activity Types
// ============================================
exports.ACTIVITY_TYPES = ['interview', 'ats', 'jd-match', 'learning', 'rag'];
// ============================================
// API Limits
// ============================================
exports.API_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_RESUME_PAGES: 5,
    MAX_JD_LENGTH: 10000,
    MAX_QUESTIONS_PER_INTERVIEW: 15,
    MIN_QUESTIONS_PER_INTERVIEW: 3,
    MAX_ROADMAP_WEEKS: 24,
    ITEMS_PER_PAGE: 10,
};
//# sourceMappingURL=index.js.map