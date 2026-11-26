import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt failed. Retries left: ${retries - 1}`, error);
      retries -= 1;
      if (retries > 0) {
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }

  console.warn('⚠️ MongoDB connection could not be established on boot. Server will stay alive while retrying in background.');
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

export default connectDB;
