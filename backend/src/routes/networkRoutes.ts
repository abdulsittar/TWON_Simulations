import express from "express";
import { generateGraphHandler } from "../controllers/networkController";

const router = express.Router();

router.post("/create", generateGraphHandler);

export default router;
