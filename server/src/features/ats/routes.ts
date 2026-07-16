import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { atsService } from './service.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import ATSAnalysis from './model.js';

const router: Router = Router();

// Configure multer to store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Only accept PDF for now
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only PDF files are supported currently.') as any, false);
    }
  },
});

export const analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No resume file uploaded.');
    }

    const result = await atsService.analyzeResume(req.file, req.user!._id.toString());

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Route: POST /api/ats/analyze
// Protected route, requires authentication
router.post('/analyze', protect, upload.single('resume'), analyzeResume as any);

// Route: GET /api/ats/latest
// Get the most recent ATS analysis for the logged-in user
export const getLatestAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const latest = await ATSAnalysis.findOne({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: latest, // Will be null if none exists
    });
  } catch (error) {
    next(error);
  }
};
router.get('/latest', protect, getLatestAnalysis as any);

export default router;
