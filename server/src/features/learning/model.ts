import mongoose, { Document, Schema } from 'mongoose';

export interface ITopicDoc {
  name: string;
  description: string;
  resources: { title: string; url: string; type: 'video' | 'article' | 'practice' }[];
  estimatedHours: number;
  day: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IWeekPlanDoc {
  week: number;
  theme: string;
  topics: ITopicDoc[];
}

export interface IRoadmapDocument extends Document {
  userId: mongoose.Types.ObjectId;
  goal: string;
  targetRole: string;
  currentSkills: string[];
  targetSkills: string[];
  duration: number;
  roadmap: IWeekPlanDoc[];
  progress: {
    completedTopics: number;
    totalTopics: number;
    currentWeek: number;
    lastActivityDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const roadmapSchema = new Schema<IRoadmapDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goal: { type: String, required: true },
    targetRole: { type: String, required: true },
    currentSkills: [{ type: String }],
    targetSkills: [{ type: String }],
    duration: { type: Number, required: true, min: 1, max: 24 },
    roadmap: [
      {
        week: { type: Number, required: true },
        theme: { type: String, required: true },
        topics: [
          {
            name: { type: String, required: true },
            description: { type: String, required: true },
            resources: [
              {
                title: { type: String, required: true },
                url: { type: String, required: true },
                type: { type: String, enum: ['video', 'article', 'practice'], required: true },
              },
            ],
            estimatedHours: { type: Number, required: true },
            day: { type: Number, required: true },
            isCompleted: { type: Boolean, default: false },
            completedAt: { type: Date },
          },
        ],
      },
    ],
    progress: {
      completedTopics: { type: Number, default: 0 },
      totalTopics: { type: Number, default: 0 },
      currentWeek: { type: Number, default: 1 },
      lastActivityDate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ userId: 1, createdAt: -1 });

const Roadmap = mongoose.model<IRoadmapDocument>('Roadmap', roadmapSchema);
export default Roadmap;
