import { useState } from 'react';
import { Send } from 'lucide-react';

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || disabled) return;
      onSend(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message or use the mic..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all max-h-28 min-h-[46px]"
        style={{ overflowY: 'auto' }}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white hover:from-violet-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
