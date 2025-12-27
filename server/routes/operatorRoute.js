import express from 'express';
import {
  getOperatorOverview,
  getOperatorTricycles,
  getAvailableDrivers,
  assignDriverToTricycle,
  unassignDriverFromTricycle,
  getDriverDetails,
  scanReceipt,
  saveReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  getExpenseSummary,
} from '../controllers/operatorController.js';
import { authUser } from '../middleware/authMiddleware.js';
import { operatorOnly } from '../middleware/operatorMiddleware.js';
import upload from '../utils/multer.js';

const router = express.Router();

// All routes require authentication and operator role
router.use(authUser);
router.use(operatorOnly);

// Operator overview - get all tricycles and drivers
router.get('/overview', getOperatorOverview);

// Get operator's tricycles
router.get('/tricycles', getOperatorTricycles);

// Get available drivers (not assigned to any tricycle)
router.get('/drivers/available', getAvailableDrivers);

// Get driver details
router.get('/drivers/:driverId', getDriverDetails);

// Assign driver to tricycle
router.post('/assign-driver', assignDriverToTricycle);

// Unassign driver from tricycle
router.post('/unassign-driver', unassignDriverFromTricycle);

// Scan receipt image (multipart/form-data) - field name: `image`
router.post('/scan-receipt', upload.single('image'), scanReceipt);

// Receipt CRUD operations
router.post('/receipts', saveReceipt);
router.get('/receipts', getReceipts);
router.get('/receipts/summary', getExpenseSummary);
router.get('/receipts/:receiptId', getReceiptById);
router.put('/receipts/:receiptId', updateReceipt);
router.delete('/receipts/:receiptId', deleteReceipt);

export default router;


