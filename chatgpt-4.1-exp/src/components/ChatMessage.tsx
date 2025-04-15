// src/components/ChatMessage.tsx
import React from 'react';
import { ChatMessage as MessageType } from '../types';
import './ChatMessage.css'; // Import CSS

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Jangan tampilkan pesan system (jika ada)
  if (message.role === 'system') {
      return null;
  }

  const messageClass = `message ${message.role}`;
  const displayName = message.role === 'assistant' ? 'AI' : 'You';

  return (
    <div className={messageClass}>
      <span className="role">{displayName}</span>
      {/* Menggunakan <pre> untuk mempertahankan format spasi/baris baru dari AI jika ada */}
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{message.content}</pre>
    </div>
  );
};

export default ChatMessage;
