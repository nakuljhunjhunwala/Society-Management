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

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user information
 *     tags: [User]
 *     parameters:
 *      - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, wrappedUserController.me);

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user information
 *     tags: [User]
 *     parameters:
 *      - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMe'
 *     responses:
 *       200:
 *         description: Successfully updated user information
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/me',
  authMiddleware,
  validateRequest(UpdateMe),
  wrappedUserController.updateMe,
);

export default router;
