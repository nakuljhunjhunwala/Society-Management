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
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
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
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      const result = await this.societyService.addMaintenance(societyId, body);
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
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      const result = await this.societyService.getMyMaintenanceRecords(user.userId, societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async generatePdf({ user, societyId, params }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      if (!params?.id) {
        throw {
          message: 'Maintenance ID is required',
          status: 400,
        }
      }
      const result = await this.societyService.generatePdf(user.userId, societyId, params.id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
