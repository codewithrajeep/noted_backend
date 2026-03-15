import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";

export const AuthRepository = {
  create: async (data: Prisma.UserCreateInput) => {
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  },
  findByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  },
};
