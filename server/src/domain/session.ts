import type { StageId } from './stages.js';

export type SessionStatus = 'active' | 'completed' | 'ended';

export interface SessionRecord {
  id: string;
  userName: string;
  userPhone: string;
  currentStageId: StageId;
  status: SessionStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type Speaker = 'user' | 'agent';

export interface MessageRecord {
  id: string;
  sessionId: string;
  speaker: Speaker;
  text?: string;
  audioBase64?: string | null;
  createdAt: string;
}
