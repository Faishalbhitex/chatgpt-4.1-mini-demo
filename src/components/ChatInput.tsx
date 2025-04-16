// src/components/ChatInput.tsx
import React, { useState } from 'react';
import './ChatInput.css'; // Import CSS

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  messageCount: number;
  limit: number;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, messageCount, limit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isDisabled) { // Cek lagiisDisabled di sini
      onSendMessage(inputValue.trim());
      setInputValue(''); // Kosongkan input setelah kirim
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Tombol & input nonaktif jika sedang loading ATAU batas tercapai
  const isDisabled = disabled || messageCount >= limit;
  const placeholderText = isDisabled
    ? `Batas pesan (${limit}) tercapai.`
    : `Ketik pesan Anda (${messageCount}/${limit})...`;

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholderText}
        disabled={isDisabled}
        aria-label="Chat input"
      />
      <button type="submit" disabled={isDisabled}>
        Kirim
      </button>
    </form>
  );
};

export default ChatInput;
