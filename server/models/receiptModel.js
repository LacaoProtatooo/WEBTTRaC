import mongoose from 'mongoose';

const receiptItemSchema = new mongoose.Schema({
  description: { type: String },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number },
  amount: { type: Number }
});

const receiptSchema = new mongoose.Schema({
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tricycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tricycle'
  },
  // Extracted/Edited data
  vendorName: { type: String, default: '' },
  receiptDate: { type: Date },
  totalAmount: { type: Number, default: 0 },
  subtotal: { type: Number },
  tax: { type: Number },
  items: [receiptItemSchema],
  
  // Category for expense tracking
  category: {
    type: String,
    enum: ['fuel', 'maintenance', 'parts', 'registration', 'insurance', 'cleaning', 'other'],
    default: 'other'
  },
  
  // Original OCR data
  rawOcrText: { type: String },
  ocrLines: [{ 
    text: String, 
    confidence: Number,
    box: mongoose.Schema.Types.Mixed
  }],
  
  // Image reference (Cloudinary or local path)
  imageUrl: { type: String },
  
  // Notes
  notes: { type: String },
  
  // Metadata
  ocrEngine: { type: String }, // 'paddleocr' or 'tesseract.js'
  scanDate: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Index for efficient queries
receiptSchema.index({ operator: 1, scanDate: -1 });
receiptSchema.index({ operator: 1, category: 1 });
receiptSchema.index({ tricycle: 1, scanDate: -1 });

// Virtual for formatted total
receiptSchema.virtual('formattedTotal').get(function() {
  return `₱${this.totalAmount.toFixed(2)}`;
});

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
