import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use(postRoutes);
app.use(userRoutes);

const start = async () => {
  try {
    const connectDB = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    app.listen(5050, () => {
      console.log("Server is running on port 5050");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

start();
