import { WrapperClass } from '@utils/wrapper.util.js';
import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller.js';
import authMiddleware, {
  rolesBasedAuthMiddleware,
} from '@middleware/auth.middleware.js';
import { validateRequest } from '@middleware/dto-validator.js';
import AddMaintenancePaymentDto from './dto/addMaintenancePayment.dto.js';

const router = Router();
const wrappedMaintenanceController = new WrapperClass(
  new MaintenanceController(),
) as unknown as MaintenanceController & { [key: string]: any };



/**
 * @swagger
 * /maintenance/pending:
 *   get:
 *     summary: Get my pending maintenance
 *     description: Get my pending maintenance for the society
 *     tags:
 *       - Maintenance
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
router.get('/pending', authMiddleware, rolesBasedAuthMiddleware(["ANY"]), wrappedMaintenanceController.getMyPendingMaintenance);

/**
 * @swagger
 * /maintenance:
 *   post:
 *     summary: Record maintenance
 *     description: Record maintenance for the society
 *     tags:
 *       - Maintenance
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
 *             $ref: '#/components/schemas/AddMaintenancePaymentDto'
 *     responses:
 *       200:
 *         description: Maintenance recorded successfully
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
router.post('/', authMiddleware, rolesBasedAuthMiddleware(["SECRETARY", "ADMIN"]), validateRequest(AddMaintenancePaymentDto), wrappedMaintenanceController.addMaintenance);

/**
 * @swagger
 * /maintenance/my:
 *   get:
 *     summary: Get my maintenance records
 *     description: Get my maintenance records for the society
 *     tags:
 *       - Maintenance
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My maintenance records
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
router.get('/my', authMiddleware, rolesBasedAuthMiddleware(["ANY"]), wrappedMaintenanceController.getMyMaintenanceRecords);

/**
 * @swagger
 * /maintenance/generatePdf/{id}:
 *   get:
 *     summary: Generate PDF
 *     description: Generate PDF for the maintenance record and send it to the user mail
 *     tags:
 *       - Maintenance
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceTokenHeader'
 *       - $ref: '#/components/parameters/SocietyIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the maintenance record
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generated successfully
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
router.get('/generatePdf/:id', authMiddleware, rolesBasedAuthMiddleware(["ANY"]), wrappedMaintenanceController.generatePdf);

export default router;