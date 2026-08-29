import { Router } from 'express';
import { googleAuth, login, me, register, updateMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);

export default router;
