import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { SocietyController } from './society.controller.js';
import authMiddleware, {
  rolesBasedAuthMiddleware,
} from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import { CreateSocietyDto } from './dto/society.dto.js';
import { AddMemberDto } from './dto/addMember.dto.js';
import UpdateFlatsDto from './dto/updateFlats.dto.js';
import { BulkFileUploadDto } from './dto/bulkFileUpload.dto.js';

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
 * /society/member:
 *   put:
 *     summary: Add a member to the society
 *     description: Add a member to the society
 *     tags:
 *       - Societies
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMemberDto'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member added successfully
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
router.put(
  '/member',
  authMiddleware,
  rolesBasedAuthMiddleware(['ADMIN', 'SECRETARY']),
  validateRequest(AddMemberDto),
  wrappedSocietyController.addMember,
);

/**
 * @swagger
 * /society/flats:
 *   patch:
 *     summary: Update flats
 *     description: Update flats for the user in the society
 *     tags:
 *       - Societies
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFlatsDto'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flats updated successfully
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
router.patch(
  '/flats',
  authMiddleware,
  rolesBasedAuthMiddleware(['ADMIN', 'SECRETARY']),
  validateRequest(UpdateFlatsDto),
  wrappedSocietyController.updateFlats,
);

/**
 * @swagger
 * /society/member/{id}:
 *   delete:
 *     summary: Remove a member from the society
 *     description: Remove a member from the society
 *     tags:
 *       - Societies
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *       - name: id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member removed successfully
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
router.delete(
  '/member/:id',
  authMiddleware,
  rolesBasedAuthMiddleware(['ADMIN', 'SECRETARY']),
  wrappedSocietyController.removeMember,
);

/**
 * @swagger
 * /society/bulk/flats:
 *   post:
 *     summary: Create flats in bulk
 *     description: Create flats in bulk for the society. This request requires a file upload.
 *     tags:
 *       - Societies
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               societyId:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flats created successfully
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
router.post(
  '/bulk/flats',
  authMiddleware,
  rolesBasedAuthMiddleware(['ADMIN']),
  validateRequest(BulkFileUploadDto),
  wrappedSocietyController.createFlats,
);

export default router;