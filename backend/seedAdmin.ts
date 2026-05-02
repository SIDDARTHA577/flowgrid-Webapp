import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import { connectDB } from './src/config/db';

dotenv.config();

const updateAdmin = async () => {
  try {
    await connectDB();
    
    // Find the previously created taskflow admin or ethara admin
    let admin = await User.findOne({ email: 'admin@taskflow.com' });
    if (!admin) {
      admin = await User.findOne({ email: 'admin@ethara.ai' });
    }
    if (!admin) {
      admin = await User.findOne({ email: 'admin@flowgrid.com' });
    }
    
    if (admin) {
      admin.email = 'admin@flowgrid.com';
      admin.name = 'Flowgrid Admin';
      await admin.save();
      
      console.log(`Admin updated successfully!`);
      console.log(`New Email: admin@flowgrid.com`);
      console.log(`Password remains: Admin123!`);
    } else {
      console.log('Original admin not found. Creating new Flowgrid admin...');
      
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin123!', salt);

      await User.create({
        name: 'Flowgrid Admin',
        email: 'admin@flowgrid.com',
        passwordHash,
        role: 'ADMIN'
      });
      
      console.log(`New Admin created successfully!`);
      console.log(`Email: admin@flowgrid.com`);
      console.log(`Password: Admin123!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
