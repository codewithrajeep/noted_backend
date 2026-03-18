import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

export const UserController = {
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.id;
      const user = await UserService.getMe(id);
      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
};
