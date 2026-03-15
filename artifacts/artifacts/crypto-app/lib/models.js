const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
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

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userSlug: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['commission', 'bonus', 'withdrawal', 'fee'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      required: true,
      default: 'pending',
    },
    txHash: { type: String },
    note: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userSlug: { type: String, required: true },
    requestedAmount: { type: Number, required: true },
    feeAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      required: true,
      default: 'pending',
    },
  },
  { timestamps: true }
);

const WithdrawalRequestModel = mongoose.models.WithdrawalRequest || mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);

module.exports = { UserModel, TransactionModel, WithdrawalRequestModel };