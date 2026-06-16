import { Play, Pause, SkipBack, SkipForward, Square, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

type MediaControlsProps = {
  onCommand: (cmd: string) => void;
};

export default function MediaControls({ onCommand }: MediaControlsProps) {
  const [volume, setVolume] = useState<number>(80);
  const [muted, setMuted] = useState<boolean>(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    onCommand(`set volume to ${val}`);
  };

  const handleMuteToggle = () => {
    setMuted((prev) => {
      onCommand(prev ? 'unmute' : 'mute');
      return !prev;
    });
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="w-full bg-white/3 border border-white/8 rounded-2xl p-4 space-y-4">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold text-center">Media Controls</p>

      {/* Playback buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => onCommand('previous track')}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 flex items-center justify-center text-slate-400 hover:text-violet-300 transition-all"
          title="Previous"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={() => onCommand('play')}
          className="w-11 h-11 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 hover:border-violet-500/60 flex items-center justify-center text-violet-300 hover:text-violet-200 transition-all"
          title="Play"
        >
          <Play size={18} fill="currentColor" />
        </button>

        <button
          onClick={() => onCommand('pause')}
          className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 flex items-center justify-center text-slate-400 hover:text-violet-300 transition-all"
          title="Pause"
        >
          <Pause size={18} fill="currentColor" />
        </button>

        <button
          onClick={() => onCommand('stop')}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-slate-400 hover:text-red-300 transition-all"
          title="Stop"
        >
          <Square size={16} fill="currentColor" />
        </button>

        <button
          onClick={() => onCommand('next track')}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 flex items-center justify-center text-slate-400 hover:text-violet-300 transition-all"
          title="Next"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMuteToggle}
          className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
          title={muted ? 'Unmute' : 'Mute'}
        >
          <VolumeIcon size={14} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1.5 rounded-full accent-violet-500 cursor-pointer"
          title={`Volume: ${muted ? 0 : volume}%`}
        />
        <span className="text-[10px] text-slate-500 w-7 text-right flex-shrink-0">
          {muted ? '0' : volume}%
        </span>
      </div>

      {/* Quick play shortcuts */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { emoji: '▶️', label: 'YouTube', cmd: 'play on youtube' },
          { emoji: '🎵', label: 'Spotify', cmd: 'play on spotify' },
        ].map(({ emoji, label, cmd }) => (
          <button
            key={label}
            onClick={() => onCommand(cmd)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-300 text-[10px] transition-all justify-center"
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
