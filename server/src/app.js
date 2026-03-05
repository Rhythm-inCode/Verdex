import express from "express";
import session from "express-session";
import cors from "cors";

import sessionConfig from "../config/session.js";
import healthRouter from "./routes/health.route.js";
import errorHandler from "./middleware/errorHandler.js";
import validateRouter from "./routes/validate.route.js";
import authRouter from "./routes/auth.route.js";
import configRoutes from "./routes/config.routes.js";
import dotenv from "dotenv";
dotenv.config();

import passport from "../config/passport.js";


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/validate", validateRouter);
app.use("/health", healthRouter);

app.use("/api/auth", authRouter);

app.use("/api/config", configRoutes);

// last middleware
app.use(errorHandler);

export default app;
