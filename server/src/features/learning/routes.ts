import { Router, Response, NextFunction } from 'express';
import { protect, type AuthRequest } from '../../middleware/auth.js';
import { learningService } from './service.js';

const router: Router = Router();

router.post(
  '/generate',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { targetRole, currentSkills, durationWeeks } = req.body;
      const roadmap = await learningService.generateRoadmap(req.user._id, targetRole, currentSkills, durationWeeks);
      res.status(201).json({ success: true, data: roadmap });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/toggle',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { weekIndex, topicIndex } = req.body;
      const roadmap = await learningService.toggleTopic(req.user._id, req.params.id as string, weekIndex, topicIndex);
      res.json({ success: true, data: roadmap });
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
      const roadmaps = await learningService.getRoadmaps(req.user._id);
      res.json({ success: true, data: roadmaps });
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
      const roadmap = await learningService.getRoadmapById(req.user._id, req.params.id as string);
      res.json({ success: true, data: roadmap });
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
      const result = await learningService.deleteRoadmap(req.user._id, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
