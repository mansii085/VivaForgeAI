import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { dashboardService } from './service.js';

class DashboardController {
  public async getDashboardData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getDashboardData(req.user!._id);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
