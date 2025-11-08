import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { AgentState, Message, StageId } from '../types';
import { getSessionMessages } from '../api/sessions';
import { decodePCM16ToAudioBuffer, float32ToPCM16 } from '../utils/audioUtils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';
const INPUT_SAMPLE_RATE = 16000;
const BUFFER_SIZE = 2048;

type ServerTranscriptEvent = {
  speaker: Message['speaker'];
  text: string;
  timestamp: string;
  stageId?: StageId;
};

interface UseConversationArgs {
  sessionId: string;
  token: string;
  initialStageId: StageId;
}

export const useConversationManager = ({ sessionId, token, initialStageId }: UseConversationArgs) => {
  const [agentState, setAgentState] = useState<AgentState>('CONNECTING');
  const [isMuted, setIsMuted] = useState(false);
  const [currentStageId, setCurrentStageId] = useState<StageId>(initialStageId);
  const [transcripts, setTranscripts] = useState<Message[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const muteRef = useRef(isMuted);

  useEffect(() => {
    muteRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    let cancelled = false;
    const syncHistory = async () => {
      try {
        const { messages } = await getSessionMessages(sessionId, token);
        if (cancelled) return;
        const mapped = messages.map((message) => ({
          speaker: message.speaker,
          text: message.text ?? '[voice message]',
          timestamp: new Date(message.createdAt).toLocaleTimeString(),
        }));
        setTranscripts(mapped);
      } catch (error) {
        console.error('Failed to load history', error);
      }
    };
    syncHistory();
    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  const appendTranscript = useCallback((payload: ServerTranscriptEvent) => {
    setTranscripts((prev) => [
      ...prev,
      {
        speaker: payload.speaker,
        text: payload.text,
        timestamp: new Date(payload.timestamp).toLocaleTimeString(),
      },
    ]);
  }, []);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/voice`, {
      transports: ['websocket'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setAgentState('IDLE');
      setCurrentStageId(initialStageId);
    });

    socket.on('server:ready', () => {
      setAgentState('LISTENING');
    });

    socket.on('server:transcript', (payload: ServerTranscriptEvent) => {
      appendTranscript(payload);
      if (payload.stageId) {
        setCurrentStageId(payload.stageId);
      }
      setAgentState('LISTENING');
    });

    socket.on('server:agent_audio', async (payload: { audio: ArrayBuffer; sampleRate?: number }) => {
      if (!audioCtxRef.current) return;
      setAgentState('SPEAKING');
      try {
        const buffer = await decodePCM16ToAudioBuffer(
          payload.audio,
          audioCtxRef.current,
          payload.sampleRate ?? 24000,
          1,
        );
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start();
        source.onended = () => setAgentState('LISTENING');
      } catch (error) {
        console.error('Failed to play audio chunk', error);
        setAgentState('ERROR');
      }
    });

    socket.on('disconnect', () => {
      setAgentState('ERROR');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [appendTranscript, initialStageId, token]);

  const startCapture = useCallback(async () => {
    if (typeof window === 'undefined' || streamRef.current) return;
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        noiseSuppression: true,
        echoCancellation: true,
      },
    });
    const context = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
    await context.resume();
    const source = context.createMediaStreamSource(mediaStream);
    const processor = context.createScriptProcessor(BUFFER_SIZE, 1, 1);
    processor.onaudioprocess = (event) => {
      if (muteRef.current) return;
      const channelData = event.inputBuffer.getChannelData(0);
      const pcm = float32ToPCM16(channelData);
      socketRef.current?.emit('client:audio_chunk', pcm);
      setAgentState('LISTENING');
    };
    source.connect(processor);
    processor.connect(context.destination);
    audioCtxRef.current = context;
    processorRef.current = processor;
    streamRef.current = mediaStream;
  }, []);

  useEffect(() => {
    startCapture().catch((error) => {
      console.error('Microphone error', error);
      setAgentState('ERROR');
    });

    return () => {
      processorRef.current?.disconnect();
      audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      processorRef.current = null;
      audioCtxRef.current = null;
      streamRef.current = null;
    };
  }, [startCapture]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    agentState,
    isMuted,
    transcripts,
    currentStageId,
    toggleMute,
  };
};
