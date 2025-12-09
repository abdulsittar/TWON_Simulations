// routes/analytics.routes.ts
import express from "express";
import { Analytics } from "../models/content/analytics.model";

const router = express.Router();

// Save analytics data
router.post("/save", async (req, res) => {
  try {
    const { userGrowth, featureUsage, heatmapData } = req.body;

    const analytics = new Analytics({
      userGrowth,
      featureUsage,
      heatmapData,
    });

    await analytics.save();
    res.status(201).json({ message: "Data saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error saving analytics data" });
  }
});

// Get the latest analytics data
router.get("/latest", async (req, res) => {
  try {
    const latestData = await Analytics.findOne().sort({ date: -1 });
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching analytics data" });
  }
});

export default router;
