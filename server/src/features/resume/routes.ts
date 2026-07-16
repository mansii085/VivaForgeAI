import { Router, Response, NextFunction } from 'express';
import { uploadResume } from '../../middleware/upload.js';
import { protect, type AuthRequest } from '../../middleware/auth.js';
import { resumeService } from './service.js';

const router: Router = Router();

// POST /api/resumes/upload — Upload a new resume
router.post(
  '/upload',
  protect,
  uploadResume.single('resume'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const resume = await resumeService.uploadResume(req.user._id, req.file);

      res.status(201).json({
        success: true,
        data: {
          _id: resume._id,
          title: resume.title,
          originalFileName: resume.originalFileName,
          version: resume.version,
          parsedData: resume.parsedData,
          tags: resume.tags,
          isActive: resume.isActive,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/resumes — List all resumes for the authenticated user
router.get(
  '/',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resumes = await resumeService.getResumes(req.user._id);
      res.json({ success: true, data: resumes });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/resumes/:id — Get a single resume
router.get(
  '/:id',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resume = await resumeService.getResumeById(req.user._id, req.params.id as string);
      res.json({ success: true, data: resume });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/resumes/:id — Delete a resume
router.delete(
  '/:id',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await resumeService.deleteResume(req.user._id, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
