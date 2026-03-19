import express from "express";
import { isAuth } from "../../middlewares/isAuth";
import { TaskController } from "./task.controller";

const router = express.Router();

router.post("/", isAuth, TaskController.createTask);
router.get("/", isAuth, TaskController.getAll);
router.get("/:taskId", isAuth, TaskController.getById);
router.patch("/:taskId", isAuth, TaskController.update);
router.delete("/:taskId", isAuth, TaskController.delete);

export default router;
