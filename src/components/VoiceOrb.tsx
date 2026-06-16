import clsx from 'clsx';
import { AssistantState } from '@/types';

type VoiceOrbProps = {
  state: AssistantState;
  isListening: boolean;
  onClick: () => void;
};

export default function VoiceOrb({ state, isListening, onClick }: VoiceOrbProps) {
  const active = isListening || state === 'speaking' || state === 'thinking';

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onClick}
        className={clsx(
          'relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none',
          active ? 'pulse-ring glow' : 'hover:scale-105',
          isListening
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : state === 'speaking'
            ? 'bg-gradient-to-br from-violet-500 to-purple-700'
            : state === 'thinking'
            ? 'bg-gradient-to-br from-sky-500 to-blue-700'
            : 'bg-gradient-to-br from-indigo-500 to-violet-700'
        )}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {/* Inner glow */}
        <div
          className={clsx(
            'absolute inset-2 rounded-full opacity-30',
            isListening ? 'bg-red-300' : 'bg-white'
          )}
        />

        {/* Icon area */}
        <div className="relative z-10">
          {isListening ? (
            <WaveformIcon />
          ) : state === 'thinking' ? (
            <ThinkingIcon />
          ) : state === 'speaking' ? (
            <SpeakingIcon />
          ) : (
            <MicIcon />
          )}
        </div>
      </button>

      {/* Status label */}
      <div
        className={clsx(
          'text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full',
          isListening
            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
            : state === 'speaking'
            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
            : state === 'thinking'
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
            : 'bg-white/5 text-slate-400 border border-white/10'
        )}
      >
        {isListening ? 'Listening...' : state === 'thinking' ? 'Thinking...' : state === 'speaking' ? 'Speaking...' : 'Tap to speak'}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <div className="flex items-center gap-[3px] h-9">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div
          key={i}
          className="waveform-bar w-[3px] bg-white rounded-full"
          style={{ height: `${20 + Math.random() * 16}px` }}
        />
      ))}
    </div>
  );
}

function ThinkingIcon() {
  return (
    <div className="flex items-center gap-2">
      <div className="typing-dot w-3 h-3 rounded-full bg-white" />
      <div className="typing-dot w-3 h-3 rounded-full bg-white" />
      <div className="typing-dot w-3 h-3 rounded-full bg-white" />
    </div>
  );
}

function SpeakingIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
