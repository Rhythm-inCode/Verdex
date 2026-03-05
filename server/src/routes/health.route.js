import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState
  });
});

export default router;
