// Speech utilities — TTS + STT helpers

export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createRecognition(): any {
  const SR =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  return recognition;
}

// ── Voice selection ───────────────────────────────────────────────────────────

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Pick the most human-sounding female voice available.
 * Priority order:
 * 1. Google UK English Female (very natural)
 * 2. Google US English (Female)
 * 3. Microsoft Zira / Aria / Jenny (Windows)
 * 4. Samantha (macOS)
 * 5. Any English female voice
 * 6. Any English voice
 * 7. First available voice
 */
export function pickBestVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const priorityNames = [
    'Google UK English Female',
    'Google US English',
    'Microsoft Aria Online (Natural)',
    'Microsoft Aria - English (United States)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Jenny - English (United States)',
    'Microsoft Zira - English (United States)',
    'Samantha',
    'Karen',
    'Moira',
    'Tessa',
  ];

  for (const name of priorityNames) {
    const match = voices.find((v) =>
      v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match) return match;
  }

  // Any English female
  const engFemale = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('girl'))
  );
  if (engFemale) return engFemale;

  // Any English
  const eng = voices.find((v) => v.lang.startsWith('en'));
  if (eng) return eng;

  return voices[0];
}

// ── Text to Speech ────────────────────────────────────────────────────────────

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  voice?: SpeechSynthesisVoice | null,
  rate: number = 0.88,
  pitch: number = 1.15
): void {
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown-like symbols for cleaner TTS
  const cleanText = text
    .replace(/[*_`~#]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500); // cap to prevent very long utterances

  const utterance = new SpeechSynthesisUtterance(cleanText);

  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  // Slight pause hint via lang
  utterance.lang = voice?.lang || 'en-US';

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  // Safari workaround — slight delay
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
