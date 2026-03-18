import prisma from "../../lib/prisma";

export const UserRepository = {
  findById: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  },
};
