import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { protect, adminRoute } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, adminRoute, createTask);

router.route('/:id')
  .get(protect, getTasks) // Simplification for MVP, usually a getTaskById
  .put(protect, updateTask)
  .delete(protect, adminRoute, deleteTask);

export default router;
