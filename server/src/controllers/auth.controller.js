import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import logActivity from "../../services/activityLogger.js";
import transporter from "../../config/mailer.js";


export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: emailNormalized,
      password: hashedPassword
    });

    await logActivity({
    userId: user._id,
    action: "USER_REGISTERED"
    });


    req.user = user._id;

    res.status(201).json({
      message: "User registered",
      userId: user._id
    });

  } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({ message: "Register server error" });
    }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailNormalized});
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        isDeactivated: true,
        message: "Account is deactivated."
      });
    }

    if (user && user.loginLockUntil && user.loginLockUntil > Date.now()) {

      const remainingMs = user.loginLockUntil - Date.now();
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      return res.status(403).json({
        message: "Account locked",
        lockRemaining: remainingSeconds
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {

      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.loginLockUntil = Date.now() + 2 * 60 * 1000; // 10 minutes
      }

      await user.save();

      await logActivity({
        userId: user._id,
        action: "LOGIN_FAILED"
      });

      return res.status(400).json({ message: "Invalid credentials" });
    }

    // After password match

    if (user.twoFactorEnabled) {

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.twoFactorOTP = otp;
      user.twoFactorExpiry = Date.now() + 5 * 60 * 1000;
      await user.save();

      // 🔴 ADD THIS LINE
      req.session.tempUserId = user._id;

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Your VERDEX Security Code",
        text: `Your verification code is ${otp}`
      });

      return res.json({ twoFactorRequired: true });
    }

    user.loginAttempts = 0;
    user.loginLockUntil = null;
    await user.save();

    // Normal login if 2FA disabled
    req.login(user, async (err) => {
      if (err) return next(err);

      await logActivity({
        userId: user._id,
        action: "USER_LOGGED_IN"
      });

      return res.json({ message: "Logged in" });
    });

  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.session.tempUserId);

    if (!user) {
      return res.status(400).json({ message: "Session expired" });
    }

    if (
      user.twoFactorOTP !== otp ||
      user.twoFactorExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.twoFactorOTP = null;
    user.twoFactorExpiry = null;
    await user.save();

    req.login(user, (err) => {
      if (err) return next(err);

      req.session.tempUserId = null;

      return res.json({ message: "2FA verified" });
    });

  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
    req.logout(() => {
    res.json({ message: "Logged out" });
  });
};

export const resend2FA = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.twoFactorOTP = otp;
    user.twoFactorExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Your VERDEX Security Code",
      text: `Your new verification code is ${otp}`
    });

    res.json({ message: "OTP resent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};
