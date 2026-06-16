import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, AssistantState } from '@/types';
import { processCommand, generateSmartReply } from '@/lib/commandProcessor';
import { speakText, stopSpeaking, getAvailableVoices } from '@/lib/speechUtils';
import { saveMessages, loadMessages, clearMessages } from '@/lib/storage';

type UseAssistantReturn = {
  messages: Message[];
  state: AssistantState;
  isMuted: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  availableVoices: SpeechSynthesisVoice[];
  sendMessage: (text: string) => void;
  clearChat: () => void;
  toggleMute: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useAssistant(): UseAssistantReturn {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadMessages();
    if (saved.length > 0) return saved;
    return [
      {
        id: generateId(),
        role: 'assistant',
        content: "Hi! I'm ARIA, your AI voice assistant. I can hear your voice commands, answer questions, search the web, and more. Click the microphone and start talking!",
        timestamp: new Date(),
      },
    ];
  });

  const [state, setState] = useState<AssistantState>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const processingRef = useRef<boolean>(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = getAvailableVoices();
      setAvailableVoices(voices);
      const preferred = voices.find(
        (v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
      ) || voices.find((v) => v.lang === 'en-US') || voices[0] || null;
      setSelectedVoice(preferred);
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || processingRef.current) return;
      processingRef.current = true;

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      addMessage(userMsg);
      setState('thinking');

      setTimeout(() => {
        const cmdResult = processCommand(text);
        let responseText = '';

        if (cmdResult) {
          if (cmdResult.description === '__CLEAR_CHAT__') {
            processingRef.current = false;
            clearMessages();
            setMessages([
              {
                id: generateId(),
                role: 'assistant',
                content: 'Chat cleared! How can I help you?',
                timestamp: new Date(),
              },
            ]);
            setState('idle');
            return;
          }
          responseText = cmdResult.description;
        } else {
          responseText = generateSmartReply(text);
        }

        const assistantMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };
        addMessage(assistantMsg);

        if (!isMuted) {
          setState('speaking');
          speakText(
            responseText,
            () => setState('speaking'),
            () => {
              setState('idle');
              processingRef.current = false;
            },
            selectedVoice
          );
        } else {
          setState('idle');
          processingRef.current = false;
        }
      }, 800 + Math.random() * 400);
    },
    [addMessage, isMuted, selectedVoice]
  );

  const clearChat = useCallback(() => {
    stopSpeaking();
    clearMessages();
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: "Chat cleared! I'm ARIA, ready to assist you. What can I do for you?",
        timestamp: new Date(),
      },
    ]);
    setState('idle');
    processingRef.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) stopSpeaking();
      return !prev;
    });
  }, []);

  return {
    messages,
    state,
    isMuted,
    selectedVoice,
    availableVoices,
    sendMessage,
    clearChat,
    toggleMute,
    setSelectedVoice,
  };
}
