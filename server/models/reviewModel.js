import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  rating: {
    type: Number,
    required: [true, "Please enter the rating of the review"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: false,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  // For driver reviews from bookings
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  // Reference to the booking (if from a special trip)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false,
  },
  // For tricycle reviews (legacy support)
  tricycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tricycle",
    required: false,
  },
  // Review type
  reviewType: {
    type: String,
    enum: ['tricycle', 'driver', 'booking'],
    default: 'tricycle',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
reviewSchema.index({ driver: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
