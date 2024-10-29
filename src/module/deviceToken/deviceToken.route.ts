import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { DeviceTokenController } from './deviceToken.controller.js';
import authMiddleware from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import AddDeviceTokenDto from './dto/addToken.dto.js';

const router = Router();
const wrappedDeviceTokenController = new WrapperClass(
  new DeviceTokenController(),
) as unknown as DeviceTokenController & { [key: string]: any };

/**
 * @swagger
 * /device-token:
 *   post:
 *     summary: Add device token
 *     tags:
 *       - Device Token
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddDeviceTokenDto'
 *     responses:
 *       201:
 *         description: Device token added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, validateRequest(AddDeviceTokenDto), wrappedDeviceTokenController.addDeviceToken);

export default router;