import ForumPost from '../models/forumPostModel.js';

export const createForumPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const post = await ForumPost.create({
      author: userId,
      content: content.trim(),
    });

    await post.populate('author', 'firstname lastname role username image');

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, message: 'Failed to create forum post' });
  }
};

export const getForumPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const userId = req.user?._id;

    const posts = await ForumPost.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .populate('author', 'firstname lastname role username image')
      .populate('comments.author', 'firstname lastname role username image');

    // Add isLiked field for each post
    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = userId ? post.likes.some(id => id.toString() === userId.toString()) : false;
      return postObj;
    });

    res.status(200).json({
      success: true,
      data: postsWithLikeStatus,
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ success: false, message: 'Failed to load forum posts' });
  }
};

// Toggle like on a post
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      isLiked: likeIndex === -1,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
};

// Add comment to a post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      author: userId,
      content: content.trim(),
    });

    await post.save();
    await post.populate('comments.author', 'firstname lastname role username image');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

// Delete a post (only author can delete)
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await ForumPost.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// Delete a comment (only comment author can delete)
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};
