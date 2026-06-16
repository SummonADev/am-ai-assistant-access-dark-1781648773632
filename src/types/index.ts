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

export type PersonalityTrait = {
  name: string;
  value: number; // 0-1
};

export type ARIAMood = 'neutral' | 'happy' | 'curious' | 'playful' | 'focused' | 'empathetic';

export type BrowseResult = {
  url: string;
  title: string;
  opened: boolean;
};
