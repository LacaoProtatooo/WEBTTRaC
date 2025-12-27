import mongoose from "mongoose";

const sickLeaveSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    // Medical certificate (optional)
    medicalCertificate: {
        url: { type: String },
        publicId: { type: String }
    },
    // Rejection reason (filled by operator)
    rejectionReason: {
        type: String
    },
    // Who approved/rejected
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    // Emergency contact
    emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for calculating number of days
sickLeaveSchema.virtual('totalDays').get(function() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Ensure virtuals are included in JSON
sickLeaveSchema.set('toJSON', { virtuals: true });
sickLeaveSchema.set('toObject', { virtuals: true });

const SickLeave = mongoose.model("SickLeave", sickLeaveSchema);

export default SickLeave;
