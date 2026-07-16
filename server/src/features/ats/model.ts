import mongoose, { Document, Schema } from 'mongoose';

export interface IAtsAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId;
  resumeUrl?: string;
  overallScore: number;
  breakdown: { label: string; score: number }[];
  improvements: { type: 'success' | 'warning'; title: string; description: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const atsAnalysisSchema = new Schema<IAtsAnalysisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeUrl: { type: String },
    overallScore: { type: Number, required: true },
    breakdown: [
      {
        label: { type: String, required: true },
        score: { type: Number, required: true },
      },
    ],
    improvements: [
      {
        type: { type: String, enum: ['success', 'warning'], required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

atsAnalysisSchema.index({ userId: 1, createdAt: -1 });

const ATSAnalysis = mongoose.model<IAtsAnalysisDocument>('ATSAnalysis', atsAnalysisSchema);
export default ATSAnalysis;
