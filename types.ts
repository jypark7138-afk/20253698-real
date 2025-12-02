export enum Page {
  HOME = 'HOME',
  QUEST = 'QUEST',
  CHAT = 'CHAT',
  STATS = 'STATS'
}

export interface Quest {
  id: string;
  title: string;
  steps: QuestStep[];
  isCompleted: boolean;
  category: 'study' | 'life' | 'health';
  createdAt: number;
}

export interface QuestStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface DailyMood {
  date: string; // YYYY-MM-DD
  level: number; // 1-5
  note?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
