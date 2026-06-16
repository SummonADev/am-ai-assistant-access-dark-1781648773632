export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}

export function createRecognition(): any {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  return recognition;
}

// Preferred human-like voices in order of preference
const PREFERRED_VOICE_NAMES = [
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
  'Fiona',
  'Victoria',
  'Allison',
  'Ava',
  'Susan',
  'Joanna',
  'Salli',
  'Kimberly',
  'Kendra',
  'Ivy',
  'Google US English',
  'Google UK English Female',
  'Microsoft Aria Online',
  'Microsoft Jenny Online',
  'Microsoft Zira',
];

export function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const name of PREFERRED_VOICE_NAMES) {
    const found = voices.find((v) => v.name.includes(name) && v.lang.startsWith('en'));
    if (found) return found;
  }
  // Fallback: any female-sounding English voice
  const englishFemale = voices.find(
    (v) => v.lang.startsWith('en') && /female|woman|girl/i.test(v.name)
  );
  if (englishFemale) return englishFemale;
  // Fallback: any English voice
  const english = voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en'));
  return english || voices[0] || null;
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  voice?: SpeechSynthesisVoice | null,
  rate?: number,
  pitch?: number
): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();

  // Split long text into sentences for more natural delivery
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

  let index = 0;
  const speakNext = () => {
    if (index >= sentences.length) {
      if (onEnd) onEnd();
      return;
    }
    const sentence = sentences[index].trim();
    if (!sentence) { index++; speakNext(); return; }

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = rate ?? 0.92;
    utterance.pitch = pitch ?? 1.1;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;

    if (index === 0 && onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      index++;
      speakNext();
    };
    utterance.onerror = () => {
      index++;
      speakNext();
    };
    window.speechSynthesis.speak(utterance);
  };

  speakNext();
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}
