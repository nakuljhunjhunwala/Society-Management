import { PlatForm, UpdateType } from '@constants/common.constants.js';
import { SettingsRepository } from './settings.respository.js';

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  async requireUpdate(version: string, platform: string) {
    try {

      const latestVersion = await this.settingsRepository.getLatestVersion(platform);

      if (!latestVersion) {
        throw {
          status: 404,
          message: 'Version not found'
        };
      }


      let updateType = UpdateType.NONE;

      if (platform === PlatForm.IOS || platform === PlatForm.ANDROID) {
        const versionParts = version.split('.').map(Number);
        const minSuitableVersionParts = latestVersion.minSuitableVersion.split('.').map(Number);
        const latestVersionParts = latestVersion.version.split('.').map(Number);

        const isLessThan = (v1: string | any[], v2: string | any[]) => {
          for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const part1 = v1[i] || 0;
            const part2 = v2[i] || 0;
            if (part1 < part2) return true;
            if (part1 > part2) return false;
          }
          return false;
        };

        if (isLessThan(versionParts, minSuitableVersionParts)) {
          updateType = UpdateType.FORCE;
        } else if (isLessThan(versionParts, latestVersionParts)) {
          updateType = UpdateType.OPTIONAL;
        }
      }

      const result = {
        updateType,
        latestVersion,
        reason: latestVersion.updateMessage,
        updateUrl: latestVersion.updateUrl
      };



      return result;
    } catch (error) {
      throw error;
    }
  }
}
