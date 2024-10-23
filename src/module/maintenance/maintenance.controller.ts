import { WrappedRequest } from '@utils/wrapper.util.js';
import { MaintenanceService } from './maintenance.service.js';

export class MaintenanceController {
  private societyService: MaintenanceService;

  constructor() {
    this.societyService = new MaintenanceService();
  }

  async getMyPendingMaintenance({ user, societyId }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      const result = await this.societyService.getMyPendingMaintenance(user.userId, societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addMaintenance({ user, body, societyId }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      const result = await this.societyService.addMaintenance(user.userId, societyId, body);
      return {
        message: 'Maintenance Payment added successfully',
        data: result,
        status: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyMaintenanceRecords({ user, societyId }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      const result = await this.societyService.getMyMaintenanceRecords(user.userId, societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
