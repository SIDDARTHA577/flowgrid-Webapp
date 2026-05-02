import express from 'express';
import { getProjects, createProject, getProjectById, inviteMember, updateProject, deleteProject } from '../controllers/projectController';
import { protect, adminRoute } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, adminRoute, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminRoute, updateProject)
  .delete(protect, adminRoute, deleteProject);

router.post('/:id/invite', protect, adminRoute, inviteMember);

export default router;
