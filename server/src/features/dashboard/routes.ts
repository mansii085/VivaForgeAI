import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { dashboardController } from './controller.js';

const router: Router = Router();

// GET /api/dashboard
router.get('/', protect, dashboardController.getDashboardData);

export default router;
