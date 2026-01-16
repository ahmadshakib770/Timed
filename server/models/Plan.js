import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  category: {
    type: String,
    enum: ['productive', 'leisure', 'break'],
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  actualEndTime: {
    type: String, // Format: "HH:MM"
    default: null
  },
  order: {
    type: Number,
    required: true
  }
});

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayStartTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  dayEndTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  tasks: [taskSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
planSchema.index({ userId: 1, date: 1 });

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
