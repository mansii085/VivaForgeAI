import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/env.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { extractJson } from '../../utils/jsonParser.js';
import Roadmap, { type IRoadmapDocument } from './model.js';

class LearningService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  async generateRoadmap(userId: string, targetRole: string, currentSkills: string[], durationWeeks: number) {
    if (!this.genAI) throw new ApiError(503, 'Gemini API key is not configured.');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert technical career coach. Create a ${durationWeeks}-week study roadmap for someone aiming to become a ${targetRole}.
      Their current skills are: ${currentSkills.join(', ')}. Focus on the skills they need to learn or improve.
      
      Output ONLY valid JSON matching this schema:
      {
        "goal": "string (1 sentence summarizing the objective)",
        "targetSkills": ["string (list of skills they will learn)"],
        "roadmap": [
          {
            "week": number (1 to ${durationWeeks}),
            "theme": "string (e.g., Advanced React Patterns)",
            "topics": [
              {
                "name": "string",
                "description": "string",
                "estimatedHours": number,
                "day": number (1 to 7),
                "resources": [
                  {
                    "title": "string",
                    "url": "string (can be a generic search link if specific URL not known)",
                    "type": "video" | "article" | "practice"
                  }
                ]
              }
            ]
          }
        ]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      const parsed = extractJson(text);

      let totalTopics = 0;
      parsed.roadmap.forEach((week: any) => {
        totalTopics += week.topics.length;
      });

      const newRoadmap = await Roadmap.create({
        userId,
        goal: parsed.goal,
        targetRole,
        currentSkills,
        targetSkills: parsed.targetSkills,
        duration: durationWeeks,
        roadmap: parsed.roadmap,
        progress: {
          completedTopics: 0,
          totalTopics,
          currentWeek: 1,
        },
      });

      return newRoadmap;
    } catch (error) {
      console.error('Roadmap Generation Error:', error);
      throw new ApiError(500, 'Failed to generate learning roadmap.');
    }
  }

  async toggleTopic(userId: string, roadmapId: string, weekIndex: number, topicIndex: number) {
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new ApiError(404, 'Roadmap not found');

    const topic = roadmap.roadmap[weekIndex].topics[topicIndex];
    if (!topic) throw new ApiError(400, 'Topic not found');

    const isCompleting = !topic.isCompleted;
    topic.isCompleted = isCompleting;
    topic.completedAt = isCompleting ? new Date() : undefined;

    roadmap.progress.completedTopics += isCompleting ? 1 : -1;
    
    if (isCompleting) {
      roadmap.progress.lastActivityDate = new Date();
    }

    await roadmap.save();
    return roadmap;
  }

  async getRoadmaps(userId: string) {
    return Roadmap.find({ userId }).select('-roadmap').sort({ createdAt: -1 }).lean();
  }

  async getRoadmapById(userId: string, roadmapId: string) {
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId }).lean();
    if (!roadmap) throw new ApiError(404, 'Roadmap not found');
    return roadmap;
  }

  async deleteRoadmap(userId: string, roadmapId: string) {
    const roadmap = await Roadmap.findOneAndDelete({ _id: roadmapId, userId });
    if (!roadmap) throw new ApiError(404, 'Roadmap not found');
    return { message: 'Roadmap deleted' };
  }
}

export const learningService = new LearningService();
