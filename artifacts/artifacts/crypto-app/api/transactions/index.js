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
    const { slug, amount, type, status, txHash, note, date } = req.body;
    const tx = await Transaction.create({
      userSlug: slug,
      amount,
      type,
      status: status || "completed",
      txHash,
      note,
      date: date || new Date()
    });
    return res.status(201).json({ id: tx._id.toString(), ...tx.toObject() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
