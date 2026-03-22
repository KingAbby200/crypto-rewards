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

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true },
  eligibleBalance: { type: Number, default: 0 },
  withdrawalFeeEth: { type: Number, default: 0 },
  feeWalletAddress: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
  await connectDB();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.substring(7);
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const users = await User.find({}).lean();
    const result = users.map(user => {
      const r = { id: user._id.toString(), ...user };
      delete r._id;
      return r;
    });
    return res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const { name, walletAddress, eligibleBalance = 0, withdrawalFeeEth = 0, feeWalletAddress } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const user = await User.create({
      name,
      walletAddress,
      eligibleBalance,
      withdrawalFeeEth,
      feeWalletAddress,
      slug
    });
    
    const result = { id: user._id.toString(), ...user.toObject() };
    delete result._id;
    return res.status(201).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
