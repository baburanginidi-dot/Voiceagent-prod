
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

export type Speaker = 'User' | 'Maya';

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
