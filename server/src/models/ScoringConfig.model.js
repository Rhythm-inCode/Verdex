import mongoose from "mongoose";

const scoringConfigSchema = new mongoose.Schema(
  {
  demandWeight: { type: Number, required: true },
  competitionWeight: { type: Number, required: true },
  marginWeight: { type: Number, required: true },

  productWeight: { type: Number, required: true },    // new
  executionWeight: { type: Number, required: true },  // new

  goThreshold: { type: Number, required: true },
  noGoThreshold: { type: Number, required: true },

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("ScoringConfig", scoringConfigSchema);
