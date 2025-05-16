import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAgent extends mongoose.Document {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  assignedTasks: Array<{
    firstName: string;
    phone: string;
    notes: string;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  assignedTasks: [{
    firstName: String,
    phone: String,
    notes: String
  }]
}, {
  timestamps: true
});

agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

agentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAgent>('Agent', agentSchema); 