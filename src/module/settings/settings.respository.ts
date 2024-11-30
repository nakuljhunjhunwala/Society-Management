import { roles } from '@constants/common.constants.js';
import { AppVersionModalRepository } from '@model/appVersion/appVersion.respository.js';
import { PermissionModelRespository } from '@model/permission/permission.respository.js';
import { RoleModelRepository } from '@model/role/role.respository.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';

export class SettingsRepository {
  private settingsRespository: AppVersionModalRepository;
  private permissionModelRepository: PermissionModelRespository;
  private roleModelRepository: RoleModelRepository;

  constructor() {
    this.settingsRespository = new AppVersionModalRepository();
    this.permissionModelRepository = new PermissionModelRespository();
    this.roleModelRepository = new RoleModelRepository();
  }

  async getLatestVersion(platform: string) {
    try {
      const result = await this.settingsRespository.getLatestVersion(platform);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllPermissions() {
    try {
      const result = await this.permissionModelRepository.getAllPermissions();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserPermissions(role: roles, societyId: string) {
    try {
      const result = await this.roleModelRepository.getRolePermissions(role, societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getSocietyPermissions(societyId: string) {
    try {
      const result = await this.roleModelRepository.getSocietyRoles(societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateRolePermissions(role: roles, societyId: string, permissions: string[]) {
    try {
      const result = await this.roleModelRepository.updateRolePermissions(role, societyId, permissions);
      return result;
    } catch (error) {
      throw error;
    }
  }


}
