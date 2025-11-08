import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const requireServerKey: RequestHandler = (req, res, next) => {
  const header = req.headers['x-api-key'];
  if (header !== env.serverApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  return next();
};
