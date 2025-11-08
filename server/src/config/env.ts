import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const envFileName = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(process.cwd(), envFileName);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const number = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'TRUE'].includes(value);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: number(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-1.5-pro-latest',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./data/dev.db',
  serverApiKey: process.env.SERVER_API_KEY ?? 'dev-admin-key',
  rateLimitWindowMs: number(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: number(process.env.RATE_LIMIT_MAX, 60),
  enableMockLlm: bool(process.env.MOCK_LLM, true),
};

export type Env = typeof env;
