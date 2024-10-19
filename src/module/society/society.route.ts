import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { SocietyController } from './society.controller.js';
import authMiddleware, {
  rolesBasedAuthMiddleware,
} from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import { CreateSocietyDto } from './dto/society.dto.js';
import { roles } from '@constants/common.constants.js';

const router = Router();
const wrappedSocietyController = new WrapperClass(
  new SocietyController(),
) as unknown as SocietyController & { [key: string]: any };

/**
 * @swagger
 * /society/societies:
 *   get:
 *     summary: Retrieve a list of societies
 *     description: Retrieve a list of societies that the current user is a part of.
 *     tags:
 *       - Societies
 *     parameters:
 *      - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of societies
 */
router.get(
  '/societies',
  authMiddleware,
  wrappedSocietyController.getMySocieties,
);

/**
 * @swagger
 * /society/:
 *   post:
 *     summary: Create a new society
 *     description: Create a new society with the provided details.
 *     tags:
 *       - Societies
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSocietyDto'
 *     responses:
 *       201:
 *         description: Society created successfully
 */
router.post(
  '/',
  authMiddleware,
  validateRequest(CreateSocietyDto),
  wrappedSocietyController.createSociety,
);

/**
 * @swagger
 * /society/members:
 *   get:
 *     summary: Retrieve a list of members
 *     description: Retrieve a list of members in the society.
 *     tags:
 *       - Societies
 *     parameters:
 *      - $ref: '#/components/parameters/DeviceTokenHeader'
 *      - $ref: '#/components/parameters/SocietyIdHeader'
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of members
 */
router.get(
  '/members',
  authMiddleware,
  rolesBasedAuthMiddleware(['ANY']),
  wrappedSocietyController.getMembers,
);

/**
 * @swagger
 * /society/my-maintenance:
 *   get:
 *     summary: Get my pending maintenance
 *     description: Get my pending maintenance for the society
 *     tags:
 *       - Societies
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My pending maintenance
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/my-maintenance', authMiddleware, rolesBasedAuthMiddleware(["ANY"]), wrappedSocietyController.getMyPendingMaintenance);

export default router;