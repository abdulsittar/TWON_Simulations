// src/controllers/simulationController.ts

import { Request, Response } from "express";
//import { SimulationService } from "../services/simulation_KIT";
import { SimulationService } from "../services/simulation_TRIER";
import app from "../app";
import http from 'http';
import { Server } from 'socket.io';
import  {io}  from "../app";
import { performance } from 'perf_hooks';
import  responseLogger  from '../utils/logs/logger';

//const httpServer = http.createServer(app);

// Initialize Socket.IO with CORS options


export class SimulationController {
  static async startSimulation(req: Request, res: Response): Promise<Response> {
    try {
      const startTime = performance.now(); 
      const currentTime = Date.now(); // Get current timestamp in milliseconds
      SimulationService.initialize(io);
      await SimulationService.runSimulation(currentTime);
      const endTime = performance.now();
      responseLogger.info(`SimulationService.runSimulation --- Execution time: ${(endTime - startTime) / 1000} seconds`);
      return res.status(200).json({ message: "Simulation completed successfully." });
      
    } catch (error) {
      console.error("Error running simulation:", error);
      return res.status(500).json({ message: "Failed to run simulation", error: error });
    }
  }
}
  
  
  