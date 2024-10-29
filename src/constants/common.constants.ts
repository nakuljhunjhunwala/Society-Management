export enum roles {
  RESIDENT = 'resident',
  ADMIN = 'admin',
  SECRETARY = 'secretary',
  SECURITY = 'security',
}

export enum maintenancePaymentStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

export const redisKeys = {
  mantainenceBalance: 'mantainenceBalance',
}

export enum approvalActions {
  JOIN_SOCIETY = 'join_society',
}

export enum approvalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ApproverType {
  USER = 'User',
  ROLE = 'Role',
}

export enum InviteType {
  JOIN_SOCIETY = 'join_society',
}

export const defaultPagination = {
  limit: 10,
  skip: 0,
}

export const notificationMessages = {
  APPROVAL_REQUEST: {
    title: 'Approval Request',
    body: 'You have a new approval request',
  },
  APPROVAL_APPROVED: {
    title: 'Approval Approved',
    body: 'Your approval request has been approved',
  },
  APPROVAL_REJECTED: {
    title: 'Approval Rejected',
    body: 'Your approval request has been rejected',
  },
}

export const emailFromAddress = {
  default: 'jhunjhunwalanakul@gmail.com',
}

export const sendgridTemplates = {
  EMAIL_VERIFICATION: 'd-f13efeae8e4641acb348d28e0fcea502',
  MAINTENANCE_RECEIPT: 'd-f1d087c8ab81433da6d09b5d7350bba1'
}
