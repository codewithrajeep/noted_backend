import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type TokenPayload = {
  id: string;
  email: string;
  username: string;
};

export const generateAccessToken = (payload: TokenPayload) => {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload) => {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};
