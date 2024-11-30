import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import authMiddleware, { rolesBasedAuthMiddleware } from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import UpdatePermissionsDto from './dto/updatePermissions.dto.js';
const router = Router();
const wrappedSettingsController = new WrapperClass(
  new SettingsController(),
) as unknown as SettingsController & { [key: string]: any };


/**
 * @swagger
 * /settings/require-update:
 *   get:
 *     summary: Check if update is required
 *     description: Check if update is required for the app
 *     tags:
 *       - Settings
 *     parameters:
 *       - in: query
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update required
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/require-update', wrappedSettingsController.requireUpdate);
/**
 * @swagger
 * /settings/my-permissions:
 *   get:
 *     summary: Get permissions
 *     description: Get permissions for the user
 *     tags:
 *       - Settings
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-permissions', authMiddleware, wrappedSettingsController.getPermissions);

/**
 * @swagger
 * /settings/update-permissions:
 *   patch:
 *     summary: Update permissions
 *     description: Update permissions for the society
 *     tags:
 *       - Settings
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePermissionsDto'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.patch('/update-permissions', authMiddleware, validateRequest(UpdatePermissionsDto), wrappedSettingsController.updatePermissions);

/**
 * @swagger
 * /settings/society-permissions:
 *   get:
 *     summary: Get permissions for the society
 *     description: Get permissions for the society
 *     tags:
 *       - Settings
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - in: query
 *         name: societyId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/society-permissions', authMiddleware, wrappedSettingsController.getSocietyPermissions);

export default router;
