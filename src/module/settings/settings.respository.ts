import { AppVersionModalRepository } from '@model/appVersion/appVersion.respository.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';

export class SettingsRepository {
  private settingsRespository: AppVersionModalRepository;

  constructor() {
    this.settingsRespository = new AppVersionModalRepository();
  }

  async getLatestVersion(platform: string) {
    try {
      const result = await this.settingsRespository.getLatestVersion(platform);
      return result;
    } catch (error) {
      throw error;
    }
  }


}
