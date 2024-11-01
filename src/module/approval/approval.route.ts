import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { ApprovalController } from './approval.controller.js';
import authMiddleware, {
  rolesBasedAuthMiddleware,
} from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import CreateApprovalDto from './dto/createApproval.dto.js';
import RejectApprovalDto from './dto/rejectApproval.dto.js';

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

/**
 * @swagger
 * /approval/requested:
 *   get:
 *     summary: Get requested approvals
 *     tags:
 *       - Approval
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *       - $ref: '#/components/pagination/limit'
 *       - $ref: '#/components/pagination/page'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requested approvals
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
router.get("/requested", authMiddleware, rolesBasedAuthMiddleware(["ANY"]), wrappedApprovalController.getRequestedApprovals);

/**
 * @swagger
 * /approval/approve/{id}:
 *   patch:
 *     summary: Approve an approval
 *     tags:
 *       - Approval
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         description: Approval ID
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval approved successfully
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
router.patch("/approve/:id", authMiddleware, rolesBasedAuthMiddleware(["ANY"]), wrappedApprovalController.approveApproval);


/**
 * @swagger
 * /approval/reject/{id}:
 *   patch:
 *     summary: Reject an approval
 *     tags:
 *       - Approval
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         description: Approval ID
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectApprovalDto'
 *     responses:
 *       200:
 *         description: Approval rejected successfully
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
router.patch("/reject/:id", authMiddleware, rolesBasedAuthMiddleware(["ANY"]), validateRequest(RejectApprovalDto), wrappedApprovalController.rejectApproval);


export default router;