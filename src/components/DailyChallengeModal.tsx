import React from 'react';
import { X, Calendar, CheckCircle2, Gift, Coins } from 'lucide-react';
import { DailyChallenge } from '../types';
import { sound } from '../services/audio';

interface DailyChallengeModalProps {
  challenge: DailyChallenge;
  onClaimReward: (reward: number) => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  challenge,
  onClaimReward,
  onClose,
}) => {
  const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.targetValue) * 100));

  return (
    <div id="daily-challenge-modal" className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md z-30 select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white uppercase font-['Chakra_Petch'] tracking-wider">
              DAILY CHALLENGE
            </h2>
          </div>

          <button
            id="btn-close-daily"
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Body */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90">
                TODAY'S MISSION
              </span>
              <h3 className="text-lg font-black text-white font-['Chakra_Petch'] tracking-wide">
                {challenge.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
              <Coins className="w-3.5 h-3.5" />
              <span>+{challenge.rewardCoins}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {challenge.description}
          </p>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-['Chakra_Petch']">
                {Math.min(challenge.progress, challenge.targetValue).toLocaleString()} / {challenge.targetValue.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {challenge.claimed ? (
          <div className="py-3 px-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>REWARD CLAIMED! CHECK BACK TOMORROW</span>
          </div>
        ) : challenge.completed ? (
          <button
            id="btn-claim-daily-reward"
            type="button"
            onClick={() => {
              sound.playAchievement();
              onClaimReward(challenge.rewardCoins);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base tracking-wider uppercase font-['Chakra_Petch'] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-5 h-5" />
            <span>CLAIM +{challenge.rewardCoins} ORBS</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wide transition-colors"
          >
            PLAY RUN TO PROGRESS
          </button>
        )}

        <span className="text-[11px] text-slate-500 text-center mt-3">
          Resets automatically every 24 hours at midnight.
        </span>
      </div>
    </div>
  );
};
