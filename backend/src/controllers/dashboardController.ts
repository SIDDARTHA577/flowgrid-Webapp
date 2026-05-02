import { Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Get dashboard metrics and timeline
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProjects = await Project.countDocuments({});
    
    // Tasks that are past their due date and not completed
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'DONE' }
    });

    const recentActivities = await ActivityLog.find({})
      .populate('performedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get tasks that are overdue to display them
    const overdueTasksList = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $ne: 'DONE' }
    })
      .populate('assignedTo', 'name')
      .populate('projectId', 'name')
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({
      metrics: {
        totalUsers,
        totalProjects,
        overdueTasks
      },
      timeline: recentActivities,
      overdueTasksList
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard metrics' });
  }
};

// @desc    Clear all activity history
// @route   DELETE /api/dashboard/activity
// @access  Private/Admin
export const clearActivityHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ message: 'Activity history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error clearing activity history' });
  }
};
