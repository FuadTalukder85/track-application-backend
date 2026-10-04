import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async (): Promise<void> => {
  try {
    // Set fallback DNS to resolve MongoDB Atlas SRV records
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Ignore if not permitted
    }

    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_tracker';
    const conn = await mongoose.connect(connUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
};


