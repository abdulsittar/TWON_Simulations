import express from "express";
import { SchedulerController } from "../controllers/schedulerController"; // Import the Scheduler Controller

const router = express.Router();

// Route to initialize and run the scheduler
router.post("/initialize", SchedulerController.initializeScheduler);

// Route to manually trigger the scheduler actions
router.post("/run", SchedulerController.runAction);

export default router;
