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
        throw {
          message: 'Approval data is required',
          status: 400,
        };
      }
      if (!user?.userId) {
        throw {
          message: 'User ID is required',
          status: 400,
        }
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
        throw {
          message: 'User ID is required',
          status: 400,
        }
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        }
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
        throw {
          message: 'Approval ID is required',
          status: 400,
        };
      }
      if (!user?.userId) {
        throw {
          message: 'User ID is required',
          status: 400,
        }
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
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
        throw {
          message: 'Approval ID is required',
          status: 400,
        };
      }
      if (!user?.userId) {
        throw {
          message: 'User ID is required',
          status: 400,
        }
      }
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      if (!body.reason) {
        throw {
          message: 'Reason is required',
          status: 400,
        };
      }
      const result = await this.approvalService.rejectApproval(user.userId, societyId, params?.id, body.reason);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
