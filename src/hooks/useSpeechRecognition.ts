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

const WAKE_WORD = 'hey aria';

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState<boolean>(false);
  const [isSupported] = useState<boolean>(isSpeechRecognitionSupported());

  // Wake word listener — always-on, continuous recognition
  const wakeRecognitionRef = useRef<any>(null);
  // Command listener — activated after wake word
  const commandRecognitionRef = useRef<any>(null);
  const wakeActiveRef = useRef<boolean>(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Wake-word loop ────────────────────────────────────────────────────────
  const startWakeLoop = useCallback(() => {
    if (!isSupported) return;
    const rec = createRecognition();
    if (!rec) return;
    wakeRecognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.toLowerCase().trim();
        if (text.includes(WAKE_WORD) && !wakeActiveRef.current) {
          wakeActiveRef.current = true;
          setIsWakeWordActive(true);
          // Stop wake loop, start command recognition
          try { rec.stop(); } catch (_) {}
          startCommandListening();
          return;
        }
      }
    };

    rec.onend = () => {
      // Restart wake loop after a short pause unless wake word was detected
      if (!wakeActiveRef.current) {
        restartTimerRef.current = setTimeout(() => {
          startWakeLoop();
        }, 300);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') return; // user blocked mic
      if (!wakeActiveRef.current) {
        restartTimerRef.current = setTimeout(() => {
          startWakeLoop();
        }, 1000);
      }
    };

    try { rec.start(); } catch (_) {}
  }, [isSupported]); // startCommandListening added via closure below

  // ── Command recognition (one-shot after wake) ────────────────────────────
  const startCommandListening = useCallback(() => {
    if (!isSupported) return;
    const rec = createRecognition();
    if (!rec) return;
    commandRecognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;

    setIsListening(true);

    rec.onstart = () => setIsListening(true);

    rec.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          final += r[0].transcript;
        } else {
          interim += r[0].transcript;
        }
      }
      if (final) setTranscript(final);
      setInterimTranscript(interim);
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      setIsWakeWordActive(false);
      wakeActiveRef.current = false;
      // Restart wake word loop
      restartTimerRef.current = setTimeout(() => {
        startWakeLoop();
      }, 500);
    };

    rec.onerror = () => {
      setIsListening(false);
      setInterimTranscript('');
      setIsWakeWordActive(false);
      wakeActiveRef.current = false;
      restartTimerRef.current = setTimeout(() => {
        startWakeLoop();
      }, 500);
    };

    try { rec.start(); } catch (_) {}
  }, [isSupported, startWakeLoop]);

  // Patch startWakeLoop to use startCommandListening after it's defined
  useEffect(() => {
    if (!isSupported) return;
    startWakeLoop();
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (wakeRecognitionRef.current) { try { wakeRecognitionRef.current.stop(); } catch (_) {} }
      if (commandRecognitionRef.current) { try { commandRecognitionRef.current.stop(); } catch (_) {} }
    };
  }, [isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual start/stop (mic button) ───────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported) return;
    // Stop wake loop before starting manual command
    if (wakeRecognitionRef.current) { try { wakeRecognitionRef.current.stop(); } catch (_) {} }
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    wakeActiveRef.current = true; // Prevent wake loop from restarting during command
    setIsWakeWordActive(true);
    startCommandListening();
  }, [isSupported, startCommandListening]);

  const stopListening = useCallback(() => {
    if (commandRecognitionRef.current) {
      try { commandRecognitionRef.current.stop(); } catch (_) {}
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

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
