import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!global.mongoose) global.mongoose = { conn: null, promise: null };
const cached = global.mongoose;

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String,
  walletAddress: String,
  eligibleBalance: Number,
  withdrawalFeeEth: Number,
  feeWalletAddress: String,
  slug: String
}, { timestamps: true }));

export default async function handler(req, res) {
  const { slug } = req.query;
  await connectDB();

  const user = await User.findOne({ slug }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const formatted = { id: user._id.toString(), ...user };
  return res.status(200).json(formatted);
}