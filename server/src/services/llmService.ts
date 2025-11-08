import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import type { MessageRecord } from '../domain/session.js';
import type { StageId } from '../domain/stages.js';
import { buildSystemPrompt } from './promptBuilder.js';
import { bufferToBase64, createSineWaveBuffer } from './audio/pcm.js';

export type LlmEvent =
  | { type: 'transcript'; text: string }
  | { type: 'audio'; audio: Buffer; sampleRate: number };

export interface LlmPayload {
  sessionId: string;
  userName: string;
  stageId: StageId;
  audioChunk: Buffer;
  history: MessageRecord[];
}

export interface LlmService {
  stream(payload: LlmPayload): AsyncGenerator<LlmEvent>;
}

class GeminiLlmService implements LlmService {
  private client = new GoogleGenAI({
    apiKey: env.geminiApiKey!,
  });

  private model = this.client.getGenerativeModel({
    model: env.geminiModel,
    responseModalities: ['TEXT', 'AUDIO'],
    audioFormat: 'LINEAR16',
  });

  async *stream(payload: LlmPayload): AsyncGenerator<LlmEvent> {
    const prompt = buildSystemPrompt(payload.userName, payload.stageId, payload.history);
    const base64 = bufferToBase64(payload.audioChunk);

    const contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64,
            },
          },
        ],
      },
    ];

    const result = await this.model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const candidates = result.response?.candidates ?? [];
    const textParts = candidates
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => (part.text ? part.text : ''))
      .filter(Boolean);

    const audioPart = candidates
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .find((part: any) => {
        const blob = part.inlineData ?? part.inline_data;
        const mime = blob?.mimeType ?? blob?.mime_type;
        return typeof mime === 'string' && mime.includes('audio/pcm');
      });

    if (textParts.length > 0) {
      for (const chunk of textParts) {
        yield { type: 'transcript', text: chunk };
      }
    }

    if (audioPart) {
      const inlineData = (audioPart as any).inlineData ?? (audioPart as any).inline_data;
      if (inlineData?.data) {
        const buffer = Buffer.from(inlineData.data, 'base64');
        yield { type: 'audio', audio: buffer, sampleRate: 24000 };
      }
    }
  }
}

class MockLlmService implements LlmService {
  async *stream(payload: LlmPayload): AsyncGenerator<LlmEvent> {
    const transcript = `Received ${payload.audioChunk.length} bytes for ${payload.userName}. Tell me more about your goals.`;
    yield { type: 'transcript', text: transcript };
    yield { type: 'audio', audio: createSineWaveBuffer(transcript), sampleRate: 24000 };
  }
}

export const createLlmService = (): LlmService => {
  if (env.geminiApiKey && !env.enableMockLlm) {
    return new GeminiLlmService();
  }
  return new MockLlmService();
};
