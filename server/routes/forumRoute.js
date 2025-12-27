import express from 'express';
import { authUser } from '../middleware/authMiddleware.js';
import { 
  createForumPost, 
  getForumPosts, 
  toggleLike, 
  addComment, 
  deletePost,
  deleteComment 
} from '../controllers/forumController.js';

const router = express.Router();

router.route('/')
  .get(authUser, getForumPosts)
  .post(authUser, createForumPost);

router.route('/:postId')
  .delete(authUser, deletePost);

router.route('/:postId/like')
  .post(authUser, toggleLike);

router.route('/:postId/comments')
  .post(authUser, addComment);

router.route('/:postId/comments/:commentId')
  .delete(authUser, deleteComment);

export default router;
