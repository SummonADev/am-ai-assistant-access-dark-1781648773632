import clsx from 'clsx';
import { AssistantState } from '@/types';

type StatusBarProps = {
  state: AssistantState;
  isListening: boolean;
  isSpeechSupported: boolean;
};

export default function StatusBar({ state, isListening, isSpeechSupported }: StatusBarProps) {
  const getStatus = () => {
    if (!isSpeechSupported) return { label: 'Voice unavailable', color: 'text-red-400' };
    if (isListening) return { label: 'Microphone active', color: 'text-red-400' };
    if (state === 'thinking') return { label: 'Processing...', color: 'text-sky-400' };
    if (state === 'speaking') return { label: 'Speaking...', color: 'text-violet-400' };
    return { label: 'Ready', color: 'text-emerald-400' };
  };

  const { label, color } = getStatus();

  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          isListening
            ? 'bg-red-400 animate-pulse'
            : state === 'thinking'
            ? 'bg-sky-400 animate-pulse'
            : state === 'speaking'
            ? 'bg-violet-400 animate-pulse'
            : isSpeechSupported
            ? 'bg-emerald-400'
            : 'bg-red-400'
        )}
      />
      <span className={clsx('text-xs font-medium', color)}>{label}</span>
    </div>
  );
}
