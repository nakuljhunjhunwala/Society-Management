import { WrappedRequest } from '@utils/wrapper.util.js';
import { UserService } from './user.service.js';
import { UpdateMe } from './dto/me.dto.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async me({ user }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.userService.me(user.userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateMe({ user, body }: WrappedRequest<UpdateMe>) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.userService.updateMe(user.userId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
