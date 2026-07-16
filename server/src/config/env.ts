import dotenv from "dotenv";
import path from "path";

// Load .env from project root first, then fallback to server/.env
const rootEnv = path.resolve(process.cwd(), "../.env");
const serverEnv = path.resolve(process.cwd(), ".env");

dotenv.config({ path: rootEnv });

if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: serverEnv });
}

console.log("Current Working Directory:", process.cwd());
console.log("Loaded .env from:", process.env.GEMINI_API_KEY ? rootEnv : serverEnv);
console.log("Initializing Gemini AI...");
const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // MongoDB
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/ai-career-coach",

  // JWT
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ||
    "dev-access-secret-change-in-production",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    "dev-refresh-secret-change-in-production",
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback",

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // Pinecone
  pineconeApiKey: process.env.PINECONE_API_KEY || "",
  pineconeIndex: process.env.PINECONE_INDEX || "ai-career-coach",

  // Email
  emailService: process.env.EMAIL_SERVICE || "resend",
  emailApiKey: process.env.EMAIL_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@aicareercoach.com",
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: parseInt(process.env.EMAIL_PORT || "587", 10),
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
} as const;

export default config;