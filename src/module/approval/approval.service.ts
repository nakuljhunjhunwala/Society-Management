import { IApproval } from "@model/approval/approval.model.js";
import CreateApprovalDto from "./dto/createApproval.dto.js";
import { ApprovalRepository } from "./approval.respository.js";
import { approvalStatus, ApproverType, InviteType, notificationMessages } from "@constants/common.constants.js";
import { SocietyRepository } from "@module/society/society.respository.js";
import { DeviceTokenService } from "@module/deviceToken/deviceToken.service.js";
import { INotificationData } from "@interfaces/notificationData.interface.js";


export class ApprovalService {

  private approvalRepository: ApprovalRepository;
  private societyRepository: SocietyRepository
  private deviceTokenService: DeviceTokenService;

  constructor() {
    this.approvalRepository = new ApprovalRepository();
    this.societyRepository = new SocietyRepository();
    this.deviceTokenService = new DeviceTokenService();
  }

  async createApproval(userId: string, body: CreateApprovalDto) {
    try {
      const data: Partial<IApproval> = {
        requestedBy: userId as any,
        societyId: body.societyId as any,
        approverType: body.approverType,
        approvers: body.approvers,
        status: approvalStatus.PENDING,
        action: body.action,
        metadata: body.metadata,
      }

      const result = await this.approvalRepository.createApproval(data);

      try {
        const payload: INotificationData = {
          title: notificationMessages.APPROVAL_REQUEST.title,
          message: notificationMessages.APPROVAL_REQUEST.body,
          data: {
            type: 'approval',
            id: result._id,
          }
        }
        if (ApproverType.ROLE === result.approverType) {
          await this.deviceTokenService.sendNotificationByRole(result.approvers[0], result.societyId as any, payload);
        } else {
          await this.deviceTokenService.sendNotificationToUsers(result.approvers, payload);
        }
      } catch (error) {
        logger.error('Error sending notification to approvers', error);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRequestedApprovals(userId: string, societyId: string, params: any) {
    try {
      const society = await this.societyRepository.getSocietyById(societyId);
      if (!society) {
        throw {
          status: 404,
          message: 'Society not found'
        }
      }
      const user = await this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId);
      if (!user) {
        throw {
          status: 404,
          message: 'User not found in society'
        }
      }
      const myRole = user.societies.find((s) => s.societyId.toString() === societyId)?.role;
      const result = await this.approvalRepository.getAllRequestedApprovals(societyId, userId, myRole!, params);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async approveApproval(userId: string, societyId: string, approvalId: string) {
    try {
      const user = await this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId);
      if (!user) {
        throw {
          status: 404,
          message: 'User not found in society'
        };
      }
      const myRole = user.societies.find((s) => s.societyId.toString() === societyId)?.role;

      const approval = await this.approvalRepository.getApprovalById(approvalId);
      const isAuthorized = this.checkApprovalAuthorization(userId, myRole!, approval!);
      if (isAuthorized) {
        const result = await this.approvalRepository.approveApproval(approvalId, userId);
        await this.processApproval(result!, userId);

        try {
          const payload: INotificationData = {
            title: notificationMessages.APPROVAL_APPROVED.title,
            message: notificationMessages.APPROVAL_APPROVED.body,
            data: {
              type: 'approval',
              id: result!._id,
            }
          }
          await this.deviceTokenService.sendNotificationToUsers(result!.requestedBy as any, payload);
        } catch (error) {
          logger.error('Error sending notification to approved person', error);
        }

        return result;
      } else {
        throw {
          status: 403,
          message: 'You are not authorized to approve this request'
        }
      }

    } catch (error) {
      throw error
    }
  }

  async rejectApproval(userId: string, societyId: string, approvalId: string, reason: string) {
    try {
      const user = await this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId);
      if (!user) {
        throw {
          status: 404,
          message: 'User not found in society'
        };
      }
      const myRole = user.societies.find((s) => s.societyId.toString() === societyId)?.role;

      const approval = await this.approvalRepository.getApprovalById(approvalId);
      const isAuthorized = this.checkApprovalAuthorization(userId, myRole!, approval!);
      if (isAuthorized) {
        const result = await this.approvalRepository.rejectApproval(approvalId, userId, reason);
        try {
          const payload: INotificationData = {
            title: notificationMessages.APPROVAL_REJECTED.title,
            message: notificationMessages.APPROVAL_REJECTED.body,
            data: {
              type: 'approval',
              id: result!._id,
            }
          }
          await this.deviceTokenService.sendNotificationToUsers(result!.requestedBy as any, payload);
        } catch (error) {
          logger.error('Error sending notification to rejected person', error);
        }
        return result;
      } else {
        throw {
          status: 403,
          message: 'You are not authorized to reject this request'
        }
      }

    } catch (error) {
      throw error
    }
  }

  private checkApprovalAuthorization(userId: string, role: string, approval?: IApproval) {
    if (!approval) {
      throw {
        status: 404,
        message: 'Approval not found'
      }
    }
    if (approval.status === approvalStatus.APPROVED || approval.status === approvalStatus.REJECTED) {
      throw {
        status: 400,
        message: 'Approval already processed'
      }
    }

    if (approval.approverType === ApproverType.ROLE && !approval.approvers.includes(role)) {
      throw {
        status: 403,
        message: 'You are not authorized to approve this request'
      }
    }

    if (approval.approverType === ApproverType.USER && !approval.approvers.includes(userId)) {
      throw {
        status: 403,
        message: 'You are not authorized to approve this request'
      }
    }

    return true;
  }

  private async processApproval(approval: IApproval, userId: string) {

  }

}
