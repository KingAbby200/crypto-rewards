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

  // Admin auth
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
    return res.status(200).json(users.map(u => ({ id: u._id.toString(), ...u })));
  }

  if (req.method === 'POST') {
    let data = req.body;
    let baseSlug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'user';
    let slug = baseSlug;
    let counter = 1;
    while (await User.findOne({ slug })) slug = `${baseSlug}-${counter++}`;
    data.slug = slug;

    const user = new User(data);
    await user.save();

    const saved = user.toObject();
    saved.id = saved._id.toString();
    delete saved._id;
    return res.status(201).json(saved);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}