import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  BookOpen,
  FileText,
  Activity,
  Lock,
  Sparkles,
  ChevronRight,
  Shield,
  AlertOctagon,
  Eye,
  Brain,
  Zap,
} from 'lucide-react';
import { i18n } from '../services/i18n';
import { storage } from '../services/storage';
import { STORY_CHAPTERS, STORY_FRAGMENTS } from '../data/storyData';
import { StoryChapter, StoryFragment } from '../types';

interface StoryJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryJournalModal: React.FC<StoryJournalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'fragments' | 'factors'>('chapters');
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter>(STORY_CHAPTERS[0]);
  const [selectedFragment, setSelectedFragment] = useState<StoryFragment | null>(null);

  const lang = i18n.getLanguage();

  if (!isOpen) return null;

  const storyState = storage.getStoryState();
  const unlockedChapters = storyState.unlockedChapters;
  const unlockedFragments = storyState.unlockedFragments;

  return (
    <div
      id="modal-story-journal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
                {lang === 'id' ? 'JURNAL KISAH & MEMORI' : 'STORY JOURNAL & LOGS'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'id'
                  ? 'Rekonstruksi identitas dan fenomena koridor dari fragmen yang terselamatkan.'
                  : 'Reconstruct your identity and corridor anomalies from retrieved fragments.'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-journal-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-950">
          <button
            id="tab-journal-chapters"
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-mono tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'chapters'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'BAB KISAH' : 'CHAPTERS'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {unlockedChapters.length} / {STORY_CHAPTERS.length}
            </span>
          </button>

          <button
            id="tab-journal-fragments"
            onClick={() => setActiveTab('fragments')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-mono tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'fragments'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'FRAGMEN MEMORI' : 'MEMORY FRAGMENTS'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {unlockedFragments.length} / {STORY_FRAGMENTS.length}
            </span>
          </button>

          <button
            id="tab-journal-factors"
            onClick={() => setActiveTab('factors')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-mono tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'factors'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'STATUS PSIKOLOGIS' : 'PSYCH STATUS'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. Chapters View */}
          {activeTab === 'chapters' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Chapter List */}
              <div className="space-y-2 md:col-span-1 border-r border-slate-800/80 pr-4">
                {STORY_CHAPTERS.map((ch) => {
                  const isUnlocked = unlockedChapters.includes(ch.id);
                  const isSelected = selectedChapter.id === ch.id;

                  return (
                    <button
                      key={ch.id}
                      id={`btn-chapter-${ch.id}`}
                      onClick={() => isUnlocked && setSelectedChapter(ch)}
                      disabled={!isUnlocked}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : isUnlocked
                          ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                          : 'bg-slate-950/30 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isUnlocked ? (
                          <div className="w-7 h-7 rounded-lg bg-cyan-900/40 border border-cyan-500/30 flex items-center justify-center text-xs font-mono text-cyan-400">
                            {ch.number}
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                        <div>
                          <p className="text-xs font-mono text-slate-400">
                            BAB {ch.number}
                          </p>
                          <p className="text-sm font-bold font-sans line-clamp-1">
                            {isUnlocked
                              ? lang === 'id'
                                ? ch.title.id
                                : ch.title.en
                              : '???'}
                          </p>
                        </div>
                      </div>
                      {isUnlocked && <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Chapter Reader */}
              <div className="md:col-span-2 flex flex-col justify-between p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono px-3 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                      CHAPTER {selectedChapter.number}
                    </span>
                    <span className="text-xs font-mono text-slate-500">DON'T BLINK RECORDS</span>
                  </div>

                  <h3 className="text-2xl font-bold font-mono text-slate-100 mb-2">
                    {lang === 'id' ? selectedChapter.title.id : selectedChapter.title.en}
                  </h3>

                  <p className="text-xs font-mono text-cyan-300/80 mb-6 italic">
                    "{lang === 'id' ? selectedChapter.teaser.id : selectedChapter.teaser.en}"
                  </p>

                  <div className="prose prose-invert max-w-none text-slate-300 text-sm font-sans leading-relaxed whitespace-pre-line border-t border-slate-800 pt-4">
                    {lang === 'id'
                      ? (selectedChapter.content?.id || selectedChapter.synopsis.id)
                      : (selectedChapter.content?.en || selectedChapter.synopsis.en)}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>STATUS: DITERJEMAHKAN</span>
                  <span>SUBJEK: LARI TANPA HENTI</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Fragments View */}
          {activeTab === 'fragments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {STORY_FRAGMENTS.map((frag) => {
                  const isUnlocked = unlockedFragments.includes(frag.id);
                  const isSelected = selectedFragment?.id === frag.id;

                  return (
                    <button
                      key={frag.id}
                      id={`btn-fragment-${frag.id}`}
                      onClick={() => isUnlocked && setSelectedFragment(frag)}
                      disabled={!isUnlocked}
                      className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-28 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md'
                          : isUnlocked
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-750 text-slate-200'
                          : 'bg-slate-950/30 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono text-cyan-400">
                          #{frag.number < 10 ? `0${frag.number}` : frag.number}
                        </span>
                        {isUnlocked ? (
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      <p className="text-xs font-bold font-mono line-clamp-2">
                        {isUnlocked
                          ? lang === 'id'
                            ? frag.title.id
                            : frag.title.en
                          : 'FRAGMEN HILANG'}
                      </p>

                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-slate-400 w-fit">
                        {frag.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Fragment Modal Preview */}
              {selectedFragment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 mt-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-cyan-400">
                      FRAGMEN MEMORI #{selectedFragment.number} — {selectedFragment.category}
                    </span>
                    <button
                      onClick={() => setSelectedFragment(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      {lang === 'id' ? 'Tutup Pratinjau' : 'Close Preview'}
                    </button>
                  </div>
                  <h4 className="text-lg font-bold font-mono text-slate-100 mb-2">
                    {lang === 'id' ? selectedFragment.title.id : selectedFragment.title.en}
                  </h4>
                  <p className="text-sm text-slate-300 font-mono leading-relaxed bg-black/40 p-4 rounded-xl border border-cyan-900/40">
                    "{lang === 'id' ? selectedFragment.excerpt.id : selectedFragment.excerpt.en}"
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* 3. Psychological Factors View */}
          {activeTab === 'factors' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Faktor-faktor ini dipengaruhi secara real-time oleh setiap aksi dalam koridor: keberanian melompati rintangan pada saat genting, ketakutan saat menoleh ke belakang, dan fragmen memori yang dipulihkan.'
                  : 'These psychological factors are influenced in real-time by your actions: courage from near-miss dodges, fear from looking back, and restored memory fragments.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Courage */}
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-mono text-cyan-400">
                      <Shield className="w-4 h-4" />
                      {lang === 'id' ? 'KEBERANIAN' : 'COURAGE'}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-100">
                      {Math.round(storyState.courage)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${Math.min(100, storyState.courage)}%` }}
                    />
                  </div>
                </div>

                {/* Fear */}
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-mono text-rose-400">
                      <AlertOctagon className="w-4 h-4" />
                      {lang === 'id' ? 'KETAKUTAN' : 'FEAR'}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-100">
                      {Math.round(storyState.fear)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${Math.min(100, storyState.fear)}%` }}
                    />
                  </div>
                </div>

                {/* Memory */}
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-mono text-indigo-400">
                      <Brain className="w-4 h-4" />
                      {lang === 'id' ? 'INGATAN' : 'MEMORY'}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-100">
                      {Math.round(storyState.memory)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${Math.min(100, storyState.memory)}%` }}
                    />
                  </div>
                </div>

                {/* Corruption */}
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-mono text-purple-400">
                      <Zap className="w-4 h-4" />
                      {lang === 'id' ? 'DISTORSI / KORUPSI' : 'CORRUPTION'}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-100">
                      {Math.round(storyState.corruption)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${Math.min(100, storyState.corruption)}%` }}
                    />
                  </div>
                </div>

                {/* Awareness */}
                <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-mono text-amber-400">
                      <Eye className="w-4 h-4" />
                      {lang === 'id' ? 'KESADARAN HAKIKAT' : 'AWARENESS'}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-100">
                      {Math.round(storyState.awareness)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${Math.min(100, storyState.awareness)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
