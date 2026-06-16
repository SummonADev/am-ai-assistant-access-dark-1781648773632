import { useEffect, useState } from 'react';
import { Brain, Zap, Heart, Star } from 'lucide-react';
import { getInternalState, getMoodEmoji, getMoodColor, ARIAInternalState } from '@/lib/ariaPersonality';

export default function ARIAMindPanel() {
  const [mindState, setMindState] = useState<ARIAInternalState>(getInternalState());

  // Refresh every 2s to reflect real-time mood changes
  useEffect(() => {
    const interval = setInterval(() => {
      setMindState(getInternalState());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const moodGradient = getMoodColor(mindState.mood);
  const moodEmoji = getMoodEmoji(mindState.mood);

  return (
    <div className="w-full rounded-xl bg-white/3 border border-white/8 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Brain size={13} className="text-violet-400" />
        <span className="text-xs font-semibold text-slate-300">ARIA's Mind</span>
        <span className="ml-auto text-base">{moodEmoji}</span>
      </div>

      {/* Mood */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Current mood</span>
          <span className={`text-[10px] font-semibold bg-gradient-to-r ${moodGradient} bg-clip-text text-transparent capitalize`}>
            {mindState.mood}
          </span>
        </div>
      </div>

      {/* Energy level */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Zap size={9} className="text-yellow-400" />
            <span className="text-[10px] text-slate-500">Energy</span>
          </div>
          <span className="text-[10px] text-yellow-400">{Math.round(mindState.energyLevel * 100)}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full transition-all duration-1000"
            style={{ width: `${mindState.energyLevel * 100}%` }}
          />
        </div>
      </div>

      {/* Curiosity level */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={9} className="text-violet-400" />
            <span className="text-[10px] text-slate-500">Curiosity</span>
          </div>
          <span className="text-[10px] text-violet-400">{Math.round(mindState.curiosityLevel * 100)}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-1000"
            style={{ width: `${mindState.curiosityLevel * 100}%` }}
          />
        </div>
      </div>

      {/* Interaction count */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1">
          <Heart size={9} className="text-pink-400" />
          <span className="text-[10px] text-slate-500">Interactions</span>
        </div>
        <span className="text-[10px] text-pink-400 font-medium">{mindState.interactionCount}</span>
      </div>
    </div>
  );
}
