const mongoose = require('mongoose');

let connectionAttempted = false;

async function connectMongoDB() {
  if (connectionAttempted) return;
  connectionAttempted = true;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("Please verify your MONGODB_URI is correct in your environment secrets.");
  }
}

module.exports = { connectMongoDB };