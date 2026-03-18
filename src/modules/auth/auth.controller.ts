import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.schema";
import { AppError } from "../../utils/AppError";

export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerSchema.parse(req.body);
      const user = await AuthService.register(body);
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginSchema.parse(req.body);
      const user = await AuthService.login(body);
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400));
      }
      const accessToken = await AuthService.refresh(refreshToken);
      return res.status(200).json({
        success: true,
        message: "Access token generated successfully",
        data: accessToken,
      });
    } catch (err) {
      next(err);
    }
  },
};
