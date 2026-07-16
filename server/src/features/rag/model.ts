import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// RAG Document Model
// ============================================
export interface IRAGDocumentDoc extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  originalFileName: string;
  fileType: 'pdf' | 'txt' | 'md' | 'docx';
  cloudinaryUrl: string;
  chunks: { index: number; text: string }[];
  status: 'processing' | 'ready' | 'error';
  category: 'notes' | 'book' | 'interview-experience' | 'other';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ragDocumentSchema = new Schema<IRAGDocumentDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'txt', 'md', 'docx'],
      required: true,
    },
    cloudinaryUrl: { type: String, required: true },
    chunks: [
      {
        index: { type: Number, required: true },
        text: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['processing', 'ready', 'error'],
      default: 'processing',
    },
    category: {
      type: String,
      enum: ['notes', 'book', 'interview-experience', 'other'],
      default: 'other',
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

ragDocumentSchema.index({ userId: 1, createdAt: -1 });

export const RAGDocument = mongoose.model<IRAGDocumentDoc>('RAGDocument', ragDocumentSchema);

// ============================================
// RAG Query Model
// ============================================
export interface IRAGQueryDoc extends Document {
  userId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  sources: {
    documentId: mongoose.Types.ObjectId;
    documentTitle: string;
    chunkText: string;
    relevanceScore: number;
  }[];
  createdAt: Date;
}

const ragQuerySchema = new Schema<IRAGQueryDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sources: [
      {
        documentId: { type: Schema.Types.ObjectId, ref: 'RAGDocument', required: true },
        documentTitle: { type: String, required: true },
        chunkText: { type: String, required: true },
        relevanceScore: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ragQuerySchema.index({ userId: 1, createdAt: -1 });

export const RAGQuery = mongoose.model<IRAGQueryDoc>('RAGQuery', ragQuerySchema);
