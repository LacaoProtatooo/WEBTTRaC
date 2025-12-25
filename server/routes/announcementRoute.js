// server/routes/announcementRoute.js
import express from 'express';
import {
  createAnnouncement,
  getActiveAnnouncements,
  getUnreadAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead,
  getInbox,
  getUnreadCount,
} from '../controllers/announcementController.js';
import { authUser, adminOnly } from '../middleware/authMiddleware.js';
// import { authorizeRoles } from '../middleware/operatorMiddleware.js';

const router = express.Router();

// NOTE: ADD AUTHORIZEROLES MIDDLEWARE FOR ADMIN/OPERATOR ROUTES

// User routes
router.get('/active', authUser, getActiveAnnouncements);
router.get('/unread', authUser, getUnreadAnnouncements);
router.get('/inbox', authUser, getInbox);
router.get('/unread-count', authUser, getUnreadCount);
router.post('/mark-read/:announcementId', authUser, markAnnouncementAsRead);
router.post('/mark-all-read', authUser, markAllAnnouncementsAsRead);

// Admin/Operator routes
router.post('/', authUser, createAnnouncement);
router.get('/all', authUser, getAllAnnouncements);
router.get('/:id', authUser, getAnnouncementById);  // Get single announcement by ID
router.put('/:id', authUser, updateAnnouncement);
router.delete('/:id', authUser, deleteAnnouncement);

export default router;