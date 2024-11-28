import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '@middleware/dto-validator.js';
import { RegisterUserDto } from './dto/register.dto.js';
import { LoginUserDto } from './dto/login.dto.js';
import authMiddleware from '@middleware/auth.middleware.js';
import { AddEmailDto } from './dto/addEmail.dto.js';
import { VerifyEmailDto } from './dto/verifyEmail.dto.js';
import ForgetPasswordDto from './dto/forgetPassword.dto.js';
import { ResetPasswordDto } from './dto/resetPassword.dto.js';
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
 * /auth/log-all-out:
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
router.delete('/log-all-out', authMiddleware, wrappedLoginController.logAllOut);

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

/**
 * @swagger
 * /auth/add-email:
 *   post:
 *     summary: Add an email to the user
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddEmailDto'
 *     responses:
 *       200:
 *         description: Email added successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.post('/add-email', authMiddleware, validateRequest(AddEmailDto), wrappedLoginController.addEmail);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify the email
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailDto'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-email', authMiddleware, validateRequest(VerifyEmailDto), wrappedLoginController.verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgetPasswordDto'
 *     responses:
 *       200:
 *         description: Successful
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.post('/forgot-password', validateRequest(ForgetPasswordDto), wrappedLoginController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordDto'
 *     responses:
 *       200:
 *         description: Successful
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', validateRequest(ResetPasswordDto), wrappedLoginController.resetPassword);

export default router;
