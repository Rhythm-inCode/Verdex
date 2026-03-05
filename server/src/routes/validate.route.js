import { Router } from "express";
import requireAuth from "../middleware/auth.middleware.js";
import  validateProductController  from "../controllers/validation.controller.js";
import {
  getUserValidations
} from "../controllers/validation.controller.js";


const router = Router();

router.post("/", requireAuth, validateProductController);
router.get("/validations", requireAuth, getUserValidations);


export default router;
