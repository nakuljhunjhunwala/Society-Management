import { WrappedRequest } from '@utils/wrapper.util.js';
import { SettingsService } from './settings.service.js';
import { UpdateMe } from './dto/me.dto.js';

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


}
