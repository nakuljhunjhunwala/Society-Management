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
