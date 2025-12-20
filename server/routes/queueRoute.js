import express from 'express';
import { authUser } from '../middleware/authMiddleware.js';
import { listQueue, joinQueue, cancelQueue, listTerminals, callNext } from '../controllers/queueController.js';

const router = express.Router();

router.get('/', authUser, listQueue);
router.get('/terminals', authUser, listTerminals);
router.post('/', authUser, joinQueue);
router.post('/advance', authUser, callNext);
router.delete('/:id', authUser, cancelQueue);

export default router;
