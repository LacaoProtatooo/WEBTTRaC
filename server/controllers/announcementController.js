// server/controllers/announcementController.js
import Announcement from '../models/announcementModel.js';
import User from '../models/userModel.js';

// Create new announcement (admin/operator only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, scheduledDate, expiryDate, type, targetAudience } = req.body;
    
    const announcement = await Announcement.create({
      title,
      message,
      scheduledDate,
      expiryDate,
      type,
      targetAudience,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active announcements for user
export const getActiveAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role;
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      scheduledDate: { $lte: now },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: now } },
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole },
      ],
    })
    .sort({ scheduledDate: -1 })
    .populate('createdBy', 'username firstname lastname');

    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get unread announcements (based on last login)
export const getUnreadAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role;
    const lastLogin = req.user.lastLogin || req.user.createdAt;
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      scheduledDate: { $lte: now, $gte: lastLogin },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: now } },
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole },
      ],
    })
    .sort({ scheduledDate: -1 })
    .populate('createdBy', 'username firstname lastname');

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all announcements (admin/operator)
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username firstname lastname');

    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark announcement as read for a user
export const markAnnouncementAsRead = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user.readAnnouncements.includes(announcementId)) {
      user.readAnnouncements.push(announcementId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Announcement marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all announcements as read
export const markAllAnnouncementsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const now = new Date();

    // Get all active announcements for this user
    const announcements = await Announcement.find({
      isActive: true,
      scheduledDate: { $lte: now },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: now } },
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole },
      ],
    });

    const announcementIds = announcements.map(a => a._id);
    
    await User.findByIdAndUpdate(userId, {
      readAnnouncements: announcementIds,
    });

    res.status(200).json({
      success: true,
      message: 'All announcements marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inbox with read/unread status
export const getInbox = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const now = new Date();
    const { filter } = req.query; // 'all', 'unread', 'read'

    const user = await User.findById(userId);
    const readIds = user.readAnnouncements || [];

    let query = {
      isActive: true,
      scheduledDate: { $lte: now },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: now } },
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole },
      ],
    };

    // Apply filter
    if (filter === 'unread') {
      query._id = { $nin: readIds };
    } else if (filter === 'read') {
      query._id = { $in: readIds };
    }

    const announcements = await Announcement.find(query)
      .sort({ scheduledDate: -1 })
      .populate('createdBy', 'username firstname lastname');

    // Add isRead flag to each announcement
    const announcementsWithStatus = announcements.map(announcement => ({
      ...announcement.toObject(),
      isRead: readIds.some(id => id.toString() === announcement._id.toString()),
    }));

    const unreadCount = await Announcement.countDocuments({
      isActive: true,
      scheduledDate: { $lte: now },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: now } },
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole },
      ],
      _id: { $nin: readIds },
    });

    res.status(200).json({
      success: true,
      announcements: announcementsWithStatus,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get unread count only
export const getUnreadCount = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const now = new Date();

    const user = await User.findById(userId);
    const readIds = user.readAnnouncements || [];

    const unreadCount = await Announcement.countDocuments({
      isActive: true,
      scheduledDate: { $lte: now },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: now } },
      ],
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole },
      ],
      _id: { $nin: readIds },
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};