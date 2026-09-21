import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';

interface AchievementToastProps {
  title: string;
  description: string;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  title,
  description,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      id="achievement-toast"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none transition-all duration-300 transform animate-bounce"
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-xl shrink-0">
          <Trophy className="w-5 h-5 text-purple-300 animate-pulse" />
        </div>
        <div>
          <div className="text-[10px] font-black text-purple-300 tracking-widest uppercase">
            ACHIEVEMENT UNLOCKED!
          </div>
          <div className="text-sm font-extrabold text-white font-['Chakra_Petch']">
            {title}
          </div>
          <div className="text-[11px] text-slate-300 leading-none mt-0.5">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};
