import { ApprovalModal, IApproval } from "./approval.model.js";


export class ApprovalModelRepository {
    async createApproval(data: Partial<IApproval>) {
        try {
            const approval = await ApprovalModal.create(data);
            return approval;
        } catch (error) {
            throw error
        }
    }
}