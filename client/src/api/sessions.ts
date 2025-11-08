import type { ServerMessage, Session } from '../types';
import { apiFetch } from './http';

export interface CreateSessionResponse {
  session: Session;
  token: string;
}

export const createSession = async (input: { name: string; phone: string }) =>
  apiFetch<CreateSessionResponse>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const getSession = async (sessionId: string, token: string) =>
  apiFetch<{ session: Session }>(`/api/sessions/${sessionId}`, {
    method: 'GET',
    token,
  });

export const getSessionMessages = async (sessionId: string, token: string) =>
  apiFetch<{ messages: ServerMessage[] }>(`/api/sessions/${sessionId}/messages`, {
    method: 'GET',
    token,
  });
