export enum Sender {
  USER = 'user',
  AI = 'model'
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error'
}