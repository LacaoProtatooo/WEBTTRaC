// server/models/announcementModel.js
import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  scheduledDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: false,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'urgent', 'maintenance'],
    default: 'info',
  },
  targetAudience: {
    type: String,
    enum: ['all', 'driver', 'operator', 'guest'],
    default: 'all',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;