import { Pagination } from "@interfaces/pagination.interface.js";
import { ApprovalModal, IApproval } from "./approval.model.js";
import { approvalStatus, defaultPagination } from "@constants/common.constants.js";


export class ApprovalModelRepository {
    async createApproval(data: Partial<IApproval>) {
        try {
            const approval = await ApprovalModal.create(data);
            return approval;
        } catch (error) {
            throw error
        }
    }

    async getAllRequestedApprovals(societyId: string, userId: string, role: string, pagination: Pagination = defaultPagination) {
        try {
            const query = {
                societyId,
                $or: [
                    { approverType: 'USER', approvers: { $in: [userId] } },
                    { approverType: 'ROLE', approvers: { $in: [role] } }
                ]
            };
            const approvals = await ApprovalModal.find(query).skip(pagination.skip).limit(pagination.limit).sort({ createdAt: -1 });
            const returnData = {
                approvals,
                total: await ApprovalModal.countDocuments(query)
            }
            return returnData;
        } catch (error) {
            throw error;
        }

    }

    async getApprovalById(approvalId: string) {
        try {
            const approval = await ApprovalModal.findById(approvalId);
            return approval;
        } catch (error) {
            throw error;
        }
    }

    async approveApproval(approvalId: string, approvedBy: string) {
        try {
            const patchData = {
                status: approvalStatus.APPROVED,
                approvedBy,
                approvedAt: new Date()
            }

            const approval = await ApprovalModal.findByIdAndUpdate(approvalId, patchData, { new: true });
            return approval;

        } catch (error) {
            throw error;
        }
    }

    async rejectApproval(approvalId: string, rejectedBy: string, reason: string) {
        try {
            const patchData = {
                status: approvalStatus.REJECTED,
                approvedBy: rejectedBy,
                approvedAt: new Date(),
                rejectionReason: reason
            }

            const approval = await ApprovalModal.findByIdAndUpdate(approvalId, patchData, { new: true });
            return approval;
        } catch (error) {
            throw error;
        }
    }

}