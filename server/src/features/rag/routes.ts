import { Router, Response, NextFunction } from 'express';
import { protect, type AuthRequest } from '../../middleware/auth.js';
import { uploadDocument } from '../../middleware/upload.js';
import { ragService } from './service.js';

const router: Router = Router();

router.post(
  '/upload',
  protect,
  uploadDocument.single('document'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      const category = req.body.category || 'other';
      const tags = req.body.tags ? req.body.tags.split(',') : [];
      
      const doc = await ragService.uploadDocument(req.user._id, req.file, category, tags);
      
      // Don't return the giant chunks/buffer in the response
      const { fileBuffer, chunks, ...safeDoc } = doc.toObject();
      res.status(201).json({ success: true, data: safeDoc });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/ask',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { question } = req.body;
      if (!question) {
        res.status(400).json({ success: false, error: 'Question is required' });
        return;
      }
      const answer = await ragService.askQuestion(req.user._id, question);
      res.json({ success: true, data: answer });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/documents',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docs = await ragService.getDocuments(req.user._id);
      res.json({ success: true, data: docs });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/history',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await ragService.getQueryHistory(req.user._id);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/documents/:id',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ragService.deleteDocument(req.user._id, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
