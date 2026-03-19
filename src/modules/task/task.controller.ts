import { NextFunction, Request, Response } from "express";
import { TaskService } from "./task.service";
import { createTaskSchema, updateTaskSchema } from "./task.schema";

export const TaskController = {
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const body = createTaskSchema.parse(req.body);
      const task = await TaskService.create(userId, body);
      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const tasks = await TaskService.getAll(userId);
      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const task = await TaskService.getById(taskId as string);
      return res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { taskId } = req.params;
      const body = updateTaskSchema.parse(req.body);
      const task = await TaskService.update(userId, taskId as string, body);
      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { taskId } = req.params;
      await TaskService.delete(userId, taskId as string);
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
