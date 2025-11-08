import type { SessionClaims } from '../middleware/auth.js';

declare global {
  namespace Express {
    interface Request {
      sessionClaims?: SessionClaims;
    }
  }
}

export {};
