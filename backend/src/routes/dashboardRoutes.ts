import express from 'express';
import { getDashboardMetrics, clearActivityHistory } from '../controllers/dashboardController';
import { protect, adminRoute } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, adminRoute, getDashboardMetrics);
router.route('/activity')
  .delete(protect, adminRoute, clearActivityHistory);

export default router;
