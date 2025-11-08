import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface SessionClaims {
  sessionId: string;
  userName: string;
  userPhone: string;
}

export const signSessionToken = (claims: SessionClaims) =>
  jwt.sign(claims, env.jwtSecret, { expiresIn: '12h' });

export const verifySessionToken = (token: string): SessionClaims =>
  jwt.verify(token, env.jwtSecret) as SessionClaims;

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ error: 'Invalid Authorization header' });
  }

  try {
    const claims = verifySessionToken(token);
    req.sessionClaims = claims;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
