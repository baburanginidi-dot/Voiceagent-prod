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

export const STAGES: Stage[] = [
  { id: 'INTRO', title: 'Intro' },
  { id: 'PROGRAM_VALUE_L1', title: 'Program Value' },
  { id: 'PROGRAM_VALUE_L2', title: 'Program Details' },
  { id: 'PAYMENT_STRUCTURE', title: 'Payment' },
  { id: 'NBFC', title: 'NBFC' },
  { id: 'RCA', title: 'Co-Applicant' },
  { id: 'KYC', title: 'KYC' },
  { id: 'END_FLOW', title: 'Finish' },
];

export const INTRO_STAGE: StageId = 'INTRO';
