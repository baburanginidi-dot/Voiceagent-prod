import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifySessionToken } from '../middleware/auth.js';
import { createLlmService } from '../services/llmService.js';
import { VoiceSessionManager } from '../services/voiceSessionManager.js';

export const attachVoiceGateway = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      methods: ['GET', 'POST'],
    },
  });

  const voiceNamespace = io.of('/voice');
  const llm = createLlmService();
  const manager = new VoiceSessionManager({ io: voiceNamespace, llm });

  voiceNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token ?? socket.handshake.headers['x-session-token'];
    if (typeof token !== 'string') {
      return next(new Error('Missing session token'));
    }
    try {
      const claims = verifySessionToken(token);
      socket.data.sessionId = claims.sessionId;
      socket.data.userName = claims.userName;
      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  voiceNamespace.on('connection', (socket) => {
    const sessionId = socket.data.sessionId as string;
    socket.join(sessionId);
    socket.emit('server:ready', { sessionId });

    socket.on('client:audio_chunk', async (payload: ArrayBuffer | Buffer) => {
      if (!payload) return;
      const buffer = payload instanceof Buffer ? payload : Buffer.from(payload);
      await manager.ingest(sessionId, buffer);
    });
  });

  return io;
};
