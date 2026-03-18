import { AppError } from "../../utils/AppError";
import { UserRepository } from "./user.repository";

export const UserService = {
  getMe: async (id: string) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};
