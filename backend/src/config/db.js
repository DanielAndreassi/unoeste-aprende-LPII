import mongoose from 'mongoose';

export async function connectDB(
  uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unoeste-aprende',
) {
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}
