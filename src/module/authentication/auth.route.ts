import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '@middleware/dto-validator.js';
import { RegisterUserDto } from './dto/register.dto.js';
import { LoginUserDto } from './dto/login.dto.js';
import authMiddleware from '@middleware/auth.middleware.js';
const router = Router();
const wrappedLoginController = new WrapperClass(
  new AuthController(),
) as unknown as AuthController & { [key: string]: any };

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     parameters:
 *      - $ref: '#/components/parameters/OptionalDeviceTokenHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserDto'
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/login',
  validateRequest(LoginUserDto),
  wrappedLoginController.login,
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     parameters:
 *     - $ref: '#/components/parameters/OptionalDeviceTokenHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserDto'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request
 */
router.post(
  '/register',
  validateRequest(RegisterUserDto),
  wrappedLoginController.createUser,
);

/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Logout the current session
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful logout
 *       401:
 *         description: Unauthorized
 */
router.delete('/logout', authMiddleware, wrappedLoginController.logout);

/**
 * @swagger
 * /auth/logAllOut:
 *   delete:
 *     summary: Logout all sessions of the current user
 *     tags: [Authentication]
 *     parameters:
 *      - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful logout from all sessions
 *       401:
 *         description: Unauthorized
 */
router.delete('/logAllOut', authMiddleware, wrappedLoginController.logAllOut);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh the authentication token
 *     tags: [Authentication]
 *     parameters:
 *      - $ref: '#/components/parameters/RefreshTokenHeader'
 *      - $ref: '#/components/parameters/DeviceTokenHeader'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/refresh', wrappedLoginController.refresh);

export default router;
