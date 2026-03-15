import { Prisma } from "../../generated/prisma";
import prisma from "../../lib/prisma";

export const AuthRepository = {
  create: async (data: Prisma.UserCreateInput) => {
    const user = await prisma.user.create({
      data,
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
