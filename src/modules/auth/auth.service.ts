import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "../../utils/token";
import { AuthRepository } from "./auth.repository";
import { LoginInput, RegisterInput } from "./auth.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthService = {
  register: async (data: RegisterInput) => {
    const existing = await AuthRepository.findByEmail(data.email);
    if (existing) throw new AppError("User already exists", 409);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await AuthRepository.create({
      ...data,
      password: hashedPassword,
    });
    return user;
  },
  login: async (data: LoginInput) => {
    const user = await AuthRepository.findByEmail(data.email);
    if (!user) throw new AppError("Invalid credentials", 401);
    const isPasswordMatch = await bcrypt.compare(data.password, user.password!);
    if (!isPasswordMatch) throw new AppError("Invalid credentials", 401);
    const { password: _password, ...safeUser } = user;
    const payload = {
      id: safeUser.id,
      email: safeUser.email,
      username: safeUser.username,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { user: safeUser, accessToken, refreshToken };
  },
  refresh: async (token: string) => {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      });
      return {
        accessToken: newAccessToken,
      };
    } catch (err) {
      throw new AppError("Invalid refresh token", 401);
    }
  },
};
