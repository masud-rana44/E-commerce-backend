import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().min(4).max(4).default("5000"),
  MONGODB_URI: z.string().url().min(1).default(""),
});

export const env = envSchema.safeParse(process.env);
