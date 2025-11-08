import type { Namespace } from 'socket.io';
import type { LlmService } from './llmService.js';
import { getMessages, getSession, upsertMessage } from './sessionService.js';

interface SessionContext {
  chunks: Buffer[];
  processing: boolean;
}

interface VoiceSessionManagerDeps {
  io: Namespace;
  llm: LlmService;
}

export class VoiceSessionManager {
  private contexts = new Map<string, SessionContext>();

  private io: Namespace;

  private llm: LlmService;

  constructor({ io, llm }: VoiceSessionManagerDeps) {
    this.io = io;
    this.llm = llm;
  }

  async ingest(sessionId: string, chunk: Buffer) {
    const context = this.contexts.get(sessionId) ?? { chunks: [], processing: false };
    context.chunks.push(chunk);
    this.contexts.set(sessionId, context);

    upsertMessage(sessionId, 'user', undefined, chunk.toString('base64'));

    if (!context.processing) {
      this.process(sessionId, context).catch((error) => {
        console.error(`[voice] failed to process session ${sessionId}`, error);
        context.processing = false;
      });
    }
  }

  private async process(sessionId: string, context: SessionContext) {
    context.processing = true;
    while (context.chunks.length > 0) {
      const chunk = Buffer.concat(context.chunks.splice(0));
      const session = getSession(sessionId);
      if (!session) {
        break;
      }

      const history = getMessages(sessionId, 100);

      for await (const event of this.llm.stream({
        sessionId,
        userName: session.userName,
        stageId: session.currentStageId,
        audioChunk: chunk,
        history,
      })) {
        if (event.type === 'transcript') {
          const message = upsertMessage(sessionId, 'agent', event.text);
          this.io.to(sessionId).emit('server:transcript', {
            speaker: 'agent',
            text: event.text,
            timestamp: message.createdAt,
            stageId: session.currentStageId,
          });
        }

        if (event.type === 'audio') {
          upsertMessage(sessionId, 'agent', undefined, event.audio.toString('base64'));
          const uint8 = event.audio instanceof Buffer ? event.audio : Buffer.from(event.audio);
          this.io.to(sessionId).emit('server:agent_audio', {
            audio: uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength),
            sampleRate: event.sampleRate,
          });
        }
      }
    }
    context.processing = false;
  }
}
