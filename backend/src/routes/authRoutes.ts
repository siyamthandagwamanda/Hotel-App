import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { editProfile, login, register } from '../controllers/authControllers';

const router = Router();

// Allow 10 sign-in or sign-up attempts per 15 minutes from one address
const limitAttempts = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Please wait a few minutes and try again.' } },
});

router.post('/register', limitAttempts, register);
router.post('/login', limitAttempts, login);
router.patch('/profile', requireAuth, editProfile);

export default router;