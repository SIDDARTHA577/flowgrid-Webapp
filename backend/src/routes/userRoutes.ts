import express from 'express';
import { getUsers } from '../controllers/userController';
import { protect, adminRoute } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, adminRoute, getUsers);

export default router;
