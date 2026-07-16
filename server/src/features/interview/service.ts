import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/env.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { extractJson } from '../../utils/jsonParser.js';
import Interview, { type IInterviewDocument } from './model.js';

class InterviewService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  async startInterview(userId: string, configData: IInterviewDocument['config']) {
    if (!this.genAI) throw new ApiError(503, 'Gemini API key is not configured.');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert technical interviewer for ${configData.company} hiring for a ${configData.experienceLevel} ${configData.role} role.
      The interview type is ${configData.interviewType}.
      Generate exactly ${configData.numberOfQuestions} interview questions tailored to this scenario.
      
      Output ONLY valid JSON matching this schema:
      {
        "questions": [
          {
            "question": "string",
            "category": "string (e.g., Data Structures, System Design, Behavioral, React)",
            "difficulty": "Easy" | "Medium" | "Hard"
          }
        ]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      const parsed = extractJson(text);

      const interview = await Interview.create({
        userId,
        config: configData,
        questions: parsed.questions,
        status: 'in-progress',
      });
      return interview;
    } catch (error) {
      console.error('Interview Generation Error:', error);
      throw new ApiError(500, 'Failed to generate interview questions.');
    }
  }

  async submitAnswer(userId: string, interviewId: string, questionIndex: number, answer: string) {
    if (!this.genAI) throw new ApiError(503, 'Gemini API key is not configured.');

    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) throw new ApiError(404, 'Interview not found.');
    if (interview.status !== 'in-progress') throw new ApiError(400, 'Interview is not in progress.');
    if (questionIndex < 0 || questionIndex >= interview.questions.length) throw new ApiError(400, 'Invalid question index.');

    const questionDoc = interview.questions[questionIndex];
    questionDoc.userAnswer = answer;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are evaluating a candidate's answer to an interview question for a ${interview.config.role} role at ${interview.config.company}.
      
      Question: "${questionDoc.question}"
      Category: ${questionDoc.category}
      Difficulty: ${questionDoc.difficulty}
      
      Candidate's Answer: "${answer}"
      
      Evaluate the answer and provide ONLY valid JSON matching this schema:
      {
        "score": number (0-100),
        "strengths": ["string"],
        "improvements": ["string"],
        "idealAnswer": "string (how you would ideally answer this briefly)"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      questionDoc.evaluation = extractJson(text);

      await interview.save();
      return questionDoc;
    } catch (error) {
      console.error('Answer Evaluation Error:', error);
      throw new ApiError(500, 'Failed to evaluate answer.');
    }
  }

  async finishInterview(userId: string, interviewId: string) {
    if (!this.genAI) throw new ApiError(503, 'Gemini API key is not configured.');

    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) throw new ApiError(404, 'Interview not found.');
    if (interview.status !== 'in-progress') throw new ApiError(400, 'Interview is already finished.');

    const answeredQuestions = interview.questions.filter(q => q.userAnswer && q.evaluation);
    if (answeredQuestions.length === 0) throw new ApiError(400, 'No questions were answered.');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are providing final feedback for a ${interview.config.role} interview candidate.
      
      Here are the questions and their evaluations:
      ${JSON.stringify(answeredQuestions.map(q => ({
        question: q.question,
        score: q.evaluation?.score,
        strengths: q.evaluation?.strengths,
        improvements: q.evaluation?.improvements
      })))}
      
      Provide a final scorecard in ONLY valid JSON matching this schema:
      {
        "overallScores": {
          "communication": number (0-100),
          "technical": number (0-100),
          "confidence": number (0-100),
          "problemSolving": number (0-100),
          "overallScore": number (0-100)
        },
        "finalFeedback": {
          "summary": "string",
          "topStrengths": ["string"],
          "areasToImprove": ["string"],
          "recommendedResources": ["string"],
          "readinessLevel": "Not Ready" | "Needs Work" | "Almost Ready" | "Ready"
        }
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      const parsed = extractJson(text);

      interview.overallScores = parsed.overallScores;
      interview.finalFeedback = parsed.finalFeedback;
      interview.status = 'completed';

      await interview.save();
      return interview;
    } catch (error) {
      console.error('Interview Finalization Error:', error);
      throw new ApiError(500, 'Failed to generate final scorecard.');
    }
  }

  async getInterviews(userId: string) {
    return Interview.find({ userId }).select('-questions').sort({ createdAt: -1 }).lean();
  }

  async getInterviewById(userId: string, interviewId: string) {
    const interview = await Interview.findOne({ _id: interviewId, userId }).lean();
    if (!interview) throw new ApiError(404, 'Interview not found');
    return interview;
  }
}

export const interviewService = new InterviewService();
