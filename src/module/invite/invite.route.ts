import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { InviteController } from './invite.controller.js';
import authMiddleware, {
  rolesBasedAuthMiddleware,
} from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import CreateInviteDto from './dto/createInvite.dto.js';

const router = Router();
const wrappedInviteController = new WrapperClass(
  new InviteController(),
) as unknown as InviteController & { [key: string]: any };


/**
 * @swagger
 * /invite:
 *   post:
 *     summary: Create a new invite
 *     description: Create a new invite with the provided details.
 *     tags:
 *       - Invite
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInviteDto'
 *     responses:
 *       201:
 *         description: Invite created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, rolesBasedAuthMiddleware(["ADMIN", "SECRETARY"]), validateRequest(CreateInviteDto), wrappedInviteController.createInvite);

/**
 * @swagger
 * /invite/{id}:
 *   get:
 *     summary: Get invite by ID
 *     description: Get invite by ID
 *     tags:
 *       - Invite
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - name: id
 *         in: path
 *         description: ID of the invite to get
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invite retrieved successfully
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
router.get('/:id', authMiddleware, wrappedInviteController.getInviteById);

export default router;