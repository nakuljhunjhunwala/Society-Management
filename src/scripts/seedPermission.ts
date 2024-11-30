import { defaultPermissions } from '@constants/permission.constants.js'
import { PermissionModel, IPermission } from '@model/permission/permission.model.js'
import { RoleModel } from '@model/role/role.model.js'
import { roles as RolesEnum } from '@constants/common.constants.js';
import mongoose from 'mongoose';


export async function seedPermissions() {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const permissions = await PermissionModel.find().session(session);
        const permissionIds = permissions.map(permission => permission.permission_id);
        const permissionsToSeed = defaultPermissions.filter(permission => !permissionIds.includes(permission.permission_id));

        if (permissionsToSeed.length) {
            await PermissionModel.insertMany(permissionsToSeed, { session });
            logger.info('Permissions seeded successfully');
            await seedPermissionInRoles(permissionsToSeed, session);
        } else {
            logger.info('Permissions already seeded');
        }

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        logger.error('Error while seeding permissions', err);
    } finally {
        session.endSession();
        logger.info('Permission seeding completed');
    }
}

async function seedPermissionInRoles(permissions: Partial<IPermission>[], session: mongoose.ClientSession) {
    try {
        const roles = await RoleModel.find().session(session);
        for (const role of roles) {
            const permissionsToAdd = permissions.filter(permission => !role.permissions.some(rolePermission => rolePermission.permission_code === permission.code));
            if (permissionsToAdd.length) {
                role.permissions.push(...permissionsToAdd.map(permission => ({
                    permission_code: permission.code as string,
                    is_allowed: role.role === RolesEnum.ADMIN ? true : false
                })));
                await role.save({ session });
            }
        }
    } catch (err) {
        logger.error('Error while seeding permissions in roles', err);
        throw err;
    }
}
