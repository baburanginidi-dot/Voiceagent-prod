import { Router, type RequestHandler } from 'express';
import {
  createMessageHandler,
  createSessionHandler,
  getMessagesHandler,
  getSessionHandler,
  listSessionsHandler,
} from '../controllers/sessionController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireServerKey } from '../middleware/serverKey.js';

const router = Router();

const requireSessionOwner: RequestHandler = (req, res, next) => {
  const claims = req.sessionClaims;
  if (!claims || claims.sessionId !== req.params.sessionId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
};

router.post('/', createSessionHandler);
router.get('/', requireServerKey, listSessionsHandler);

router.get('/:sessionId', requireAuth, requireSessionOwner, getSessionHandler);
router.get('/:sessionId/messages', requireAuth, requireSessionOwner, getMessagesHandler);
router.post('/:sessionId/messages', requireAuth, requireSessionOwner, createMessageHandler);

export default router;
