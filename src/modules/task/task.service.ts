import { AppError } from "../../utils/AppError";
import { TaskRepository } from "./task.repository";
import { CreateTaskInput, UpdateTaskInput } from "./task.schema";

export const TaskService = {
  create: async (userId: string, data: CreateTaskInput) => {
    const task = await TaskRepository.create({
      ...data,
      createdBy: {
        connect: {
          id: userId,
        },
      },
    });
    return task;
  },
  getAll: async (userId: string) => {
    const tasks = await TaskRepository.findAll(userId);
    return tasks;
  },
  getById: async (id: string) => {
    const task = await TaskRepository.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    return task;
  },
  update: async (userId: string, id: string, data: UpdateTaskInput) => {
    const task = await TaskRepository.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    if (task.createdById !== userId)
      throw new AppError("You are not authorized to update this task", 403);
    const updatedTask = await TaskRepository.update(id, data);
    return updatedTask;
  },
  delete: async (userId: string, id: string) => {
    const task = await TaskRepository.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    if (task.createdById !== userId)
      throw new AppError("You are not authorized to delete this task", 403);
    return await TaskRepository.delete(id);
  },
};
