import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/env.js';
import { ApiError } from '../../middleware/errorHandler.js';
import JDMatch from './model.js';
import Resume from '../resume/model.js';
import { extractJson } from '../../utils/jsonParser.js';

class JDMatcherService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  async matchResumeToJD(
    userId: string,
    resumeId: string,
    jobDescription: string,
    companyName: string = '',
    roleName: string = ''
  ) {
    if (!this.genAI) {
      throw new ApiError(503, 'Gemini API key is not configured.');
    }

    const resume = await Resume.findOne({ _id: resumeId, userId }).lean();
    if (!resume) {
      throw new ApiError(404, 'Resume not found.');
    }

    const resumeText = resume.extractedText || JSON.stringify(resume.parsedData);
    if (!resumeText || resumeText.trim().length === 0) {
        throw new ApiError(400, 'Resume does not contain any extractable text.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert technical recruiter and ATS system. Compare the provided Job Description against the candidate's Resume.
      
      Output ONLY valid JSON matching this exact schema, without markdown formatting:
      {
        "overallMatch": number (0-100),
        "skillMatch": {
          "matched": ["skill1", "skill2"],
          "missing": ["skill3", "skill4"],
          "percentage": number (0-100)
        },
        "experienceMatch": {
          "score": number (0-100),
          "feedback": "string (1-2 sentences on experience alignment)"
        },
        "keywordAnalysis": {
          "critical": [{ "keyword": "string", "found": boolean, "context": "string (where it was found or why it matters)" }],
          "important": [{ "keyword": "string", "found": boolean, "context": "string" }],
          "niceToHave": [{ "keyword": "string", "found": boolean, "context": "string" }]
        },
        "interviewDifficulty": {
          "level": "Easy" | "Medium" | "Hard" | "Expert",
          "score": number (0-100, where 100 is hardest),
          "reasoning": "string (why this difficulty based on the gap)"
        },
        "tailoredSuggestions": ["string (actionable advice to improve match)"],
        "coverLetterPoints": ["string (key points to highlight in a cover letter)"]
      }

      Job Description:
      """
      ${jobDescription}
      """

      Resume:
      """
      ${resumeText}
      """
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      const matchResult = extractJson(text);

      const newMatch = await JDMatch.create({
        userId,
        resumeId,
        jobDescription,
        companyName,
        roleName,
        matchResult,
      });

      return newMatch;
    } catch (error) {
      console.error('JD Match Error:', error);
      throw new ApiError(500, 'Failed to analyze job description match.');
    }
  }

  async getMatches(userId: string) {
    return JDMatch.find({ userId }).sort({ createdAt: -1 }).populate('resumeId', 'title version').lean();
  }

  async getMatchById(userId: string, matchId: string) {
    const match = await JDMatch.findOne({ _id: matchId, userId }).populate('resumeId', 'title version').lean();
    if (!match) throw new ApiError(404, 'Match not found');
    return match;
  }

  async deleteMatch(userId: string, matchId: string) {
    const match = await JDMatch.findOneAndDelete({ _id: matchId, userId });
    if (!match) throw new ApiError(404, 'Match not found');
    return { message: 'Match deleted successfully' };
  }
}

export const jdMatcherService = new JDMatcherService();
