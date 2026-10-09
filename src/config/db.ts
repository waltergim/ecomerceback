import mongoose from 'mongoose';
import 'dotenv/config';

const mongoURI = process.env.MONGODB_URI ?? process.env.MONGO_URI;

export const connectDB = async () => {
  if (!mongoURI) {
    throw new Error('Falta la variable de entorno MONGODB_URI');
  }

  await mongoose.connect(mongoURI, { dbName: 'ecomer' });
  console.log('Conectado a MongoDB');
};