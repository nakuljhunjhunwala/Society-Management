import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { UserController } from './user.controller.js';
import authMiddleware from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import { UpdateMe } from './dto/me.dto.js';
const router = Router();
const wrappedUserController = new WrapperClass(
  new UserController(),
) as unknown as UserController & { [key: string]: any };

router.get('/me', authMiddleware, wrappedUserController.me);
router.put(
  '/me',
  authMiddleware,
  validateRequest(UpdateMe),
  wrappedUserController.updateMe,
);

export default router;
