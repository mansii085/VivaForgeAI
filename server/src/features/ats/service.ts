import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../../config/env.js";
import { ApiError } from "../../middleware/errorHandler.js";
import { extractJson } from "../../utils/jsonParser.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUploader.js";
import ATSAnalysis from "./model.js";

export class AtsService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    console.log("======================================");
    console.log("Gemini API Key Loaded:", !!config.geminiApiKey);
    if (config.geminiApiKey && config.geminiApiKey.trim() !== "") {
      console.log("✅ Initializing Gemini AI...");
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      console.log("✅ Gemini AI Initialized Successfully");
    } else {
      console.log("❌ Gemini API Key Missing");
    }

    console.log("======================================");
  }

  public async analyzeResume(file: Express.Multer.File, userId: string): Promise<any> {
    if (!this.genAI) {
      throw new ApiError(
        503,
        "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file."
      );
    }

    try {
      // Extract text from PDF
      const pdfData = await pdfParse(file.buffer);
      const resumeText = pdfData.text;

      if (!resumeText || resumeText.trim().length === 0) {
        throw new ApiError(
          400,
          "Could not extract text from the provided PDF."
        );
      }

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
You are an expert ATS (Applicant Tracking System) parser and technical recruiter.

Analyze the following resume and return ONLY valid JSON.

{
  "overallScore": number,
  "breakdown":[
    {"label":"Formatting & Structure","score":number},
    {"label":"Impact & Metrics","score":number},
    {"label":"Skills & Keywords","score":number}
  ],
  "improvements":[
    {
      "type":"warning|success",
      "title":"string",
      "description":"string"
    }
  ]
}

Resume:
"""
${resumeText}
"""
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsedData = extractJson(text);

      // Upload to Cloudinary
      let cloudinaryUrl = '';
      try {
        cloudinaryUrl = await uploadBufferToCloudinary(file.buffer, 'ats-resumes', 'auto', file.originalname);
      } catch (uploadErr) {
        console.error('ATS Cloudinary upload failed:', uploadErr);
        // We can still proceed even if upload fails
      }

      // Save to database
      const atsAnalysis = new ATSAnalysis({
        userId,
        resumeUrl: cloudinaryUrl,
        overallScore: parsedData.overallScore || 0,
        breakdown: parsedData.breakdown || [],
        improvements: parsedData.improvements || [],
      });
      await atsAnalysis.save();

      return atsAnalysis;
    } catch (error: any) {
      console.error("ATS Analysis Error:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        500,
        error?.message ||
          "Failed to analyze resume. Gemini API returned an error."
      );
    }
  }
}

export const atsService = new AtsService();