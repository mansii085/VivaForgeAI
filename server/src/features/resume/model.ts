import mongoose, { Document, Schema } from 'mongoose';

export interface IParsedResumeData {
  name: string;
  email: string;
  phone: string;
  summary?: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  certifications: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

export interface IResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  originalFileName: string;
  cloudinaryUrl: string;
  fileMimeType: string;
  extractedText: string;
  parsedData: IParsedResumeData;
  version: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    fileMimeType: {
      type: String,
      default: 'application/pdf',
    },
    extractedText: {
      type: String,
      default: '',
    },
    parsedData: {
      type: Schema.Types.Mixed,
      default: {
        name: '',
        email: '',
        phone: '',
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
      },
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-specific queries
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model<IResumeDocument>('Resume', resumeSchema);
export default Resume;
