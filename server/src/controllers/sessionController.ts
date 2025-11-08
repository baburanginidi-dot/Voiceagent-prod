import type { RequestHandler } from 'express';
import { z } from 'zod';
import { createSession, getMessages, getSession, listSessions, upsertMessage } from '../services/sessionService.js';
import { signSessionToken } from '../middleware/auth.js';

const sessionSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
});

export const createSessionHandler: RequestHandler = (req, res) => {
  const parseResult = sessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parseResult.error.flatten() });
  }

  try {
    const session = createSession({
      userName: parseResult.data.name,
      userPhone: parseResult.data.phone,
    });

    const token = signSessionToken({
      sessionId: session.id,
      userName: session.userName,
      userPhone: session.userPhone,
    });

    return res.status(201).json({ session, token });
  } catch (error) {
    console.error('Failed to create session', error);
    return res.status(500).json({ error: 'Unable to create session' });
  }
};

export const listSessionsHandler: RequestHandler = (_req, res) => {
  return res.json({ sessions: listSessions() });
};

export const getSessionHandler: RequestHandler = (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json({ session });
};

export const getMessagesHandler: RequestHandler = (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const messages = getMessages(session.id, Number(req.query.limit) || 100);
  return res.json({ messages });
};

const messageSchema = z.object({
  speaker: z.enum(['user', 'agent']),
  text: z.string().min(1).optional(),
});

export const createMessageHandler: RequestHandler = (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const parseResult = messageSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parseResult.error.flatten() });
  }

  const message = upsertMessage(session.id, parseResult.data.speaker, parseResult.data.text);
  return res.status(201).json({ message });
};
