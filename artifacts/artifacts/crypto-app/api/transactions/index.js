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

const TransactionSchema = new mongoose.Schema({
  userSlug: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  txHash: { type: String },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { userSlug } = req.query;
    if (!userSlug) return res.status(400).json({ error: 'userSlug required in query' });
  
    try {
      const txs = await Transaction.find({ userSlug }).lean();
      return res.status(200).json(txs.map(tx => ({
        id: tx._id.toString(),
        ...tx
      })));
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
  }
  
  if (req.method === 'POST') {
    try {
      console.log('POST /api/transactions body:', req.body); // for Vercel logs

      const tx = await Transaction.create(req.body);
      return res.status(201).json({
        id: tx._id.toString(),
        ...tx.toObject()
      });
    } catch (err) {
      console.error('Transaction error:', err.message, err.stack);
      return res.status(500).json({
        error: 'Failed to add transaction',
        details: err.message,
        // If Mongoose validation error
        validation: err.errors ? Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, v.message])
        ) : null
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
