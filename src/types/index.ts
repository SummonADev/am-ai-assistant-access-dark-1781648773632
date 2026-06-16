export type MessageRole = 'user' | 'assistant' | 'system';

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isTyping?: boolean;
};

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type CommandResult = {
  action: string;
  description: string;
  success: boolean;
};
