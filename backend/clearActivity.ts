import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ActivityLog from './src/models/ActivityLog';
import { connectDB } from './src/config/db';

dotenv.config();

const clear = async () => {
  try {
    await connectDB();
    await ActivityLog.deleteMany({});
    console.log('Activity log cleared successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clear();
