import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";
import { TaskQueryInput } from "./task.schema";

export const TaskRepository = {
  create: async (data: Prisma.TaskCreateInput) => {
    const task = await prisma.task.create({
      data,
    });
    return task;
  },
  findAll: async (userId: string, query: TaskQueryInput) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit; // eg: (2page - 1) * 10limit = 10task
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: {
          createdById: userId,
          status: query.status || undefined,
        },
        orderBy: {
          [query.sortBy || "createdAt"]: query.order || "desc",
        },
        skip,
        take: limit,
      }),
      prisma.task.count({
        where: {
          createdById: userId,
          status: query.status,
        },
      }),
    ]);
    return { tasks, total, page, limit };
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
