import { v4 as uuidv4 } from 'uuid';
import { eq, desc, asc } from 'drizzle-orm';
import { db } from '../db/postgres.js';
import { sessions, messages } from '../../../shared/schema.js';
import { INTRO_STAGE, type StageId } from '../domain/stages.js';
import type { MessageRecord, SessionRecord, SessionStatus, Speaker } from '../domain/session.js';

interface CreateSessionInput {
  userName: string;
  userPhone: string;
  currentStageId?: StageId;
}

const mapSession = (row: any): SessionRecord => ({
  id: row.id,
  userName: row.userName,
  userPhone: row.userPhone,
  currentStageId: row.currentStageId,
  status: row.status,
  metadata: row.metadata ? JSON.parse(row.metadata) : null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapMessage = (row: any): MessageRecord => ({
  id: row.id,
  sessionId: row.sessionId,
  speaker: row.role,
  text: row.text ?? undefined,
  audioBase64: row.audioBase64 ?? undefined,
  createdAt: row.createdAt,
});

export const createSession = async (input: CreateSessionInput): Promise<SessionRecord> => {
  const id = uuidv4();
  const stage = input.currentStageId ?? INTRO_STAGE;

  const [session] = await db
    .insert(sessions)
    .values({
      id,
      userName: input.userName,
      userPhone: input.userPhone,
      currentStageId: stage,
      status: 'active',
      metadata: JSON.stringify({
        history: [],
      }),
    })
    .returning();

  return mapSession(session);
};

export const listSessions = async (): Promise<SessionRecord[]> => {
  const rows = await db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.createdAt));

  return rows.map(mapSession);
};

export const getSession = async (id: string): Promise<SessionRecord | null> => {
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);

  return row ? mapSession(row) : null;
};

export const upsertMessage = async (
  sessionId: string,
  speaker: Speaker,
  text?: string,
  audioBase64?: string
): Promise<MessageRecord> => {
  const id = uuidv4();

  const [message] = await db
    .insert(messages)
    .values({
      id,
      sessionId,
      role: speaker,
      text,
      audioBase64,
    })
    .returning();

  return mapMessage(message);
};

export const getMessages = async (sessionId: string, limit = 100): Promise<MessageRecord[]> => {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.createdAt))
    .limit(limit);

  return rows.map(mapMessage);
};

export const updateStage = async (
  sessionId: string,
  stageId: StageId
): Promise<SessionRecord | null> => {
  await db
    .update(sessions)
    .set({ currentStageId: stageId })
    .where(eq(sessions.id, sessionId));

  return getSession(sessionId);
};

export const updateStatus = async (
  sessionId: string,
  status: SessionStatus
): Promise<SessionRecord | null> => {
  await db
    .update(sessions)
    .set({ status })
    .where(eq(sessions.id, sessionId));

  return getSession(sessionId);
};
