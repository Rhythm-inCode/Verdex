import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      }
    },

    role: {
      type: String,
      enum: ["FOUNDER", "ADMIN"],
      default: "FOUNDER"
    },

    profileImage: {
      type: String,
      default: ""
    },
    loginAttempts: { type: Number, default: 0 },
    loginLockUntil: { type: Date, default: null },

    lastLogin: Date,

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    otpAttempts: {
      type: Number,
      default: 0
    },
    twoFactorOTP: String,
    twoFactorExpiry: Date,

    preferences: {
      bgIntensity: { type: Number, default: 1 },
      motionSensitivity: { type: Number, default: 1 },
      blurStrength: { type: Number, default: 20 },
      defaultPage: { type: String, default: "dashboard" },
      reduceMotion: { type: Boolean, default: false },
      theme: { type: String, default: "dark" }
    },

    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
