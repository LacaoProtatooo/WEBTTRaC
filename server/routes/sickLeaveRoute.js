import express from "express";
import { 
    createSickLeave, 
    getDriverSickLeaves, 
    getOperatorSickLeaves, 
    approveSickLeave,
    rejectSickLeave,
    cancelSickLeave
} from "../controllers/sickLeaveController.js";
import { authUser } from "../middleware/authMiddleware.js";
import { operatorOnly } from "../middleware/operatorMiddleware.js";

const router = express.Router();

// Driver routes
router.post("/", authUser, createSickLeave);
router.get("/driver", authUser, getDriverSickLeaves);
router.patch("/:id/cancel", authUser, cancelSickLeave);

// Operator routes
router.get("/operator", authUser, operatorOnly, getOperatorSickLeaves);
router.patch("/:id/approve", authUser, operatorOnly, approveSickLeave);
router.patch("/:id/reject", authUser, operatorOnly, rejectSickLeave);

export default router;
