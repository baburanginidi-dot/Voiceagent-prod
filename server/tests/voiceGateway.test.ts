process.env.DATABASE_URL = ':memory:';
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.MOCK_LLM = 'true';

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as Client } from 'socket.io-client';
import app from '../src/app.js';
import { runMigrations } from '../src/db/migrator.js';
import { attachVoiceGateway } from '../src/ws/voiceGateway.js';

let server: http.Server;
let port: number;

beforeAll(async () => {
  runMigrations();
  server = http.createServer(app);
  attachVoiceGateway(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  port = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('voice gateway', () => {
  it('accepts audio chunks and streams responses', async () => {
    const { body } = await request(app)
      .post('/api/sessions')
      .send({ name: 'Stream Tester', phone: '9999999999' })
      .expect(201);

    const { token } = body;

    const socket = Client(`http://localhost:${port}/voice`, {
      transports: ['websocket'],
      auth: { token },
    });

    await new Promise<void>((resolve) => {
      socket.on('connect', resolve);
    });

    const received = await new Promise<{ transcript: unknown; audio: unknown }>((resolve, reject) => {
      const payload = { transcript: null as unknown, audio: null as unknown };
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for events')), 7000);

      socket.on('server:transcript', (event) => {
        payload.transcript = event;
        if (payload.audio) {
          clearTimeout(timeout);
          resolve(payload);
        }
      });

      socket.on('server:agent_audio', (event) => {
        payload.audio = event;
        if (payload.transcript) {
          clearTimeout(timeout);
          resolve(payload);
        }
      });

      const chunk = new Int16Array(2048);
      socket.emit('client:audio_chunk', chunk.buffer);
    });

    expect(received.transcript).toBeDefined();
    expect(received.audio).toBeDefined();

    socket.disconnect();
  });
});
