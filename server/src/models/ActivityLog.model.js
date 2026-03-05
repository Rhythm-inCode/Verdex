import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    action: {
      type: String,
      required: true
    },

    metadata: {
      type: Object
    }
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
