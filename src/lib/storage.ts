import { Message } from '@/types';

const STORAGE_KEY = 'aria_chat_history';

export function saveMessages(messages: Message[]): void {
  try {
    const serialized = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (e: any) {
    console.warn('Could not save messages:', e.message);
  }
}

export function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch (e: any) {
    console.warn('Could not load messages:', e.message);
    return [];
  }
}

export function clearMessages(): void {
  localStorage.removeItem(STORAGE_KEY);
}
