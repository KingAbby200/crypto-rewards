import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}
const cached = global.mongoose;

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const promise = mongoose.connect(MONGODB_URI);
    cached.promise = promise.then((conn) => {
      console.log('✅ MongoDB connected (single user)');
      return conn;
    }).catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      throw err;
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error('❌ Cached MongoDB connection failed:', err.message);
    throw err;
  }
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
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error in /api/users/[slug]:', err);
    return res.status(500).json({ error: 'Database connection failed', details: err.message });
  }

  try {
    const user = await User.findOne({ slug }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const formatted = {
      id: user._id.toString(),
      ...user
    };

    console.log('✅ User fetched by slug:', slug);
    return res.status(200).json(formatted);
  } catch (err) {
    console.error('GET user by slug error:', err);
    return res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
}