import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './src/models/Task';
import Project from './src/models/Project';
import ActivityLog from './src/models/ActivityLog';

dotenv.config();

const clean = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB');

    const projects = await Project.find({});
    const projectIds = projects.map(p => p._id.toString());

    const tasks = await Task.find({});
    let deletedTasks = 0;
    for (const task of tasks) {
      if (!task.projectId || !projectIds.includes(task.projectId.toString())) {
        await Task.deleteOne({ _id: task._id });
        deletedTasks++;
      }
    }

    const logs = await ActivityLog.find({});
    let deletedLogs = 0;
    for (const log of logs) {
      if (log.projectId && !projectIds.includes(log.projectId.toString())) {
        await ActivityLog.deleteOne({ _id: log._id });
        deletedLogs++;
      }
    }

    console.log(`Deleted ${deletedTasks} orphaned tasks and ${deletedLogs} orphaned activity logs.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

clean();
