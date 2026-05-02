import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 mins

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      // Generic response for security
      res.status(400).json({ message: 'Invalid credentials or user already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    if (user) {
      generateToken(res, user._id as any);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user/set cookie
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check lock
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      res.status(403).json({ message: 'Account locked due to multiple failed attempts. Please try again later.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (isMatch) {
      // Reset failed attempts
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;
      await user.save();

      generateToken(res, user._id as any);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.accountLockedUntil = new Date(Date.now() + LOCK_TIME_MS);
      }
      await user.save();
      
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
