import z from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can contain only letters, numbers and underscores",
    ),
  name: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens and apostrophes",
    ),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
