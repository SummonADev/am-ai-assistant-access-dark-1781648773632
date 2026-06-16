import { Volume2, VolumeX, Trash2, X } from 'lucide-react';

type VoiceSettingsPanelProps = {
  isMuted: boolean;
  onToggleMute: () => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice | null) => void;
  onClearChat: () => void;
  onClose: () => void;
  speechRate: number;
  speechPitch: number;
  onSpeechRateChange: (rate: number) => void;
  onSpeechPitchChange: (pitch: number) => void;
};

export default function VoiceSettingsPanel({
  isMuted,
  onToggleMute,
  availableVoices,
  selectedVoice,
  onSelectVoice,
  onClearChat,
  onClose,
  speechRate,
  speechPitch,
  onSpeechRateChange,
  onSpeechPitchChange,
}: VoiceSettingsPanelProps) {
  const englishVoices = availableVoices.filter((v) => v.lang.startsWith('en'));

  return (
    <div className="absolute top-0 right-0 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 z-50 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Voice Settings</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Mute toggle */}
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <span className="text-xs text-slate-300">Voice responses</span>
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isMuted
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          }`}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          {isMuted ? 'Muted' : 'Active'}
        </button>
      </div>

      {/* Voice selection */}
      {englishVoices.length > 0 && (
        <div className="py-3 border-b border-white/5">
          <p className="text-xs text-slate-400 mb-2">Assistant voice</p>
          <select
            value={selectedVoice?.name || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const voice = englishVoices.find((v) => v.name === e.target.value) || null;
              onSelectVoice(voice);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            {englishVoices.map((v) => (
              <option key={v.name} value={v.name} className="bg-slate-800">
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-600 mt-1">Tip: "Samantha", "Google UK English Female", and "Microsoft Aria" sound most natural.</p>
        </div>
      )}

      {/* Speech rate */}
      <div className="py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400">Speaking speed</p>
          <span className="text-xs text-violet-300 font-medium">{speechRate.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.05}
          value={speechRate}
          onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">Slow</span>
          <span className="text-[10px] text-slate-600">Fast</span>
        </div>
      </div>

      {/* Speech pitch */}
      <div className="py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400">Voice pitch</p>
          <span className="text-xs text-violet-300 font-medium">{speechPitch.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.05}
          value={speechPitch}
          onChange={(e) => onSpeechPitchChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">Deep</span>
          <span className="text-[10px] text-slate-600">High</span>
        </div>
      </div>

      {/* Clear chat */}
      <div className="pt-3">
        <button
          onClick={() => {
            onClearChat();
            onClose();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-all"
        >
          <Trash2 size={13} />
          Clear conversation
        </button>
      </div>
    </div>
  );
}
