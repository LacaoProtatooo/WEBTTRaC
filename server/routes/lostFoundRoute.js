import express from 'express';
import { authUser } from '../middleware/authMiddleware.js';
import upload from '../utils/multer.js';
import { createLostFound, listLostFound, claimLostFound } from '../controllers/lostFoundController.js';

const router = express.Router();

router.get('/', authUser, listLostFound);
router.post('/', authUser, upload.single('photo'), createLostFound);
router.patch('/:id/claim', authUser, claimLostFound);

export default router;
