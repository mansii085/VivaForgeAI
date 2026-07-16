import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import config from '../../config/env.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { extractJson } from '../../utils/jsonParser.js';
import { uploadBufferToCloudinary } from '../../utils/cloudinaryUploader.js';
import { RAGDocument, RAGQuery } from './model.js';

class RAGService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  async uploadDocument(userId: string, file: Express.Multer.File, category: string, tags: string[] = []) {
    let extractedText = '';
    try {
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text || '';
      } else {
        extractedText = file.buffer.toString('utf-8');
      }
    } catch (err) {
      throw new ApiError(400, 'Failed to extract text from document.');
    }

    if (!extractedText.trim()) {
      throw new ApiError(400, 'Document contains no extractable text.');
    }

    // Simple chunking strategy (approx 500 words per chunk)
    const words = extractedText.split(/\s+/);
    const chunks: { index: number; text: string }[] = [];
    const CHUNK_SIZE = 500;
    
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      chunks.push({
        index: i / CHUNK_SIZE,
        text: words.slice(i, i + CHUNK_SIZE).join(' '),
      });
    }

    // Upload to Cloudinary
    let cloudinaryUrl = '';
    try {
      cloudinaryUrl = await uploadBufferToCloudinary(file.buffer, 'knowledge-base', 'auto', file.originalname);
    } catch (uploadErr) {
      console.error('RAG Cloudinary upload failed:', uploadErr);
      throw new ApiError(500, 'Failed to upload document to Cloudinary');
    }

    const doc = await RAGDocument.create({
      userId,
      title: file.originalname.split('.')[0],
      originalFileName: file.originalname,
      fileType: file.mimetype === 'application/pdf' ? 'pdf' : 'txt',
      cloudinaryUrl,
      chunks,
      status: 'ready',
      category,
      tags,
    });

    return doc;
  }

  async askQuestion(userId: string, question: string) {
    if (!this.genAI) throw new ApiError(503, 'Gemini API key is not configured.');

    // 1. Fetch all user documents
    const docs = await RAGDocument.find({ userId, status: 'ready' }).select('title chunks').lean();
    if (docs.length === 0) throw new ApiError(400, 'No documents available to query.');

    // 2. Prepare context (due to 1.5-flash large context window, we can send a lot of chunks directly)
    // We will limit to first 100 chunks across all docs to avoid massive payloads for simple accounts
    let contextText = '';
    const chunkMap = new Map();
    let chunkCount = 0;

    for (const doc of docs) {
      for (const chunk of doc.chunks) {
        if (chunkCount > 100) break;
        const chunkId = `[Doc: ${doc.title} - Chunk ${chunk.index}]`;
        contextText += `\n\n${chunkId}:\n${chunk.text}`;
        chunkMap.set(chunkId, { documentId: doc._id, documentTitle: doc.title, chunkText: chunk.text });
        chunkCount++;
      }
    }

    // 3. Ask Gemini
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an intelligent knowledge base assistant. Answer the user's question based ONLY on the provided document chunks.
      If the answer is not contained in the provided chunks, say "I cannot answer this based on the provided documents."
      
      For every claim you make, you MUST cite the source using the exact chunk ID format provided (e.g. [Doc: Title - Chunk 0]).
      
      Output ONLY valid JSON matching this schema:
      {
        "answer": "string (your detailed answer with inline citations)",
        "usedCitations": ["string (exact chunk IDs used)"]
      }

      Context Chunks:
      ${contextText}

      User Question: "${question}"
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      const parsed = extractJson(text);

      // 4. Map citations back to our chunk records for the response
      const sources = parsed.usedCitations.map((citation: string) => {
        const chunkRef = chunkMap.get(citation);
        if (chunkRef) {
          return {
            documentId: chunkRef.documentId,
            documentTitle: chunkRef.documentTitle,
            chunkText: chunkRef.chunkText.substring(0, 200) + '...', // short preview
            relevanceScore: 1, // simplified
          };
        }
        return null;
      }).filter(Boolean);

      const queryRecord = await RAGQuery.create({
        userId,
        question,
        answer: parsed.answer,
        sources,
      });

      return queryRecord;
    } catch (error) {
      console.error('RAG Query Error:', error);
      throw new ApiError(500, 'Failed to process RAG query.');
    }
  }

  async getDocuments(userId: string) {
    return RAGDocument.find({ userId }).select('-chunks').sort({ createdAt: -1 }).lean();
  }

  async deleteDocument(userId: string, docId: string) {
    const doc = await RAGDocument.findOneAndDelete({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');
    return { message: 'Document deleted' };
  }

  async getQueryHistory(userId: string) {
    return RAGQuery.find({ userId }).sort({ createdAt: -1 }).lean();
  }
}

export const ragService = new RAGService();
