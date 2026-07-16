import mongoose, { Document, Schema } from 'mongoose';

export interface IJDMatchDocument extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescription: string;
  companyName: string;
  roleName: string;
  matchResult: {
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
      critical: { keyword: string; found: boolean; context?: string }[];
      important: { keyword: string; found: boolean; context?: string }[];
      niceToHave: { keyword: string; found: boolean; context?: string }[];
    };
    interviewDifficulty: {
      level: 'Easy' | 'Medium' | 'Hard' | 'Expert';
      score: number;
      reasoning: string;
    };
    tailoredSuggestions: string[];
    coverLetterPoints: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const jdMatchSchema = new Schema<IJDMatchDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    roleName: {
      type: String,
      default: '',
    },
    matchResult: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

jdMatchSchema.index({ userId: 1, createdAt: -1 });

const JDMatch = mongoose.model<IJDMatchDocument>('JDMatch', jdMatchSchema);
export default JDMatch;
