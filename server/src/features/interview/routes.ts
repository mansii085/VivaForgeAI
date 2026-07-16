import { Router, Response, NextFunction } from 'express';
import { protect, type AuthRequest } from '../../middleware/auth.js';
import { interviewService } from './service.js';

const router: Router = Router();

router.post(
  '/start',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = req.body;
      const interview = await interviewService.startInterview(req.user._id, config);
      res.status(201).json({ success: true, data: interview });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/answer',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { questionIndex, answer } = req.body;
      const evaluation = await interviewService.submitAnswer(req.user._id, req.params.id as string, questionIndex, answer);
      res.json({ success: true, data: evaluation });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/finish',
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await interviewService.finishInterview(req.user._id, req.params.id as string);
      res.json({ success: true, data: interview });
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
      const interviews = await interviewService.getInterviews(req.user._id);
      res.json({ success: true, data: interviews });
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
      const interview = await interviewService.getInterviewById(req.user._id, req.params.id as string);
      res.json({ success: true, data: interview });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
