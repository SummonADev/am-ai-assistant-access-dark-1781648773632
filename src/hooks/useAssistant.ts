import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, AssistantState } from '@/types';
import { processCommand, generateSmartReply } from '@/lib/commandProcessor';
import { speakText, stopSpeaking, getAvailableVoices, pickBestVoice } from '@/lib/speechUtils';
import { saveMessages, loadMessages, clearMessages } from '@/lib/storage';
import { updateMood } from '@/lib/ariaPersonality';

type UseAssistantReturn = {
  messages: Message[];
  state: AssistantState;
  isMuted: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  availableVoices: SpeechSynthesisVoice[];
  speechRate: number;
  speechPitch: number;
  sendMessage: (text: string) => void;
  clearChat: () => void;
  toggleMute: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechPitch: (pitch: number) => void;
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
        content:
          "Hey! I'm ARIA — Adaptive Reasoning Intelligence Assistant. I'm always listening — just say \"Hey ARIA\" to wake me up! I can open YouTube, Amazon, Spotify, and 40+ more sites. I can control your media, search the web, and genuinely love our conversations. Try saying \"Hey ARIA, open YouTube\" or just type below! 🌟",
        timestamp: new Date(),
      },
    ];
  });

  const [state, setState] = useState<AssistantState>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Slightly slower rate and higher pitch for a more human-like, warm female voice
  const [speechRate, setSpeechRate] = useState<number>(0.88);
  const [speechPitch, setSpeechPitch] = useState<number>(1.15);
  const processingRef = useRef<boolean>(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = getAvailableVoices();
      setAvailableVoices(voices);
      const preferred = pickBestVoice(voices);
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

      // Update ARIA's internal mood
      updateMood(text);

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
                content: 'Chat cleared! Fresh start — just say "Hey ARIA" or type to get going again!',
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
            selectedVoice,
            speechRate,
            speechPitch
          );
        } else {
          setState('idle');
          processingRef.current = false;
        }
      }, 500 + Math.random() * 200);
    },
    [addMessage, isMuted, selectedVoice, speechRate, speechPitch]
  );

  const clearChat = useCallback(() => {
    stopSpeaking();
    clearMessages();
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: "Chat cleared! I'm ARIA — just say \"Hey ARIA\" to wake me up anytime. What shall we explore?",
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
    speechRate,
    speechPitch,
    sendMessage,
    clearChat,
    toggleMute,
    setSelectedVoice,
    setSpeechRate,
    setSpeechPitch,
  };
}
