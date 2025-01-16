// src/routes/simulationRoutes.ts

import express from "express";
import { SimulationController } from "../controllers/simulationController";

const router = express.Router();

router.post("/run-simulation", SimulationController.startSimulation);

export default router;
