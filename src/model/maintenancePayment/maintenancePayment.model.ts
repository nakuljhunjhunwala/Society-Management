import { maintenancePaymentStatus } from '@constants/common.constants.js';
import { Schema, model, Document } from 'mongoose';

export interface IMaintenancePayment extends Document {
  societyId: Schema.Types.ObjectId;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  coversPeriod: {
    from: Date;
    to: Date;
  };
  appliedDiscount: {
    amount: number;
    reason: string;
  };
  status: maintenancePaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  flatNo: string;
}

const maintenancePaymentSchema = new Schema<IMaintenancePayment>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    coversPeriod: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    appliedDiscount: {
      amount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: Object.values(maintenancePaymentStatus),
      required: true,
    },
    flatNo: { type: String, required: true },
  },
  { timestamps: true },
);

maintenancePaymentSchema.pre<IMaintenancePayment>('save', function (next) {
  this.flatNo = this.flatNo.toUpperCase();
  next();
});

maintenancePaymentSchema.pre<IMaintenancePayment>('findOneAndUpdate', function (next) {
  this.flatNo = this.flatNo.toUpperCase();
  next();
});

export const MaintenancePaymentModel = model<IMaintenancePayment>(
  'MaintenancePayment',
  maintenancePaymentSchema,
);
