import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const rateLimit: RequestHandler = (req, res, next) => {
  const key = req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown';
  const now = Date.now();
  const windowMs = env.rateLimitWindowMs;
  const max = env.rateLimitMax;

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({ error: 'Too many requests' });
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return next();
};
