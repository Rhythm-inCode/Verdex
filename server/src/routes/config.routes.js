import express from "express";
import ScoringConfig from "../models/ScoringConfig.model.js";

const router = express.Router();

router.get("/active", async (req, res) => {
  try {
    const config = await ScoringConfig.findOne({ active: true });

    if (!config) {
      return res.status(404).json({ message: "No active config found" });
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch config" });
  }
});


router.put("/", async (req, res) => {
  try {
    const {
      demandWeight,
      competitionWeight,
      marginWeight,
      productWeight,
      executionWeight,
      goThreshold,
      noGoThreshold,
    } = req.body;

    // 🔹 Validate Product Layer Weights
    const productTotal =
      demandWeight + competitionWeight + marginWeight;

    if (Math.abs(productTotal - 1) > 0.001) {
      return res.status(400).json({
        message: "Product weights must total 1"
      });
    }

    // 🔹 Validate Fusion Layer Weights
    const fusionTotal =
      productWeight + executionWeight;

    if (Math.abs(fusionTotal - 1) > 0.001) {
      return res.status(400).json({
        message: "Fusion weights must total 1"
      });
    }

    // 🔹 Threshold validation
    if (noGoThreshold >= goThreshold) {
      return res.status(400).json({
        message: "Invalid thresholds"
      });
    }

    const updated = await ScoringConfig.findOneAndUpdate(
      { active: true },
      {
        demandWeight,
        competitionWeight,
        marginWeight,
        productWeight,
        executionWeight,
        goThreshold,
        noGoThreshold,
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;