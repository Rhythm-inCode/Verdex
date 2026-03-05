import mongoose from "mongoose";

const validationResultSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    demandScore: {
      type: Number,
      required: true
    },

    competitionScore: {
      type: Number,
      required: true
    },

    validationScore: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      required: true
    },


    recommendation: {
      type: String,
      enum: ["GO", "NO_GO", "TEST_MORE"],
      required: true
    },

    grossProfit: Number,
    netProfit: Number,
    marginPercent: Number,
    breakEvenROAS: Number,
    rawMarginPercent: Number,
    netMarginPercent: Number,
    productScore: Number,
    executionScore: Number,
  },
  { timestamps: true }
);

export default mongoose.model("ValidationResult", validationResultSchema);
