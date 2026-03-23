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
  userSlug: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["commission", "bonus", "withdrawal", "fee"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  txHash: { type: String },
  note: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default async function handler(req, res) {
  await connectDB();

  // Public for now (admin only in future if needed)
  if (req.method === 'POST') {
    try {
      const data = req.body;
  
      // Optional: log incoming data for debugging (remove later if not needed)
      console.log('Incoming transaction data:', data);
  
      // Create with safe defaults / type coercion
      const tx = await Transaction.create({
        userSlug: data.userSlug || data.slug,  // support both names if frontend sends either
        amount: Number(data.amount),
        type: data.type,
        status: data.status || 'completed',
        txHash: data.txHash || undefined,
        note: data.note || undefined,
        date: data.date ? new Date(data.date) : new Date(),
      });
  
      return res.status(201).json({
        id: tx._id.toString(),
        ...tx.toObject()
      });
    } catch (err) {
      console.error('Transaction creation error:', err);
      return res.status(500).json({
        error: 'Failed to add transaction',
        details: err.message || 'Unknown server error',
        // Optional: include validation errors if Mongoose
        validationErrors: err.errors ? Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`) : undefined
      });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
