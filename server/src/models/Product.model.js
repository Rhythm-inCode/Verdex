import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      index: true
    },

    costPrice: {
      type: Number,
      required: true
    },

    sellingPrice: {
      type: Number,
      required: true
    },

    targetMarket: {
      type: String,
      required: true
    },

    adCost: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
