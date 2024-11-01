import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import authMiddleware from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
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


export default router;
