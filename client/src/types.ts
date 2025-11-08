
export type StageId = 
  | 'INTRO' 
  | 'PROGRAM_VALUE_L1' 
  | 'PROGRAM_VALUE_L2' 
  | 'PAYMENT_STRUCTURE' 
  | 'NBFC' 
  | 'RCA' 
  | 'KYC' 
  | 'END_FLOW';

export interface Stage {
  id: StageId;
  title: string;
}

export type Speaker = 'user' | 'agent';

export interface Message {
  speaker: Speaker;
  text: string;
  timestamp: string;
}

export type AgentState = 'THINKING' | 'LISTENING' | 'SPEAKING' | 'IDLE' | 'CONNECTING' | 'ERROR';

export interface User {
  name: string;
  phone: string;
}

export type SessionStatus = 'active' | 'completed' | 'ended';

export interface Session {
  id: string;
  userName: string;
  userPhone: string;
  currentStageId: StageId;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSession {
  token: string;
  session: Session;
}

export interface ServerMessage {
  id: string;
  speaker: Speaker;
  text?: string;
  audioBase64?: string;
  createdAt: string;
}
