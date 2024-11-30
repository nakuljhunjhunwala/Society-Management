import { WrappedRequest } from '@utils/wrapper.util.js';
import { SettingsService } from './settings.service.js';
import { UpdateMe } from './dto/me.dto.js';
import UpdatePermissionsDto from './dto/updatePermissions.dto.js';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  async requireUpdate({ query }: WrappedRequest) {
    try {

      if (!query?.version) {
        throw {
          status: 400,
          message: 'Version is required'
        };
      }

      if (!query?.platform) {
        throw {
          status: 400,
          message: 'Platform is required'
        }
      }

      const result = await this.settingsService.requireUpdate(query.version, query.platform);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getPermissions({ user, societyId }: WrappedRequest) {
    try {
      if (!societyId) {
        throw {
          status: 400,
          message: 'Society ID is required'
        };
      }
      if (!user) {
        throw {
          status: 400,
          message: 'User is required'
        };
      }
      const result = await this.settingsService.getPermissions(user, societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updatePermissions({ user, body }: WrappedRequest<UpdatePermissionsDto>) {
    try {
      if (!body) {
        throw {
          status: 400,
          message: 'Permissions are required'
        };
      }
      if (!user) {
        throw {
          status: 400,
          message: 'User is required'
        };
      }

      const isSocietyUser = user.role[body.societyId];

      if (!isSocietyUser && !user.isAdmin) {
        throw {
          status: 403,
          message: 'You are not allowed to edit permissions of this society'
        };
      }


      const result = await this.settingsService.updatePermissions(body.societyId, body.permissions);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getSocietyPermissions({ query }: WrappedRequest) {
    try {
      if (!query?.societyId) {
        throw {
          status: 400,
          message: 'Society ID is required'
        };
      }

      const result = await this.settingsService.getSocietyPermissions(query.societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }


}
