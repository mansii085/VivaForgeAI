import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestionDoc {
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

export interface IInterviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  config: {
    company: string;
    role: string;
    experienceLevel: 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
    interviewType: 'Technical' | 'Behavioral' | 'System Design' | 'HR' | 'Mixed';
    numberOfQuestions: number;
  };
  questions: IInterviewQuestionDoc[];
  overallScores?: {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    overallScore: number;
  };
  finalFeedback?: {
    summary: string;
    topStrengths: string[];
    areasToImprove: string[];
    recommendedResources: string[];
    readinessLevel: 'Not Ready' | 'Needs Work' | 'Almost Ready' | 'Ready';
  };
  duration: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    config: {
      company: { type: String, required: true },
      role: { type: String, required: true },
      experienceLevel: {
        type: String,
        enum: ['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'],
        required: true,
      },
      interviewType: {
        type: String,
        enum: ['Technical', 'Behavioral', 'System Design', 'HR', 'Mixed'],
        required: true,
      },
      numberOfQuestions: { type: Number, required: true, min: 1, max: 15 },
    },
    questions: [
      {
        question: { type: String, required: true },
        category: { type: String, required: true },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
        userAnswer: { type: String },
        evaluation: {
          type: Schema.Types.Mixed,
        },
      },
    ],
    overallScores: { type: Schema.Types.Mixed },
    finalFeedback: { type: Schema.Types.Mixed },
    duration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ userId: 1, createdAt: -1 });

const Interview = mongoose.model<IInterviewDocument>('Interview', interviewSchema);
export default Interview;
