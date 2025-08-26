
import { LaptopSpecs } from './laptop';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: LaptopSpecs[];  // Add products data for carousel display
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

export type ChatMode = 'comparison' | 'chat';
