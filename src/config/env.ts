import 'dotenv/config'
import z from 'zod'

const envSchema = z.object({
    PORT: z.string().min(1),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production']),
    CLIENT_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_ACCESS_EXPIRES_IN: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1),
})

const _env = envSchema.safeParse(process.env);

if(!_env.success){
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1)
}

export const env = _env.data!;
