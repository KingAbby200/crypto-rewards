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

const WithdrawalSchema = new mongoose.Schema({
  userSlug: { type: String, required: true, index: true },
  requestedAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const WithdrawalRequest = mongoose.models.WithdrawalRequest || mongoose.model('WithdrawalRequest', WithdrawalSchema);

export default async function handler(req, res) {
  await connectDB();

  // Admin + user auth (same as users)
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.substring(7);
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;   // this is the user slug

  if (req.method === 'GET') {
    const wr = await WithdrawalRequest.findOne({ userSlug: slug }).lean();
    return res.status(200).json(wr || { status: 'none' });
  }

  if (req.method === 'POST') {
    const { requestedAmount } = req.body;
    const wr = await WithdrawalRequest.findOneAndUpdate(
      { userSlug: slug },
      { userSlug: slug, requestedAmount, status: 'pending' },
      { upsert: true, new: true, lean: true }
    );
    return res.status(201).json(wr);
  }

  // Admin verify/reject will use the same file (or add below if needed)
  if (req.method === 'PATCH') {
    const { status } = req.body;
    const wr = await WithdrawalRequest.findOneAndUpdate(
      { userSlug: slug },
      { status },
      { new: true, lean: true }
    );
    return res.status(200).json(wr);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
