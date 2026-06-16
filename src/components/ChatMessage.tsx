import clsx from 'clsx';
import { Message } from '@/types';

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formattedContent = message.content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < message.content.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div
      className={clsx(
        'flex items-end gap-3 fade-in-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white'
            : 'bg-gradient-to-br from-violet-500 to-indigo-700 text-white'
        )}
      >
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={clsx(
          'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-emerald-600/80 to-teal-700/80 text-white rounded-br-sm border border-emerald-500/30'
            : 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-slate-100 rounded-bl-sm border border-white/10'
        )}
      >
        <p>{formattedContent}</p>
        <p
          className={clsx(
            'text-[10px] mt-1',
            isUser ? 'text-emerald-200/60 text-right' : 'text-slate-400/60'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
