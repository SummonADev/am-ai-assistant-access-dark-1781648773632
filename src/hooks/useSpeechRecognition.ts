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

  const wakeRecognitionRef = useRef<any>(null);
  const commandRecognitionRef = useRef<any>(null);
  const wakeActiveRef = useRef<boolean>(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const commandRunningRef = useRef<boolean>(false);

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const stopWakeRecognition = () => {
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.abort(); } catch (_) {}
      wakeRecognitionRef.current = null;
    }
  };

  const stopCommandRecognition = () => {
    if (commandRecognitionRef.current) {
      try { commandRecognitionRef.current.abort(); } catch (_) {}
      commandRecognitionRef.current = null;
    }
    commandRunningRef.current = false;
  };

  // Forward declaration ref so startWakeLoop can call startCommandListening
  const startCommandListeningRef = useRef<() => void>(() => {});
  const startWakeLoopRef = useRef<() => void>(() => {});

  const startCommandListening = useCallback(() => {
    if (!mountedRef.current || !isSupported) return;
    if (commandRunningRef.current) return;

    stopCommandRecognition();

    const rec = createRecognition();
    if (!rec) return;

    commandRunningRef.current = true;
    commandRecognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      if (!mountedRef.current) return;
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      if (!mountedRef.current) return;
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
      if (final) setTranscript(final.trim());
      setInterimTranscript(interim);
    };

    rec.onerror = (e: any) => {
      if (!mountedRef.current) return;
      // 'no-speech' is normal — just restart wake loop
      setIsListening(false);
      setInterimTranscript('');
      setIsWakeWordActive(false);
      wakeActiveRef.current = false;
      commandRunningRef.current = false;
      commandRecognitionRef.current = null;

      if (e.error !== 'not-allowed' && e.error !== 'service-not-allowed') {
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (mountedRef.current && !wakeActiveRef.current) {
            startWakeLoopRef.current();
          }
        }, 600);
      }
    };

    rec.onend = () => {
      if (!mountedRef.current) return;
      setIsListening(false);
      setInterimTranscript('');
      setIsWakeWordActive(false);
      wakeActiveRef.current = false;
      commandRunningRef.current = false;
      commandRecognitionRef.current = null;

      if (!isManualRef.current) {
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (mountedRef.current && !wakeActiveRef.current) {
            startWakeLoopRef.current();
          }
        }, 600);
      }
      isManualRef.current = false;
    };

    try {
      rec.start();
    } catch (_) {
      commandRunningRef.current = false;
      commandRecognitionRef.current = null;
    }
  }, [isSupported]);

  const startWakeLoop = useCallback(() => {
    if (!mountedRef.current || !isSupported) return;
    if (wakeActiveRef.current) return; // Don't start wake loop if command is active

    stopWakeRecognition();

    const rec = createRecognition();
    if (!rec) return;

    wakeRecognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      if (!mountedRef.current) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.toLowerCase().trim();
        if (text.includes(WAKE_WORD) && !wakeActiveRef.current) {
          wakeActiveRef.current = true;
          setIsWakeWordActive(true);
          stopWakeRecognition();
          clearRestartTimer();
          // Small delay so the mic releases cleanly before opening command listener
          setTimeout(() => {
            startCommandListeningRef.current();
          }, 250);
          return;
        }
      }
    };

    rec.onend = () => {
      if (!mountedRef.current) return;
      if (!wakeActiveRef.current) {
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (mountedRef.current && !wakeActiveRef.current) {
            startWakeLoopRef.current();
          }
        }, 400);
      }
    };

    rec.onerror = (e: any) => {
      if (!mountedRef.current) return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') return;
      if (!wakeActiveRef.current) {
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (mountedRef.current && !wakeActiveRef.current) {
            startWakeLoopRef.current();
          }
        }, 1200);
      }
    };

    try {
      rec.start();
    } catch (_) {
      // If already started or other error, retry after delay
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        if (mountedRef.current && !wakeActiveRef.current) {
          startWakeLoopRef.current();
        }
      }, 1000);
    }
  }, [isSupported]);

  // Keep refs in sync with latest functions
  useEffect(() => {
    startCommandListeningRef.current = startCommandListening;
  }, [startCommandListening]);

  useEffect(() => {
    startWakeLoopRef.current = startWakeLoop;
  }, [startWakeLoop]);

  // Boot wake loop on mount
  useEffect(() => {
    mountedRef.current = true;
    if (!isSupported) return;

    // Small delay to let the browser finish initialising
    const bootTimer = setTimeout(() => {
      startWakeLoopRef.current();
    }, 500);

    return () => {
      mountedRef.current = false;
      clearTimeout(bootTimer);
      clearRestartTimer();
      stopWakeRecognition();
      stopCommandRecognition();
    };
  }, [isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual start/stop (mic button) ───────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported) return;
    clearRestartTimer();
    stopWakeRecognition();
    wakeActiveRef.current = true;
    isManualRef.current = false;
    setIsWakeWordActive(true);
    setTimeout(() => {
      startCommandListeningRef.current();
    }, 150);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    isManualRef.current = true;
    stopCommandRecognition();
    setIsListening(false);
    setInterimTranscript('');
    setIsWakeWordActive(false);
    wakeActiveRef.current = false;
    // Restart wake loop
    clearRestartTimer();
    restartTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        startWakeLoopRef.current();
      }
    }, 500);
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
