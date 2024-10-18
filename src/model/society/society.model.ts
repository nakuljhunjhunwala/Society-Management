import { Schema, model, Document } from 'mongoose';

export interface ISociety extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  maintenanceRate: {
    amount: number;
    currency: string;
    effectiveFrom: Date;
  };
  maintenanceRateHistory: Array<{
    amount: number;
    currency: string;
    effectiveFrom: Date;
    effectiveTo: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const societySchema = new Schema<ISociety>(
  {
    name: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    maintenanceRate: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true },
      effectiveFrom: { type: Date, required: true },
    },
    maintenanceRateHistory: [
      {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const SocietyModel = model<ISociety>('Society', societySchema);
