import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/env.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { extractJson } from '../../utils/jsonParser.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinaryUploader.js';
import Resume, { type IResumeDocument, type IParsedResumeData } from './model.js';

class ResumeService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  /**
   * Upload and process a resume PDF.
   * Extracts text, optionally parses with Gemini, saves to MongoDB.
   */
  async uploadResume(
    userId: string,
    file: Express.Multer.File
  ): Promise<IResumeDocument> {
    // 1. Extract text from PDF
    let extractedText = '';
    try {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text || '';
    } catch (err) {
      console.warn('PDF text extraction failed:', err);
      // Non-fatal — we still save the file even if text extraction fails
    }

    // 2. Generate a title from the filename
    const title = file.originalname
      .replace(/\.pdf$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // 3. Attempt AI parsing of structured data
    let parsedData: IParsedResumeData = {
      name: '',
      email: '',
      phone: '',
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
    };

    if (this.genAI && extractedText.trim().length > 0) {
      try {
        parsedData = await this.parseResumeWithAI(extractedText);
      } catch (err) {
        console.warn('AI resume parsing failed, saving with empty parsed data:', err);
      }
    }

    // 4. Upload to Cloudinary
    let cloudinaryUrl = '';
    try {
      cloudinaryUrl = await uploadBufferToCloudinary(file.buffer, 'resumes', 'auto', file.originalname);
    } catch (err) {
      console.error('Failed to upload resume to Cloudinary:', err);
      throw new ApiError(500, 'Failed to upload resume document');
    }

    // 5. Count existing resumes for versioning
    const existingCount = await Resume.countDocuments({ userId });

    // 6. Save to MongoDB
    const resume = await Resume.create({
      userId,
      title,
      originalFileName: file.originalname,
      cloudinaryUrl,
      fileMimeType: file.mimetype,
      extractedText,
      parsedData,
      version: existingCount + 1,
      isActive: true,
    });

    return resume;
  }

  /**
   * List all resumes for a user (excludes heavy fields like fileBuffer and extractedText).
   */
  async getResumes(userId: string) {
    const resumes = await Resume.find({ userId })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .lean();

    return resumes;
  }

  /**
   * Get a single resume by ID (includes all fields except fileBuffer).
   */
  async getResumeById(userId: string, resumeId: string) {
    const resume = await Resume.findOne({ _id: resumeId, userId })
      .lean();

    if (!resume) {
      throw new ApiError(404, 'Resume not found');
    }

    return resume;
  }

  /**
   * Delete a resume.
   */
  async deleteResume(userId: string, resumeId: string) {
    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });

    if (!resume) {
      throw new ApiError(404, 'Resume not found');
    }

    return { message: 'Resume deleted successfully' };
  }

  /**
   * Use Gemini to parse structured resume data from extracted text.
   */
  private async parseResumeWithAI(resumeText: string): Promise<IParsedResumeData> {
    if (!this.genAI) {
      throw new Error('Gemini AI not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert resume parser. Extract structured information from the following resume text.
      
      Strictly output ONLY valid JSON without any markdown formatting (like \`\`\`json). The JSON must match this exact schema:
      {
        "name": "string (full name)",
        "email": "string (email address or empty string)",
        "phone": "string (phone number or empty string)",
        "summary": "string (professional summary if present, or empty string)",
        "skills": ["string array of technical and soft skills"],
        "experience": [
          {
            "company": "string",
            "role": "string",
            "duration": "string (e.g. 'Jan 2020 - Dec 2022')",
            "description": "string (brief description of responsibilities)"
          }
        ],
        "education": [
          {
            "institution": "string",
            "degree": "string",
            "year": "string"
          }
        ],
        "certifications": ["string array of certifications"],
        "projects": [
          {
            "name": "string",
            "description": "string",
            "technologies": ["string array"]
          }
        ]
      }
      
      If a field cannot be found, use empty string or empty array as appropriate.
      
      Resume Text:
      """
      ${resumeText}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    return extractJson(text);
  }
}

export const resumeService = new ResumeService();
