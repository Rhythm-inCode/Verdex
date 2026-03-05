import ActivityLog from "../src/models/ActivityLog.model.js";

const logActivity = async ({ userId, action, metadata = {} }) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      metadata
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};

export default logActivity;
