import { PlatForm, UpdateType } from '@constants/common.constants.js';
import { SettingsRepository } from './settings.respository.js';
import { ResponseUser } from '@interfaces/user.interface.js';
import { PermissionsDto } from './dto/updatePermissions.dto.js';
import { IRole } from '@model/role/role.model.js';

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

  async getPermissions(user: ResponseUser, societyId: string) {
    try {
      const getAllPermissions = await this.settingsRepository.getAllPermissions();
      const role = user.role[societyId];
      if (!role) {
        throw {
          status: 400,
          message: 'Role not found'
        };
      }
      const userPermissions = await this.settingsRepository.getUserPermissions(role, societyId);

      if (!userPermissions) {
        throw {
          status: 400,
          message: 'Permissions not found'
        };
      }

      const mappedPermissions: any = {}
      getAllPermissions.forEach(permission => {
        const userPermission = userPermissions.permissions.find(p => p.permission_code === permission.code);
        mappedPermissions[permission.code] = userPermission?.is_allowed || false;
      });

      return mappedPermissions;
    } catch (error) {
      throw error;
    }
  }

  async updatePermissions(societyId: string, permissions: PermissionsDto[]) {
    try {
      const societyPermissionsRoles: IRole[] = await this.settingsRepository.getSocietyPermissions(societyId);
      if (!societyPermissionsRoles) {
        throw {
          status: 400,
          message: 'Society not found'
        };
      }

      const mappedPermissions: any = {};

      societyPermissionsRoles.forEach(role => {
        mappedPermissions[role.role] = role.permissions.map(permission => ({
          permission_code: permission.permission_code,
          is_allowed: permission.is_allowed
        }));
      });

      permissions.forEach(permission => {
        if (!mappedPermissions[permission.role]) {
          mappedPermissions[permission.role] = [];
        }
        const existingPermissionIndex = mappedPermissions[permission.role].findIndex((p: { permission_code: string; }) => p.permission_code === permission.permission_code);
        if (existingPermissionIndex !== -1) {
          mappedPermissions[permission.role][existingPermissionIndex].is_allowed = permission.is_allowed;
        } else {
          mappedPermissions[permission.role].push({
            permission_code: permission.permission_code,
            is_allowed: permission.is_allowed
          });
        }
      });

      const updatedPermission = Object.keys(mappedPermissions).map(async role => {
        const rolePermissions = mappedPermissions[role];
        await this.settingsRepository.updateRolePermissions(role as any, societyId, rolePermissions);
      });

      await Promise.all(updatedPermission);

      return {
        status: 200,
        message: 'Permissions updated successfully'
      }
    } catch (error) {
      throw error;
    }
  }

  async getSocietyPermissions(societyId: string) {
    try {
      const [societyPermissionsRoles, allPermissions] = await Promise.all([
        this.settingsRepository.getSocietyPermissions(societyId),
        this.settingsRepository.getAllPermissions()
      ]);

      if (!societyPermissionsRoles) {
        throw {
          status: 400,
          message: 'Society not found'
        };
      }

      const rolePermissionsMap = societyPermissionsRoles.reduce((acc, role) => {
        role.permissions.forEach(permission => {
          if (!acc[permission.permission_code]) {
            acc[permission.permission_code] = {};
          }
          acc[permission.permission_code][role.role] = permission.is_allowed;
        });
        return acc;
      }, {} as { [key: string]: { [key: string]: boolean } });

      const mappedPermissions = allPermissions.map(permission => ({
        name: permission.name,
        code: permission.code,
        description: permission.description,
        permissions: rolePermissionsMap[permission.code] || {}
      }));

      return mappedPermissions;
    } catch (error) {
      throw error;
    }
  }

}
