import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Forum post cannot exceed 2000 characters'],
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [commentSchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual for like count
forumPostSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for comment count
forumPostSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

// Ensure virtuals are included in JSON
forumPostSchema.set('toJSON', { virtuals: true });
forumPostSchema.set('toObject', { virtuals: true });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

export default ForumPost;
