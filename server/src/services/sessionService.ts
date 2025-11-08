import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { INTRO_STAGE, type StageId } from '../domain/stages.js';
import type { MessageRecord, SessionRecord, SessionStatus, Speaker } from '../domain/session.js';

interface CreateSessionInput {
  userName: string;
  userPhone: string;
  currentStageId?: StageId;
}

const mapSession = (row: any): SessionRecord => ({
  id: row.id,
  userName: row.user_name,
  userPhone: row.user_phone,
  currentStageId: row.current_stage_id,
  status: row.status,
  metadata: row.metadata ? JSON.parse(row.metadata) : null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapMessage = (row: any): MessageRecord => ({
  id: row.id,
  sessionId: row.session_id,
  speaker: row.role,
  text: row.text ?? undefined,
  audioBase64: row.audio_base64 ?? undefined,
  createdAt: row.created_at,
});

export const createSession = (input: CreateSessionInput): SessionRecord => {
  const id = uuidv4();
  const stage = input.currentStageId ?? INTRO_STAGE;

  const stmt = db.prepare(
    `INSERT INTO sessions (id, user_name, user_phone, current_stage_id, status, metadata)
     VALUES (@id, @userName, @userPhone, @currentStageId, 'active', json(@metadata))`,
  );

  stmt.run({
    id,
    userName: input.userName,
    userPhone: input.userPhone,
    currentStageId: stage,
    metadata: JSON.stringify({
      history: [],
    }),
  });

  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  return mapSession(row);
};

export const listSessions = (): SessionRecord[] => {
  const rows = db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
  return rows.map(mapSession);
};

export const getSession = (id: string): SessionRecord | null => {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  return row ? mapSession(row) : null;
};

export const upsertMessage = (sessionId: string, speaker: Speaker, text?: string, audioBase64?: string): MessageRecord => {
  const id = uuidv4();
  const stmt = db.prepare(
    `INSERT INTO messages (id, session_id, role, text, audio_base64)
     VALUES (@id, @sessionId, @role, @text, @audioBase64)`,
  );
  stmt.run({
    id,
    sessionId,
    role: speaker,
    text,
    audioBase64,
  });
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  return mapMessage(row);
};

export const getMessages = (sessionId: string, limit = 100): MessageRecord[] => {
  const rows = db
    .prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?')
    .all(sessionId, limit);
  return rows.map(mapMessage);
};

export const updateStage = (sessionId: string, stageId: StageId): SessionRecord | null => {
  const stmt = db.prepare('UPDATE sessions SET current_stage_id = @stageId WHERE id = @sessionId');
  stmt.run({ stageId, sessionId });
  return getSession(sessionId);
};

export const updateStatus = (sessionId: string, status: SessionStatus): SessionRecord | null => {
  const stmt = db.prepare('UPDATE sessions SET status = @status WHERE id = @sessionId');
  stmt.run({ status, sessionId });
  return getSession(sessionId);
};
