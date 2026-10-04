import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loginRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimit.js';
import { requireCsrf } from '../lib/csrf.js';
import {
  getMe,
  postChangePassword,
  postForgotPassword,
  postLogin,
  postLogout,
  postRefresh,
  postResetPassword,
  postTotpConfirm,
} from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, postLogin);
authRouter.post('/2fa/confirm', loginRateLimiter, postTotpConfirm);
authRouter.post('/refresh', postRefresh);
authRouter.post('/logout', requireCsrf, postLogout);
authRouter.get('/me', requireAuth, getMe);
authRouter.post('/change-password', requireAuth, requireCsrf, postChangePassword);
authRouter.post('/forgot-password', passwordResetRateLimiter, postForgotPassword);
authRouter.post('/reset-password', passwordResetRateLimiter, postResetPassword);
