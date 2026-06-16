import { useState, useEffect, useRef, useCallback } from 'react';
import { createRecognition, isSpeechRecognitionSupported } from '@/lib/speechUtils';

type UseSpeechRecognitionReturn = {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isWakeWordActive: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
};

const WAKE_WORDS = ['hey aria', 'hey area', 'aria', 'hey arya', 'hi aria'];

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState<boolean>(false);
  const [isSupported] = useState<boolean>(isSpeechRecognitionSupported());

  const wakeRecognitionRef = useRef<any>(null);
  const commandRecognitionRef = useRef<any>(null);
  const isManualRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const isActiveRef = useRef<boolean>(false);
  const hasInteractedRef = useRef<boolean>(false);

  const stopAll = useCallback(() => {
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.abort(); } catch (_) {}
      wakeRecognitionRef.current = null;
    }
    if (commandRecognitionRef.current) {
      try { commandRecognitionRef.current.abort(); } catch (_) {}
      commandRecognitionRef.current = null;
    }
    isActiveRef.current = false;
  }, []);

  const startCommandListening = useCallback(() => {
    if (!mountedRef.current || !isSupported) return;

    stopAll();
    const rec = createRecognition();
    if (!rec) return;

    commandRecognitionRef.current = rec;
    isActiveRef.current = true;
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final) setTranscript(final.trim());
      setInterimTranscript(interim);
    };

    rec.onerror = (e: any) => {
      console.error('Command STT Error:', e.error);
      handleSessionEnd();
    };

    rec.onend = () => {
      handleSessionEnd();
    };

    const handleSessionEnd = () => {
      setIsListening(false);
      setInterimTranscript('');
      setIsWakeWordActive(false);
      isActiveRef.current = false;
      
      if (mountedRef.current && !isManualRef.current) {
        setTimeout(() => startWakeLoop(), 600);
      }
      isManualRef.current = false;
    };

    try {
      rec.start();
    } catch (err) {
      console.error('Failed to start command recognition:', err);
      isActiveRef.current = false;
    }
  }, [isSupported, stopAll]);

  const startWakeLoop = useCallback(() => {
    if (!mountedRef.current || !isSupported || isActiveRef.current) return;

    stopAll();
    const rec = createRecognition();
    if (!rec) return;

    wakeRecognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.toLowerCase().trim();
        const detected = WAKE_WORDS.some(ww => text.includes(ww));
        
        if (detected) {
          setIsWakeWordActive(true);
          stopAll();
          setTimeout(() => startCommandListening(), 200);
          return;
        }
      }
    };

    rec.onend = () => {
      if (mountedRef.current && !isActiveRef.current && !isManualRef.current) {
        setTimeout(() => startWakeLoop(), 400);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        console.warn('Mic permission denied.');
        return;
      }
      if (!isActiveRef.current) {
        setTimeout(() => startWakeLoop(), 1000);
      }
    };

    try {
      rec.start();
    } catch (_) {
      setTimeout(() => startWakeLoop(), 1000);
    }
  }, [isSupported, stopAll, startCommandListening]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopAll();
    };
  }, [stopAll]);

  // Manual interactions
  const startListening = useCallback(() => {
    if (!isSupported) return;
    hasInteractedRef.current = true;
    isManualRef.current = false;
    stopAll();
    setIsWakeWordActive(true);
    setTimeout(() => startCommandListening(), 100);
  }, [isSupported, stopAll, startCommandListening]);

  const stopListening = useCallback(() => {
    isManualRef.current = true;
    stopAll();
    setIsListening(false);
    setInterimTranscript('');
    setIsWakeWordActive(false);
    setTimeout(() => {
      isManualRef.current = false;
      startWakeLoop();
    }, 300);
  }, [stopAll, startWakeLoop]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Initial boot attempt after first user interaction with page
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        startWakeLoop();
      }
    };
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [startWakeLoop]);

  return {
    transcript,
    interimTranscript,
    isListening,
    isWakeWordActive,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
