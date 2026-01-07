export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachment?: Attachment;
  timestamp: number;
  isError?: boolean;
}

export interface DiagnosisState {
  isAnalyzing: boolean;
  messages: Message[];
}
