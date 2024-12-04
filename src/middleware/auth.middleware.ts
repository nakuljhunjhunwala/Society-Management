import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt.util.js'; // Adjust the path as needed
import { handleError } from '@utils/response.util.js';
import { roles } from '@constants/common.constants.js';
import { RoleModelRepository } from '@model/role/role.respository.js';
import { PermissionCodes } from '@constants/permission.constants.js';
import { RedisClient } from '@utils/redis.util.js';
import redisKeys from '@constants/redis.constants.js';
import mustache from 'mustache';
import { IRole } from '@model/role/role.model.js';

const roleRespository = new RoleModelRepository();
const redisClient = RedisClient.getInstance();

const extractUserFromToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleError(res, {
      status: 401,
      message: 'Authorization token required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token) as any;

    if (!decoded) {
      return handleError(res, {
        status: 401,
        message: 'Invalid or expired token',
      });
    }

    const societyId = req.headers['x-society-id'] as string;

    if (societyId) {
      req.societyId = societyId;
    }

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      isAdmin: decoded.isAdmin,
    };
  } catch (error) {
    return handleError(res, {
      status: 401,
      message: 'Invalid or expired token',
    });
  }
  next();
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  extractUserFromToken(req, res, () => {
    next();
  });
};

export const authAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  extractUserFromToken(req, res, () => {
    if (!req?.user?.isAdmin) {
      return handleError(res, {
        status: 403,
        message: 'Unauthorized only for admin',
      });
    }
    next();
  });
};

export const permissionAuthMiddleware = (permission: PermissionCodes) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const societyId = req.societyId;

    if (!societyId) {
      return handleError(res, {
        status: 401,
        message: 'Society ID is required',
      });
    }

    const role = user?.role[societyId] as roles;

    if (!role) {
      return handleError(res, {
        status: 401,
        message: 'Role not found',
      });
    }

    try {

      const key = mustache.render(redisKeys.societyRolePermissions, { role, societyId });
      let rolePermissionRedis = await redisClient.get(key);
      let rolePermission: IRole | null = null;

      if (!rolePermissionRedis) {
        rolePermission = await roleRespository.getRolePermissions(role, societyId);
        await redisClient.set(key, JSON.stringify(rolePermission));
      } else {
        rolePermission = JSON.parse(rolePermissionRedis);
      }

      if (!rolePermission) {
        return handleError(res, {
          status: 401,
          message: 'Role permission not found',
        });
      }

      const isAllowed = rolePermission.permissions.some(p => p.permission_code === permission && p.is_allowed);

      if (!isAllowed) {
        return handleError(res, {
          status: 403,
          message: 'Unauthorized',
        });
      }

      next();
    } catch (error) {
      return handleError(res, {
        status: 500,
        message: 'Internal Server Error',
      });
    }
  };
};

export const rolesBasedAuthMiddleware =
  (allowedRoles: (keyof typeof roles | 'ANY')[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return handleError(res, {
          status: 401,
          message: 'Unauthorized',
        });
      }

      if (req.user.isAdmin) {
        return next();
      }

      const societyId = req.headers['x-society-id'] as string;

      if (!societyId) {
        return handleError(res, {
          status: 401,
          message: 'Society ID is required',
        });
      }

      req.societyId = societyId;

      if (allowedRoles.includes('ANY')) {
        return next();
      }

      const role = req.user.role[societyId]?.toUpperCase() as keyof typeof roles;

      if (!role || !allowedRoles.includes(role)) {
        return handleError(res, {
          status: 401,
          message: 'Unauthorized',
        });
      }

      next();
    };

export default authMiddleware;
