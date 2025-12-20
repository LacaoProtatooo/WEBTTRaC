import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  photoUrl: { type: String },
  photoPublicId: { type: String },
  locationText: { type: String, trim: true },
  foundDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['posted', 'claimed', 'returned'], default: 'posted' },
  claimerName: { type: String, trim: true },
  claimerContact: { type: String, trim: true },
  claimNotes: { type: String, trim: true },
  claimedAt: { type: Date },
}, { timestamps: true });

lostFoundSchema.index({ status: 1, createdAt: -1 });

const LostFound = mongoose.model('LostFound', lostFoundSchema);
export default LostFound;
