import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  slug: string;
  walletAddress: string;
  eligibleBalance: number;
  withdrawalFeeEth: number;
  feeWalletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    walletAddress: { type: String, required: true },
    eligibleBalance: { type: Number, required: true, default: 0 },
    withdrawalFeeEth: { type: Number, required: true, default: 0 },
    feeWalletAddress: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export interface ITransaction extends Document {
  userId: string;
  userSlug: string;
  amount: number;
  type: "commission" | "bonus" | "withdrawal" | "fee";
  status: "pending" | "completed" | "failed";
  txHash?: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true },
    userSlug: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["commission", "bonus", "withdrawal", "fee"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
      default: "pending",
    },
    txHash: { type: String },
    note: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export interface IWithdrawalRequest extends Document {
  userId: string;
  userSlug: string;
  requestedAmount: number;
  feeAmount: number;
  status: "pending" | "verified" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    userId: { type: String, required: true },
    userSlug: { type: String, required: true },
    requestedAmount: { type: Number, required: true },
    feeAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
);

export const WithdrawalRequestModel =
  mongoose.models.WithdrawalRequest ||
  mongoose.model<IWithdrawalRequest>("WithdrawalRequest", WithdrawalRequestSchema);
