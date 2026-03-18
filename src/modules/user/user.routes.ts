import express from "express";
import { isAuth } from "../../middlewares/isAuth";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/me", isAuth, UserController.getMe);

export default router;
