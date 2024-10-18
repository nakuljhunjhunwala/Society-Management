import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt.util.js'; // Adjust the path as needed
import { handleError } from '@utils/response.util.js';
import { roles } from '@constants/common.constants.js';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleError(res, {
      status: 401,
      message: 'Authorization token required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = verifyAccessToken(token) as any;

    if (!decoded) {
      return handleError(res, {
        status: 401,
        message: 'Invalid or expired token',
      });
    }

    // Attach user information to the request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
  } catch (error) {
    return handleError(res, {
      status: 401,
      message: 'Invalid or expired token',
    });
  }
  next();
};

// // Object.values(roles)

export const rolesBasedAuthMiddleware =
  (allowedRoles: (keyof typeof roles | 'ANY')[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return handleError(res, {
          status: 401,
          message: 'Unauthorized',
        });
      }
      const societyId = req.headers['society-id'] as string;

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
