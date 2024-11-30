import { IPermission, PermissionModel } from "./permission.model.js";

export class PermissionModelRespository {
    async getAllPermissions(): Promise<IPermission[]> {
        return PermissionModel.find();
    }

    async getPermissionById(permissionId: string): Promise<IPermission | null> {
        return PermissionModel.findById(permissionId);
    }

    async getPermissionByCode(permissionCode: string): Promise<IPermission | null> {
        return PermissionModel.findOne({ code: permissionCode });
    }

    async getPermissionsByPlans(planId: string): Promise<IPermission[]> {
        return PermissionModel.find({ plans: { $in: [planId] } });
    }
}