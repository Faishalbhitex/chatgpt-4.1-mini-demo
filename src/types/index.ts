// src/types/index.ts
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'; // Peran sesuai standar OpenAI
  content: string;
}
