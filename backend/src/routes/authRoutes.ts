import express from 'express';
import { signupUser, loginUser, logoutUser } from '../controllers/authController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiters for auth routes to prevent brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per `window`
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 signup requests per `window`
  message: 'Too many accounts created from this IP, please try again after an hour',
});

router.post('/signup', signupLimiter, signupUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);

export default router;
