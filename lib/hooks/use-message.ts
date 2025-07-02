import { useState } from 'react';

export type MessageType = 'error' | 'success';

export interface Message {
  type: MessageType;
  text: string;
}

export function useMessage() {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = (type: MessageType, text: string) => {
    setMessage({ type, text });
  };

  const showError = (text: string) => {
    showMessage('error', text);
  };

  const showSuccess = (text: string) => {
    showMessage('success', text);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return {
    message,
    showMessage,
    showError,
    showSuccess,
    clearMessage,
  };
}

