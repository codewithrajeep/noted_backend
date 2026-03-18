import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";

export const TaskRepository = {
  create: async (data: Prisma.TaskCreateInput) => {
    const task = await prisma.task.create({
      data,
    });
    return task;
  },
  findAll: async (userId: string) => {
    const tasks = await prisma.task.findMany({
      where: {
        createdById: userId,
      },
    });
    return tasks;
  },
  findById: async (id: string) => {
    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });
    return task;
  },
  update: async (id: string, data: Prisma.TaskUpdateInput) => {
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    return task;
  },
  delete: async (id: string) => {
    const task = await prisma.task.delete({
      where: { id },
    });
    return task;
  },
};
