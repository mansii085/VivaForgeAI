import { Router, Response, NextFunction } from 'express';
import { protect, type AuthRequest } from '../../middleware/auth.js';
import { jdMatcherService } from './service.js';

const router: Router = Router();

router.post(
  '/analyze',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resumeId, jobDescription, companyName, roleName } = req.body;
      if (!resumeId || !jobDescription) {
        res.status(400).json({ success: false, error: 'resumeId and jobDescription are required.' });
        return;
      }
      const result = await jdMatcherService.matchResumeToJD(req.user._id, resumeId, jobDescription, companyName, roleName);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const matches = await jdMatcherService.getMatches(req.user._id);
      res.json({ success: true, data: matches });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const match = await jdMatcherService.getMatchById(req.user._id, req.params.id as string);
      res.json({ success: true, data: match });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await jdMatcherService.deleteMatch(req.user._id, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
