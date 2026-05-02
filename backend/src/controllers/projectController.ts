import { Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Task from '../models/Task';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middlewares/authMiddleware';

// Helper to log activities
const logActivity = async (action: string, performedBy: any, projectId?: any, taskId?: any) => {
  try {
    await ActivityLog.create({ action, performedBy, projectId, taskId });
  } catch (err) {
    console.error('Activity Log Error:', err);
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { owner: req.user?._id },
        { members: req.user?._id }
      ]
    };

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .skip(skip)
      .limit(limit);

    const projectIds = projects.map(p => p._id);
    const taskStats = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: {
          _id: "$projectId",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } }
        }
      }
    ]);

    const projectsWithMetrics = projects.map(project => {
      const stats = taskStats.find(s => s._id.toString() === project._id.toString()) || { total: 0, completed: 0 };
      return { ...project.toObject(), metrics: stats };
    });

    res.json({
      projects: projectsWithMetrics,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, startDate, endDate, tasks } = req.body;

    const userId = req.user?._id as mongoose.Types.ObjectId;
    const project = await Project.create({
      name,
      description,
      owner: userId,
      members: [userId],
      startDate,
      endDate
    });

    // Create initial tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const taskDocs = tasks.map((t: any) => ({
        title: t.title,
        description: t.description || '',
        projectId: project._id,
        assignedBy: userId,
        status: 'TODO',
        priority: 'MEDIUM'
      }));
      await Task.insertMany(taskDocs);
    }

    await logActivity('Project created', userId, project._id as any);

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: 'Invalid Project ID' });
      return;
    }

    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Ensure user is owner or member
    const isOwner = project.owner._id.toString() === req.user?._id?.toString();
    const isMember = project.members.some((m: any) => m._id.toString() === req.user?._id?.toString());

    if (!isOwner && !isMember) {
      res.status(403).json({ message: 'Not authorized to view this project' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.owner.toString() !== req.user?._id?.toString() && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only project owner or admin can update project' });
      return;
    }

    project.name = name || project.name;
    project.description = description || project.description;
    await project.save();

    await logActivity('Project updated', req.user?._id, project._id);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.owner.toString() !== req.user?._id?.toString() && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only project owner or admin can delete project' });
      return;
    }

    // Cascade delete tasks and activity logs associated with this project
    await Task.deleteMany({ projectId: req.params.id });
    await ActivityLog.deleteMany({ projectId: req.params.id });
    
    await Project.deleteOne({ _id: req.params.id });

    await logActivity('Project deleted', req.user?._id, undefined, undefined);

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Invite member to project
// @route   POST /api/projects/:id/invite
// @access  Private/Admin
export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string) || !mongoose.Types.ObjectId.isValid(userId as string)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.owner.toString() !== req.user?._id?.toString() && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only project owner or admin can invite members' });
      return;
    }

    if (project.members.includes(userId)) {
      res.status(400).json({ message: 'User is already a member' });
      return;
    }

    project.members.push(userId);
    await project.save();

    await logActivity(`Member ${userId} invited`, req.user?._id, project._id);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
