import { roles } from "@constants/common.constants.js";
import { PermissionModelRespository } from "@model/permission/permission.respository.js";
import { IRole, RoleModel } from "./role.model.js";


export class RoleModelRepository {
    private permissionModelRepository: PermissionModelRespository;
    constructor() {
        this.permissionModelRepository = new PermissionModelRespository();
    }

    async seedRolesAndPermissionsForSociety(societyId: string, session: any): Promise<void> {
        try {
            const mappedPromise = Object.values(roles).map(async (role) => {
                const permissions = await this.permissionModelRepository.getAllPermissions();
                const rolePermissions = permissions.map(permission => {
                    return {
                        permission_code: permission.code,
                        is_allowed: role === roles.ADMIN ? true : false
                    };
                });
                const roleData = {
                    society_id: societyId as any,
                    name: role,
                    role: role,
                    permissions: rolePermissions
                };
                const result = await RoleModel.create([roleData], { session });
            });

            await Promise.all(mappedPromise);

        } catch (error) {
            logger.error('Error while seeding roles and permissions for society', error);
            throw error;
        }
    }

    async getRolePermissions(role: roles, societyId: string): Promise<IRole | null> {
        return RoleModel.findOne({
            society_id: societyId,
            role: role
        })
    }

    async getSocietyRoles(societyId: string): Promise<IRole[]> {
        return RoleModel.find({
            society_id: societyId
        });
    }

    async updateRolePermissions(role: roles, societyId: string, permissions: any): Promise<IRole | null> {
        const roleData = await RoleModel.findOne({
            society_id: societyId,
            role: role
        });
        if (!roleData) return null;
        roleData.permissions = permissions;
        return roleData.save();
    }
}