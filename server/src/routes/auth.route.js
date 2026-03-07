import { Router } from "express";
import { register, login, logout, resend2FA } from "../controllers/auth.controller.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.middleware.js";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import ValidationResult from "../models/ValidationResult.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import passport from "passport";
import { verifyOTP } from "../controllers/auth.controller.js";
import transporter from "../../config/mailer.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);
router.post("/verify-otp", verifyOTP);

router.post("/logout", logout);

router.post("/logout-all", async (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "All sessions cleared" });
  });
});

router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user,
        { profileImage: req.file.path },
        { new: true }
      );

      res.json({ profileImage: user.profileImage });
    } catch (err) {
  console.error("UPLOAD ERROR:", err);
  res.status(500).json({ message: err.message });
}
  }
);

router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    await user.save();

    const updatedUser = await User.findById(req.user)
      .select("-password");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.put("/update-preferences", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user);

    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

router.post("/verify-2fa", async (req, res) => {
  const { otp } = req.body;

  const userId = req.session.tempUserId;

  if (!userId) {
    return res.status(400).json({ message: "Session expired. Please login again." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  if (Date.now() > user.twoFactorExpiry) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (user.twoFactorOTP !== otp) {

    user.otpAttempts = (user.otpAttempts || 0) + 1;

    if (user.otpAttempts >= 5) {
      user.twoFactorOTP = null;
      user.twoFactorExpiry = null;
      user.otpAttempts = 0;
      await user.save();

      req.session.tempUserId = null;

      return res.status(400).json({
        message: "Too many attempts. Please login again."
      });
    }

    await user.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // SUCCESS
  user.twoFactorOTP = null;
  user.twoFactorExpiry = null;
  user.otpAttempts = 0;
  await user.save();

  req.session.tempUserId = null;

  req.login(user, (err) => {
    if (err) {
      return res.status(500).json({ message: "Login failed after 2FA" });
    }

    return res.json({ message: "2FA Verified" });
  });
});

router.post("/resend-otp", async (req, res) => {

  const userId = req.session.tempUserId;

  if (!userId) {
    return res.status(400).json({ message: "Session expired. Please login again." });
  }

  const user = await User.findById(userId);

  if (!user || !user.twoFactorEnabled) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.twoFactorOTP = otp;
  user.twoFactorExpiry = Date.now() + 5 * 60 * 1000;
  user.otpAttempts = 0;

  await user.save();

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: "Your VERDEX Security Code",
    text: `Your verification code is ${otp}`
  });

  res.json({ message: "OTP resent" });
});

router.put("/toggle-2fa", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user);
  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save();
  res.json(user);
});

router.post("/resend-2fa", resend2FA);

router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Compare hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // 🔐 Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password update failed" });
  }
});

router.post("/admin/unlock-user", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.loginAttempts = 0;
  user.loginLockUntil = null;
  await user.save();

  res.json({ message: "User unlocked successfully" });
});

router.get("/ping", (req, res) => {
  res.json({ alive: true });
});

router.post("/soft-delete", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user);

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    req.session.destroy(() => {
      res.json({ message: "Account deactivated successfully." });
    });

  } catch (err) {
    res.status(500).json({ message: "Soft delete failed." });
  }
});

router.delete("/hard-delete", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isDeleted) {
      return res.status(400).json({
        message: "Account must be deactivated first."
      });
    }

    await ValidationResult.deleteMany({ owner: user._id });
    await ActivityLog.deleteMany({ owner: user._id });

    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account permanently deleted." });

  } catch (err) {
    res.status(500).json({ message: "Hard delete failed." });
  }
});

router.post("/restore-account", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isDeleted) {
      return res.status(400).json({
        message: "No deactivated account found."
      });
    }

    user.isDeleted = false;
    user.deletedAt = null;

    await user.save();

    res.json({ message: "Account restored." });

  } catch (err) {
    res.status(500).json({ message: "Restore failed." });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res, next) => {
    try {
      const user = req.user;

      if (user.twoFactorEnabled) {

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.twoFactorOTP = otp;
        user.twoFactorExpiry = Date.now() + 5 * 60 * 1000;
        user.otpAttempts = 0;
        await user.save();

        // IMPORTANT
        req.session.tempUserId = user._id;

        await new Promise((resolve, reject) => {
          req.session.save(err => {
            if (err) reject(err);
            else resolve();
          });
        });

        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: user.email,
          subject: "Your VERDEX Security Code",
          text: `Your verification code is ${otp}`
        });

        return res.redirect("http://localhost:5173/verify-2fa");
      }

      return res.redirect("https://verdex-20.vercel.app/dashboard");

    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json(req.user);
});

export default router;
