import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { TokenPayload } from "../utils/token";
import { AppError } from "../utils/AppError";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new AppError("Unauthenticated", 401));
  }
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = decoded as TokenPayload;
    next();
  } catch (err) {
    return next(new AppError("Token is invalid or expired", 401));
  }
};
