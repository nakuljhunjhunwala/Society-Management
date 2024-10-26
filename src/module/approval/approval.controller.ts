import { WrappedRequest } from '@utils/wrapper.util.js';
import { ApprovalService } from './approval.service.js';
import CreateApprovalDto from './dto/createApproval.dto.js';
import RejectApprovalDto from './dto/rejectApproval.dto.js';

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

  async getRequestedApprovals({ user, societyId, params }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      const result = await this.approvalService.getRequestedApprovals(user.userId, societyId, params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async approveApproval({ user, params, societyId }: WrappedRequest) {
    try {
      if (params?.id) {
        throw new Error('Approval ID is required');
      }
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      const result = await this.approvalService.approveApproval(user.userId, societyId, params?.id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async rejectApproval({ user, params, body, societyId }: WrappedRequest<RejectApprovalDto>) {
    try {
      if (params?.id) {
        throw new Error('Approval ID is required');
      }
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!societyId) {
        throw new Error('Society ID is required');
      }
      if (!body.reason) {
        throw new Error('Reason is required');
      }
      const result = await this.approvalService.rejectApproval(user.userId, societyId, params?.id, body.reason);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
