import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}
const cached = global.mongoose;

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error in transactions:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  if (req.method === 'GET') {
    // TODO: later add Transaction model + real query
    // For now return empty so the table renders
    return res.status(200).json([]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}