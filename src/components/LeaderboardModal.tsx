import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  Globe,
  Award,
  Clock,
  Flame,
  Coins,
  RefreshCw,
  User,
  Check,
  Edit2,
  Wifi,
  WifiOff,
  Navigation,
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import {
  leaderboardService,
  OnlineLeaderboardEntry,
  getPlayerIdentity,
  isCurrentPlayer,
} from '../services/leaderboard';
import { sound } from '../services/audio';
import { i18n } from '../services/i18n';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const lang = i18n.getLanguage();
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'LOCAL'>('GLOBAL');
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([]);
  const [globalEntries, setGlobalEntries] = useState<OnlineLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [identity, setIdentity] = useState(getPlayerIdentity());
  const [playerName, setPlayerName] = useState(identity.displayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(identity.displayName);
  const isOnline = leaderboardService.isOnline();

  const loadScores = useCallback(async () => {
    setIsLoading(true);
    try {
      const [local, global] = await Promise.all([
        leaderboardService.getTopScores(50),
        leaderboardService.getGlobalTopScores(100),
      ]);
      setLocalEntries(local);
      setGlobalEntries(global);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const clean = leaderboardService.setPlayerName(tempName);
    const updated = getPlayerIdentity();
    setIdentity(updated);
    setPlayerName(clean);
    setTempName(clean);
    setIsEditingName(false);
  };

  return (
    <div
      id="leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none"
    >
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase font-['Chakra_Petch'] tracking-wider flex items-center gap-2">
                <span>{lang === 'id' ? 'PAPAN PERINGKAT' : 'LEADERBOARD'}</span>
                {isOnline ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-slate-500" />
                    LOCAL
                  </span>
                )}
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider block">
                {lang === 'id' ? 'REKOR GLOBAL & PERSONAL' : 'GLOBAL & LOCAL HALL OF FAME'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-leaderboard"
              type="button"
              onClick={() => {
                sound.playClick();
                loadScores();
              }}
              disabled={isLoading}
              title="Refresh"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              id="btn-close-leaderboard"
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Name Profile Bar */}
        <div className="my-3 px-3 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={tempName}
                maxLength={20}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Callsign (1-20 chars)"
                className="flex-1 bg-slate-900 border border-cyan-500/50 rounded-xl px-3 py-1 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Simpan' : 'Save'}</span>
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">{lang === 'id' ? 'Nama Pelari:' : 'Callsign:'}</span>
                <span className="text-white font-bold tracking-wide">{playerName}</span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 tracking-wider"
                  title={`Player ID: ${identity.playerId}`}
                >
                  {identity.isAuthenticated ? 'AUTH' : 'ID'} #{identity.playerId.slice(-4)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTempName(playerName);
                  setIsEditingName(true);
                }}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 shrink-0"
              >
                <Edit2 className="w-3 h-3" />
                <span>{lang === 'id' ? 'Ubah' : 'Change'}</span>
              </button>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('GLOBAL');
            }}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'GLOBAL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'GLOBAL ONLINE' : 'GLOBAL LEADERBOARD'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('LOCAL');
            }}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'LOCAL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'REKOR PRIBADI' : 'PERSONAL BESTS'}</span>
          </button>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto pr-1 space-y-2 flex-1 max-h-[54vh]">
          {activeTab === 'GLOBAL' ? (
            globalEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
                <Wifi className="w-8 h-8 text-slate-600 mx-auto" />
                <p>
                  {isOnline
                    ? lang === 'id'
                      ? 'Belum ada rekor online. Jadilah yang pertama mencapai puncak!'
                      : 'No online records yet. Be the first to reach the summit!'
                    : lang === 'id'
                    ? 'Menghubungkan ke server global... Cek tab Rekor Pribadi untuk riwayat offline.'
                    : 'Awaiting online configuration. Switch to Personal Bests for local history.'}
                </p>
              </div>
            ) : (
              globalEntries.map((entry, idx) => {
                const rank = idx + 1;
                // STUBBORN IDENTITY RULE: Player ID is the only identifier, NEVER match solely on display_name.
                // Legacy entries without player_id are unowned/legacy records.
                const isCurrentPlayerRecord = entry.player_id
                  ? isCurrentPlayer(entry.player_id)
                  : false;

                return (
                  <div
                    key={entry.id || `global-${idx}`}
                    id={`global-record-${rank}`}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      rank === 1
                        ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-500/50 shadow-md'
                        : isCurrentPlayerRecord
                        ? 'bg-cyan-950/40 border-cyan-500/50'
                        : 'bg-slate-950/60 border-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm font-['Chakra_Petch'] shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm sm:text-base font-extrabold font-['Chakra_Petch'] tracking-wide ${
                              isCurrentPlayerRecord ? 'text-cyan-300' : 'text-white'
                            }`}
                          >
                            {entry.display_name || 'Anonymous Runner'}
                          </span>
                          {isCurrentPlayerRecord && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono">
                          {entry.distance !== undefined && entry.distance > 0 ? (
                            <>
                              <span className="flex items-center gap-0.5 text-cyan-400">
                                <Navigation className="w-2.5 h-2.5" /> {entry.distance}m
                              </span>
                              <span>•</span>
                            </>
                          ) : null}
                          {entry.created_at ? (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-2.5 h-2.5 text-slate-500" />
                              {new Date(entry.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {lang === 'id' ? 'Rekor Resmi' : 'Verified Record'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-sm sm:text-base font-black font-['Chakra_Petch'] text-amber-400">
                        {entry.score.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        {lang === 'id' ? 'POIN' : 'PTS'}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : localEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
              <Award className="w-8 h-8 text-slate-600 mx-auto" />
              <p>
                {lang === 'id'
                  ? 'Belum ada rekaman lokal. Mulai pelarian untuk mencetak skor!'
                  : 'No local runs recorded yet. Start running to set your record!'}
              </p>
            </div>
          ) : (
            localEntries.map((entry, idx) => {
              const rank = idx + 1;
              const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={entry.id}
                  id={`local-record-${rank}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    rank === 1
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm font-['Chakra_Petch'] shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div className="text-sm sm:text-base font-extrabold text-white font-['Chakra_Petch']">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-0.5 text-cyan-400">
                          <Flame className="w-2.5 h-2.5" /> x{entry.combo}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-500" /> {Math.round(entry.durationSeconds)}s
                        </span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 font-mono">
                    <Coins className="w-3 h-3" />
                    <span>+{entry.coinsEarned}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
