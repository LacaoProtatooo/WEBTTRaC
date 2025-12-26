import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingDetails,
  getActiveBooking,
  driverRespondToBooking,
  respondToOffer,
  completeTrip,
  cancelBooking,
  rateDriver,
  getNearbyBookings,
  getDriverBookings,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Booking Routes
 * Base path: /api/booking
 */

// User routes
router.post('/create', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/active', protect, getActiveBooking);
router.post('/:id/respond-offer', protect, respondToOffer);
router.post('/:id/rate', protect, rateDriver);

// Driver routes
router.get('/nearby', protect, authorize('driver'), getNearbyBookings);
router.get('/driver', protect, authorize('driver'), getDriverBookings);
router.post('/:id/driver-respond', protect, authorize('driver'), driverRespondToBooking);

// Shared routes (user or driver)
router.get('/:id', protect, getBookingDetails);
router.post('/:id/complete', protect, completeTrip);
router.post('/:id/cancel', protect, cancelBooking);

export default router;
