process.env.DATABASE_URL = ':memory:';
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.MOCK_LLM = 'true';

import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { runMigrations } from '../src/db/migrator.js';

beforeAll(() => {
  runMigrations();
});

describe('session routes', () => {
  it('creates a session and fetches messages', async () => {
    const createResponse = await request(app)
      .post('/api/sessions')
      .send({ name: 'Tester', phone: '1234567890' })
      .expect(201);

    expect(createResponse.body.session).toBeDefined();
    expect(createResponse.body.token).toBeTypeOf('string');

    const { session, token } = createResponse.body;

    const sessionResponse = await request(app)
      .get(`/api/sessions/${session.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(sessionResponse.body.session.userName).toBe('Tester');

    const messagesResponse = await request(app)
      .get(`/api/sessions/${session.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(messagesResponse.body.messages)).toBe(true);
  });
});
