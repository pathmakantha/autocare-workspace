import { Router } from 'express';
import { googleAuth, login, me, register, updateMe } from '../controllers/auth.controller';
import {
  forgotPassword,
  resetPassword,
  setPassword,
  verifyResetCode,
} from '../controllers/password.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);

// Password reset: request a code, trade the code for a short-lived token, then use that
// token (not the code) to set the new password.
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// First-time password for accounts created through Google sign-in.
router.post('/set-password', requireAuth, setPassword);

export default router;
