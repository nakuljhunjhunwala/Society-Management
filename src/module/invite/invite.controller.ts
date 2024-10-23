import { WrappedRequest } from '@utils/wrapper.util.js';
import { InviteService } from './invite.service.js';
import CreateInviteDto from './dto/createInvite.dto.js';

export class InviteController {
  private inviteService: InviteService;

  constructor() {
    this.inviteService = new InviteService();
  }


  async createInvite({ user, body, societyId }: WrappedRequest<CreateInviteDto>) {
    try {
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      const result = await this.inviteService.createInvite(user.userId, societyId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getInviteById({ params, user }: WrappedRequest) {
    try {
      const inviteId = params?.id;
      if (!inviteId) {
        throw new Error('Invite ID is required');
      }
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      const result = await this.inviteService.getInviteById(inviteId, user.userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
