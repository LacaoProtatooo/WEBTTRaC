import express from 'express';
import upload from '../utils/multer.js';
import { 
    parseLicense, 
    saveLicense, 
    getLicense,
    // Admin endpoints
    getAllDrivers,
    getDriverDetails,
    verifyLicense,
    rejectLicense,
    deleteLicense,
    getLicenseStats,
} from '../controllers/licenseController.js';
import { authUser, adminOnly, operatorAndAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============== USER ENDPOINTS ==============

// Parse license (Upload -> OCR -> Return JSON)
router.post('/parse', authUser, upload.single('licenseImage'), parseLicense);

// Save license (Receive verified data -> Save to DB)
router.post('/save', authUser, saveLicense);

// Get license details (user's own)
router.get('/:userId', authUser, getLicense);

// ============== ADMIN ENDPOINTS ==============

// Get license statistics
router.get('/admin/stats', operatorAndAdmin, getLicenseStats);

// Get all drivers with license info
router.get('/admin/drivers', operatorAndAdmin, getAllDrivers);

// Get single driver details
router.get('/admin/drivers/:driverId', operatorAndAdmin, getDriverDetails);

// Verify a license
router.put('/admin/verify/:licenseId', operatorAndAdmin, verifyLicense);

// Reject a license
router.put('/admin/reject/:licenseId', operatorAndAdmin, rejectLicense);

// Delete a license
router.delete('/admin/:licenseId', operatorAndAdmin, deleteLicense);

export default router;
