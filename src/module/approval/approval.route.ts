import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { ApprovalController } from './approval.controller.js';
import authMiddleware, {
  rolesBasedAuthMiddleware,
} from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import CreateApprovalDto from './dto/createApproval.dto.js';

const router = Router();
const wrappedApprovalController = new WrapperClass(
  new ApprovalController(),
) as unknown as ApprovalController & { [key: string]: any };


/**
 * @swagger
 * /approval:
 *   post:
 *     summary: Create a new approval
 *     tags:
 *       - Approval
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApprovalDto'
 *     responses:
 *       201:
 *         description: Approval created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authMiddleware,
  validateRequest(CreateApprovalDto),
  wrappedApprovalController.createApproval,
);


export default router;