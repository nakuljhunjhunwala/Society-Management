import { WrappedRequest } from '@utils/wrapper.util.js';
import { ApprovalService } from './approval.service.js';
import CreateApprovalDto from './dto/createApproval.dto.js';

export class ApprovalController {
  private approvalService: ApprovalService;

  constructor() {
    this.approvalService = new ApprovalService();
  }

  async createApproval({ user, body }: WrappedRequest<CreateApprovalDto>) {
    try {
      if (!body) {
        throw new Error('Approval data is required');
      }
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      const result = await this.approvalService.createApproval(user.userId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
