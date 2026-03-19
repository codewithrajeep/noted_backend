import express from "express";
import { AuthController } from "./auth.controller";
import { authLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

router.post("/register", authLimiter, AuthController.register);
router.post("/login", authLimiter, AuthController.login);
router.post("/refresh", AuthController.refresh);
export default router;
