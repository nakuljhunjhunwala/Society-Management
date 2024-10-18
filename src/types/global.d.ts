import { logger as Logger } from '@logger/logger.ts';
import { ResponseUser } from '@interfaces/user.interface.ts';

declare global {
  const logger: typeof Logger;
  namespace Express {
    interface Request {
      user?: ResponseUser;
      deviceId?: string;
      societyId?: string;
    }
  }
}
