import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
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

// @desc    Get tasks with filtering & pagination
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, status, priority } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {};
    if (projectId) filter.projectId = projectId as string;
    if (status) filter.status = status as string;
    if (priority) filter.priority = priority as string;

    // If not admin, restrict to tasks assigned to them OR tasks in their projects
    if (req.user?.role !== 'ADMIN') {
      if (!projectId) {
        filter.assignedTo = req.user?._id;
      } else {
        // Must verify user is in project
        const project = await Project.findById(projectId);
        if (!project || !project.members.includes(req.user?._id as any)) {
           res.status(403).json({ message: 'Not authorized' });
           return;
        }
      }
    }
    
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name')
      .skip(skip)
      .limit(limit);

    res.json({
      tasks,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, assignedTo, projectId, priority, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Auto-add assignedTo to project members if not present
    if (!project.members.includes(assignedTo)) {
      project.members.push(assignedTo);
      await project.save();
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user?._id,
      projectId,
      priority,
      dueDate
    });

    await logActivity('Task created', req.user?._id, projectId, task._id);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // RBAC: ADMIN can do full update, MEMBER can only update status if assigned
    if (req.user?.role === 'ADMIN') {
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      
      if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
        const project = await Project.findById(task.projectId);
        if (project && !project.members.includes(assignedTo)) {
           project.members.push(assignedTo);
           await project.save();
        }
        task.assignedTo = assignedTo;
        await logActivity('Task reassigned', req.user?._id, task.projectId, task._id);
      }
    } else {
      // MEMBER
      if (task.assignedTo?.toString() !== req.user?._id?.toString()) {
         res.status(403).json({ message: 'Not authorized to update this task' });
         return;
      }
    }

    // Both can update status
    if (status && status !== task.status) {
      task.status = status;
      await logActivity('Task status updated', req.user?._id, task.projectId, task._id);
    }

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await Task.deleteOne({ _id: req.params.id });

    await logActivity('Task deleted', req.user?._id, task.projectId, task._id);

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
