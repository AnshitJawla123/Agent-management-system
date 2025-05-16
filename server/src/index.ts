import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import agentRoutes from './routes/agentRoutes';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agent_management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create default admin user if it doesn't exist
    try {
      const adminEmail = 'admin@example.com';
      const existingAdmin = await User.findOne({ email: adminEmail });
      
      if (!existingAdmin) {
        const adminUser = new User({
          email: adminEmail,
          password: 'admin123'  // Default password
        });
        await adminUser.save();
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  })
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

