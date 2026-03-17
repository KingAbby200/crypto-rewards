import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

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
  name: { type: String, required: true },
  walletAddress: { type: String, required: true },
  eligibleBalance: { type: Number, default: 0 },
  withdrawalFeeEth: { type: Number, default: 0 },
  feeWalletAddress: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true }));

export default async function handler(req, res) {
  await connectDB();

  // Admin auth (same as your list endpoint)
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.substring(7);
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;

  if (req.method === 'GET') {
    const user = await User.findOne({ slug }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const result = { id: user._id.toString(), ...user };
    delete result._id;
    return res.status(200).json(result);
  }

  if (req.method === 'PATCH') {
    const updated = await User.findOneAndUpdate(
      { slug },
      req.body,
      { new: true, lean: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const result = { id: updated._id.toString(), ...updated };
    delete result._id;
    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    const deleted = await User.findOneAndDelete({ slug });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ message: 'User deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}