import React, { useRef, useEffect, useState } from 'react';
import {
  X,
  Lock,
  Check,
  Sparkles,
  Coins,
  Shield,
  BookOpen,
  Gift,
  RotateCcw,
  Zap,
  ShoppingBag,
  User,
  Ghost,
  Disc,
  Terminal,
  Sliders,
  Wrench,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SkinId, EntitySkinId, OrbCosmeticId } from '../types';
import {
  PLAYER_SKINS,
  ENTITY_SKINS,
  ORB_COSMETICS,
  BUNDLES,
  STORE_PRODUCTS,
  BundleDefinition,
} from '../data/cosmeticsData';
import { renderCharacter } from '../game/characterRenderer';
import { renderConsistentEntity } from '../game/entityVisuals';
import { renderOrbArtefact } from '../game/orbRenderer';
import { sound } from '../services/audio';
import { purchases } from '../services/purchase';

type ShopTab = 'PLAYERS' | 'ENTITIES' | 'ORBS' | 'BUNDLES' | 'SPECIALS';

interface CustomizeModalProps {
  currentSkin: SkinId;
  currentEntitySkin: EntitySkinId;
  currentOrbCosmetic: OrbCosmeticId;
  unlockedSkins: SkinId[];
  unlockedEntitySkins: EntitySkinId[];
  unlockedOrbCosmetics: OrbCosmeticId[];
  purchasedBundles: string[];
  adsRemoved: boolean;
  fullStoryUnlocked: boolean;
  supporterPackUnlocked: boolean;
  totalCoins: number;
  onSelectSkin: (id: SkinId) => void;
  onSelectEntitySkin: (id: EntitySkinId) => void;
  onSelectOrbCosmetic: (id: OrbCosmeticId) => void;
  onBuySkinWithOrbs: (id: SkinId, cost: number) => void;
  onBuyEntitySkinWithOrbs: (id: EntitySkinId, cost: number) => void;
  onPurchaseSuccess: () => void;
  onClose: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  currentSkin,
  currentEntitySkin,
  currentOrbCosmetic,
  unlockedSkins,
  unlockedEntitySkins,
  unlockedOrbCosmetics,
  purchasedBundles,
  adsRemoved,
  fullStoryUnlocked,
  supporterPackUnlocked,
  totalCoins,
  onSelectSkin,
  onSelectEntitySkin,
  onSelectOrbCosmetic,
  onBuySkinWithOrbs,
  onBuyEntitySkinWithOrbs,
  onPurchaseSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('PLAYERS');
  const [previewPlayerSkin, setPreviewPlayerSkin] = useState<SkinId>(currentSkin);
  const [previewEntitySkin, setPreviewEntitySkin] = useState<EntitySkinId>(currentEntitySkin);
  const [previewOrb, setPreviewOrb] = useState<OrbCosmeticId>(currentOrbCosmetic);
  const [previewBundle, setPreviewBundle] = useState<BundleDefinition | null>(BUNDLES[0] || null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Developer / Admin QA Mode
  const [qaModeActive, setQaModeActive] = useState(false);
  const [qaUnlockAll, setQaUnlockAll] = useState(false);
  const [qaForceEncrypted, setQaForceEncrypted] = useState(false);
  const [qaBonusCoins, setQaBonusCoins] = useState(0);
  const [headerClickCount, setHeaderClickCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Effective State (Supports QA Overrides)
  const effectiveCoins = totalCoins + qaBonusCoins;
  const effectiveUnlockedSkins = qaUnlockAll ? PLAYER_SKINS.map((s) => s.id as SkinId) : unlockedSkins;
  const effectiveUnlockedEntitySkins = qaUnlockAll ? ENTITY_SKINS.map((e) => e.id as EntitySkinId) : unlockedEntitySkins;
  const effectiveUnlockedOrbCosmetics = qaUnlockAll ? ORB_COSMETICS.map((o) => o.id as OrbCosmeticId) : unlockedOrbCosmetics;
  const effectivePurchasedBundles = qaUnlockAll ? BUNDLES.map((b) => b.id) : purchasedBundles;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Preview Loop on Canvas
  useEffect(() => {
    let animId: number;
    let clock = 0;

    const render = () => {
      clock += 0.025;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeTab === 'PLAYERS') {
        // Pedestal glow & platform line
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.beginPath();
        ctx.ellipse(110, 115, 60, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, 115);
        ctx.lineTo(190, 115);
        ctx.stroke();

        const pSkin = PLAYER_SKINS.find((s) => s.id === previewPlayerSkin);
        const isEncrypted = qaForceEncrypted || (!effectiveUnlockedSkins.includes(previewPlayerSkin) && pSkin?.allowPreviewWhenLocked === false);
        renderCharacter(ctx, 110, 90, 'run', previewPlayerSkin, clock, 1.5, isEncrypted);
      } else if (activeTab === 'ENTITIES') {
        // Ground shadow & dark pedestal
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.ellipse(110, 120, 50, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        const eSkin = ENTITY_SKINS.find((e) => e.id === previewEntitySkin);
        const isEncrypted = qaForceEncrypted || (!effectiveUnlockedEntitySkins.includes(previewEntitySkin) && eSkin?.allowPreviewWhenLocked === false);
        renderConsistentEntity(ctx, 110, 120, {
          stance: 'STALKING',
          animClock: clock,
          scale: 0.72,
          entitySkinId: previewEntitySkin,
          isEncrypted,
        });
      } else if (activeTab === 'ORBS') {
        // Radial artefact ring
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(110, 75, 45, 0, Math.PI * 2);
        ctx.stroke();

        renderOrbArtefact(ctx, 110, 75, previewOrb, clock, 1.6);
      } else if (activeTab === 'BUNDLES' && previewBundle) {
        // Multi-element bundle showcase stage
        ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
        ctx.beginPath();
        ctx.ellipse(110, 118, 90, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(15, 120);
        ctx.lineTo(205, 120);
        ctx.stroke();

        const pItem = previewBundle.itemIds.find((i) => i.type === 'player');
        if (pItem) {
          const skin = PLAYER_SKINS.find((s) => s.id === pItem.id);
          const isEnc = qaForceEncrypted || (!effectiveUnlockedSkins.includes(pItem.id as SkinId) && skin?.allowPreviewWhenLocked === false);
          renderCharacter(ctx, 65, 95, 'idle', pItem.id as SkinId, clock, 1.2, isEnc);
        }

        const eItem = previewBundle.itemIds.find((i) => i.type === 'entity');
        if (eItem) {
          const ent = ENTITY_SKINS.find((e) => e.id === eItem.id);
          const isEnc = qaForceEncrypted || (!effectiveUnlockedEntitySkins.includes(eItem.id as EntitySkinId) && ent?.allowPreviewWhenLocked === false);
          renderConsistentEntity(ctx, 155, 120, {
            stance: 'STANDING',
            animClock: clock,
            scale: 0.55,
            entitySkinId: eItem.id as EntitySkinId,
            isEncrypted: isEnc,
          });
        }

        const oItem = previewBundle.itemIds.find((i) => i.type === 'orb');
        if (oItem) {
          renderOrbArtefact(ctx, 110, 36, oItem.id as OrbCosmeticId, clock, 0.95);
        }
      } else {
        // SPECIALS icon glow
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(110, 70, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    activeTab,
    previewPlayerSkin,
    previewEntitySkin,
    previewOrb,
    previewBundle,
    effectiveUnlockedSkins,
    effectiveUnlockedEntitySkins,
    qaForceEncrypted,
  ]);

  // Handle Real-Money Simulation Purchase via DummyPurchaseService
  const handlePurchase = async (productId: string) => {
    setIsPurchasing(true);
    sound.playClick();

    const res = await purchases.purchase(productId);
    setIsPurchasing(false);

    if (res.success) {
      sound.playAchievement();
      showToast(res.message);
      onPurchaseSuccess();
    } else {
      showToast(res.message || 'Purchase could not be completed.');
    }
  };

  // Restore purchases
  const handleRestore = async () => {
    setIsPurchasing(true);
    sound.playClick();
    const res = await purchases.restorePurchases();
    setIsPurchasing(false);
    showToast(res.message);
    if (res.count > 0) {
      onPurchaseSuccess();
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'ULTRA':
      case 'LEGENDARY':
        return 'bg-amber-950/60 border-amber-500/50 text-amber-300';
      case 'EPIC':
        return 'bg-purple-950/60 border-purple-500/50 text-purple-300';
      case 'RARE':
        return 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  return (
    <div
      id="customize-modal"
      className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md z-40 select-none animate-fadeIn"
    >
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h2
              onClick={() => {
                const next = headerClickCount + 1;
                setHeaderClickCount(next);
                if (next >= 3) {
                  setQaModeActive(!qaModeActive);
                  setHeaderClickCount(0);
                  showToast(!qaModeActive ? 'QA MODE ACTIVATED' : 'QA MODE DEACTIVATED');
                }
              }}
              className="text-lg sm:text-xl font-black text-white uppercase font-['Chakra_Petch'] tracking-wider cursor-pointer select-none title='Click 3 times for Dev QA Mode'"
            >
              DON’T BLINK STORE & LOCKER
            </h2>
            <button
              id="btn-qa-toggle"
              type="button"
              onClick={() => {
                setQaModeActive(!qaModeActive);
                showToast(!qaModeActive ? 'DEV QA MODE ENABLED' : 'DEV QA MODE CLOSED');
              }}
              title="Toggle Developer QA Mode"
              className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 border cursor-pointer transition-all ${
                qaModeActive
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-2.5 h-2.5" />
              <span>QA</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-amber-500/40 text-amber-400">
              <Coins className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-black font-['Chakra_Petch']">
                {effectiveCoins.toLocaleString()}
              </span>
            </div>

            <button
              id="btn-close-store"
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DEVELOPER / ADMIN QA PANEL */}
        {qaModeActive && (
          <div className="my-2 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs shrink-0 animate-fadeIn space-y-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
              <div className="flex items-center gap-1.5 font-black font-mono tracking-wider text-[11px] text-amber-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>DEV / ADMIN QA HARNESS [ACTIVE]</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-amber-300/70 font-mono">
                  {qaUnlockAll ? 'ALL UNLOCKED (TEST)' : 'PLAYER STATE'}
                </span>
                <button
                  type="button"
                  onClick={() => setQaModeActive(false)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-amber-900/60 hover:bg-amber-800 text-amber-200 cursor-pointer"
                >
                  HIDE QA
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {/* Unlock All Override */}
              <button
                id="qa-btn-unlock-all"
                type="button"
                onClick={() => {
                  setQaUnlockAll(!qaUnlockAll);
                  showToast(!qaUnlockAll ? 'QA: Unlocked all skins & bundles for testing' : 'QA: Restored actual player unlocks');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
                  qaUnlockAll
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>{qaUnlockAll ? 'UNLOCK ALL: ON' : 'UNLOCK ALL: OFF'}</span>
              </button>

              {/* Force Encrypted Silhouette Override */}
              <button
                id="qa-btn-force-censor"
                type="button"
                onClick={() => {
                  setQaForceEncrypted(!qaForceEncrypted);
                  showToast(!qaForceEncrypted ? 'QA: Force encrypted silhouette preview ENABLED' : 'QA: Encrypted silhouettes disabled');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
                  qaForceEncrypted
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {qaForceEncrypted ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{qaForceEncrypted ? 'FORCE CENSOR: ON' : 'FORCE CENSOR: OFF'}</span>
              </button>

              {/* Add 10k Test Orbs */}
              <button
                id="qa-btn-add-coins"
                type="button"
                onClick={() => {
                  setQaBonusCoins((prev) => prev + 10000);
                  showToast('QA: Added 10,000 Test Orbs');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Coins className="w-3 h-3" />
                <span>+10K ORBS</span>
              </button>

              {/* Reset Test State */}
              <button
                id="qa-btn-reset"
                type="button"
                onClick={() => {
                  setQaUnlockAll(false);
                  setQaForceEncrypted(false);
                  setQaBonusCoins(0);
                  showToast('QA: Reset overrides to default player state');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold font-mono text-[10px] flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET QA</span>
              </button>

              {/* Rapid Jump Dropdowns */}
              <select
                aria-label="QA Quick Select Runner"
                value={previewPlayerSkin}
                onChange={(e) => {
                  setActiveTab('PLAYERS');
                  setPreviewPlayerSkin(e.target.value as SkinId);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-lg px-2 py-1 font-mono cursor-pointer"
              >
                <option value="" disabled>Jump to Runner...</option>
                {PLAYER_SKINS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rarity})
                  </option>
                ))}
              </select>

              <select
                aria-label="QA Quick Select Entity"
                value={previewEntitySkin}
                onChange={(e) => {
                  setActiveTab('ENTITIES');
                  setPreviewEntitySkin(e.target.value as EntitySkinId);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-lg px-2 py-1 font-mono cursor-pointer"
              >
                <option value="" disabled>Jump to Entity...</option>
                {ENTITY_SKINS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.rarity})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 my-3 overflow-x-auto pb-1 shrink-0 scrollbar-none border-b border-slate-800/60">
          <button
            id="tab-players"
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('PLAYERS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-['Chakra_Petch'] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'PLAYERS'
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>RUNNERS (24)</span>
          </button>

          <button
            id="tab-entities"
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('ENTITIES');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-['Chakra_Petch'] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ENTITIES'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Ghost className="w-3.5 h-3.5" />
            <span>ENTITIES (16)</span>
          </button>

          <button
            id="tab-orbs"
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('ORBS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-['Chakra_Petch'] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ORBS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>ARTEFACTS (8)</span>
          </button>

          <button
            id="tab-bundles"
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('BUNDLES');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-['Chakra_Petch'] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'BUNDLES'
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>BUNDLES (10)</span>
          </button>

          <button
            id="tab-specials"
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('SPECIALS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-['Chakra_Petch'] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'SPECIALS'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>PASSES & NO-ADS</span>
          </button>
        </div>

        {/* Transient Notification / Toast */}
        {notification && (
          <div className="w-full py-2 px-3 mb-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs text-center font-mono animate-fadeIn shrink-0">
            {notification}
          </div>
        )}

        {/* Content Area with Split Layout on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto flex-1 pr-1">
          {/* Left Column: Live Canvas Preview & Detail */}
          <div className="md:col-span-5 flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
            {/* Live Canvas Preview & Status Overlay Badge */}
            <div className="relative flex items-center justify-center bg-slate-900/60 rounded-xl p-2 border border-slate-800/80 w-full mb-2">
              <canvas
                ref={canvasRef}
                width={220}
                height={140}
                className="w-[220px] h-[140px] drop-shadow-lg"
              />
              {/* Dynamic Status / Locked Badge Overlay */}
              {activeTab === 'PLAYERS' && !effectiveUnlockedSkins.includes(previewPlayerSkin) && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/85 border border-amber-500/50 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                  <Lock className="w-3 h-3" />
                  <span>
                    {PLAYER_SKINS.find((s) => s.id === previewPlayerSkin)?.category === 'PREMIUM'
                      ? 'PREMIUM'
                      : PLAYER_SKINS.find((s) => s.id === previewPlayerSkin)?.category === 'COIN'
                      ? 'ORBS REQUIRED'
                      : 'ACHIEVEMENT LOCKED'}
                  </span>
                </div>
              )}
              {activeTab === 'ENTITIES' && !effectiveUnlockedEntitySkins.includes(previewEntitySkin) && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/85 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                  <Lock className="w-3 h-3" />
                  <span>
                    {ENTITY_SKINS.find((e) => e.id === previewEntitySkin)?.category === 'PREMIUM'
                      ? 'PREMIUM'
                      : ENTITY_SKINS.find((e) => e.id === previewEntitySkin)?.category === 'COIN'
                      ? 'ORBS REQUIRED'
                      : 'LOCKED ENTITY'}
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic Card Details based on active tab */}
            {activeTab === 'PLAYERS' && (() => {
              const item = PLAYER_SKINS.find((s) => s.id === previewPlayerSkin) || PLAYER_SKINS[0];
              const itemId = item.id as SkinId;
              const unlocked = effectiveUnlockedSkins.includes(itemId);
              const isEquipped = currentSkin === itemId;
              const cost = item.costCoins || 0;

              return (
                <div className="text-center w-full flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadgeColor(item.rarity)}`}>
                      {item.rarity} • {item.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      unlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {unlocked ? (isEquipped ? 'EQUIPPED' : 'OWNED') : 'LOCKED'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white font-['Chakra_Petch'] uppercase tracking-wide">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                    {item.description}
                  </p>

                  <p className="text-[11px] text-slate-400 italic mt-1 max-w-xs border-l-2 border-slate-700 pl-2 text-left">
                    "{item.lore}"
                  </p>

                  {/* DESIGN FEATURES BREAKDOWN */}
                  {item.designFeatures && (
                    <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-[11px] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 pb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>DESIGN SPECIFICATIONS</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">SILHOUETTE</span>
                        {item.designFeatures.silhouette}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">MATERIAL</span>
                        {item.designFeatures.material}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">KEY APPAREL / ACCESSORY</span>
                        {item.designFeatures.uniqueFeature}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">VFX / MOTION TRAIL</span>
                        {item.designFeatures.vfx}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 w-full">
                    {unlocked ? (
                      <button
                        id="btn-equip-player-skin"
                        type="button"
                        disabled={isEquipped}
                        onClick={() => {
                          sound.playClick();
                          onSelectSkin(itemId);
                          showToast(`${item.name} equipped!`);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] flex items-center justify-center gap-2 transition-all ${
                          isEquipped
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md cursor-pointer'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>CURRENTLY EQUIPPED</span>
                          </>
                        ) : (
                          <span>EQUIP RUNNER</span>
                        )}
                      </button>
                    ) : item.category === 'COIN' ? (
                      <button
                        id="btn-buy-player-orbs"
                        type="button"
                        disabled={effectiveCoins < cost}
                        onClick={() => onBuySkinWithOrbs(itemId, cost)}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] flex items-center justify-center gap-2 ${
                          effectiveCoins >= cost
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 cursor-pointer shadow-lg'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>UNLOCK FOR {cost.toLocaleString()} ORBS</span>
                      </button>
                    ) : item.category === 'PREMIUM' ? (
                      <button
                        id="btn-buy-player-money"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(item.id)}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>PURCHASE ({item.priceDisplay})</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px] text-center font-mono">
                        {item.unlockRequirement?.text || 'Complete in-game objective to unlock'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'ENTITIES' && (() => {
              const item = ENTITY_SKINS.find((e) => e.id === previewEntitySkin) || ENTITY_SKINS[0];
              const itemId = item.id as EntitySkinId;
              const unlocked = effectiveUnlockedEntitySkins.includes(itemId);
              const isEquipped = currentEntitySkin === itemId;
              const cost = item.costCoins || 0;

              return (
                <div className="text-center w-full flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadgeColor(item.rarity)}`}>
                      {item.rarity} • {item.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      unlocked ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {unlocked ? (isEquipped ? 'EQUIPPED' : 'OWNED') : 'LOCKED'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white font-['Chakra_Petch'] uppercase tracking-wide">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                    {item.description}
                  </p>

                  <p className="text-[11px] text-slate-400 italic mt-1 max-w-xs border-l-2 border-slate-700 pl-2 text-left">
                    "{item.lore}"
                  </p>

                  {/* DESIGN FEATURES BREAKDOWN */}
                  {item.designFeatures && (
                    <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-[11px] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 pb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>ENTITY ARCHITECTURE</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">SILHOUETTE</span>
                        {item.designFeatures.silhouette}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">MATERIAL / CHITIN</span>
                        {item.designFeatures.material}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">SIGNATURE ANATOMY</span>
                        {item.designFeatures.uniqueFeature}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[10px] block">OCULAR & AURA VFX</span>
                        {item.designFeatures.vfx}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 w-full">
                    {unlocked ? (
                      <button
                        id="btn-equip-entity-skin"
                        type="button"
                        disabled={isEquipped}
                        onClick={() => {
                          sound.playClick();
                          onSelectEntitySkin(itemId);
                          showToast(`${item.name} equipped!`);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] flex items-center justify-center gap-2 transition-all ${
                          isEquipped
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 cursor-default'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>CURRENTLY EQUIPPED</span>
                          </>
                        ) : (
                          <span>EQUIP ENTITY</span>
                        )}
                      </button>
                    ) : item.category === 'COIN' ? (
                      <button
                        id="btn-buy-entity-orbs"
                        type="button"
                        disabled={effectiveCoins < cost}
                        onClick={() => onBuyEntitySkinWithOrbs(itemId, cost)}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] flex items-center justify-center gap-2 ${
                          effectiveCoins >= cost
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 cursor-pointer shadow-lg'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>UNLOCK FOR {cost.toLocaleString()} ORBS</span>
                      </button>
                    ) : item.category === 'PREMIUM' ? (
                      <button
                        id="btn-buy-entity-money"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(item.id)}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>PURCHASE ({item.priceDisplay})</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px] text-center font-mono">
                        {item.unlockRequirement?.text || 'Complete hidden chapter to confront'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'ORBS' && (() => {
              const item = ORB_COSMETICS.find((o) => o.id === previewOrb) || ORB_COSMETICS[0];
              const itemId = item.id as OrbCosmeticId;
              const unlocked = effectiveUnlockedOrbCosmetics.includes(itemId);
              const isEquipped = currentOrbCosmetic === itemId;

              return (
                <div className="text-center w-full mt-2 flex flex-col items-center">
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border mb-1 ${getRarityBadgeColor(item.rarity)}`}>
                    {item.rarity} • COLLECTIBLE ARTEFACT
                  </span>
                  <h3 className="text-base font-black text-white font-['Chakra_Petch'] uppercase">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 w-full">
                    {unlocked ? (
                      <button
                        id="btn-equip-orb"
                        type="button"
                        disabled={isEquipped}
                        onClick={() => {
                          sound.playClick();
                          onSelectOrbCosmetic(itemId);
                          showToast(`${item.name} equipped!`);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] flex items-center justify-center gap-2 transition-all ${
                          isEquipped
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>CURRENTLY EQUIPPED</span>
                          </>
                        ) : (
                          <span>EQUIP ARTEFACT</span>
                        )}
                      </button>
                    ) : (
                      <button
                        id="btn-buy-orb-money"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(item.id)}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>PURCHASE ({item.priceDisplay})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'BUNDLES' && previewBundle && (() => {
              const isOwned = effectivePurchasedBundles.includes(previewBundle.id);

              // Calculate itemized contents & authentic savings without fabricating
              const resolvedItems = previewBundle.itemIds.map((itemRef) => {
                if (itemRef.type === 'player') {
                  const skin = PLAYER_SKINS.find((s) => s.id === itemRef.id);
                  const isUnlocked = effectiveUnlockedSkins.includes(itemRef.id as SkinId);
                  const isEncrypted = (!isUnlocked && skin?.allowPreviewWhenLocked === false) || (qaForceEncrypted && !isUnlocked);
                  return {
                    type: 'RUNNER' as const,
                    id: itemRef.id,
                    name: isEncrypted ? 'CLASSIFIED RUNNER' : (skin?.name || itemRef.id),
                    rarity: skin?.rarity || 'RARE',
                    priceRp: skin?.priceRp || 30000,
                    priceDisplay: skin?.priceDisplay || `Rp ${(skin?.priceRp || 30000).toLocaleString('id-ID')}`,
                    isUnlocked,
                    isEncrypted,
                  };
                } else if (itemRef.type === 'entity') {
                  const entity = ENTITY_SKINS.find((e) => e.id === itemRef.id);
                  const isUnlocked = effectiveUnlockedEntitySkins.includes(itemRef.id as EntitySkinId);
                  const isEncrypted = (!isUnlocked && entity?.allowPreviewWhenLocked === false) || (qaForceEncrypted && !isUnlocked);
                  return {
                    type: 'ENTITY' as const,
                    id: itemRef.id,
                    name: isEncrypted ? 'CLASSIFIED ENTITY' : (entity?.name || itemRef.id),
                    rarity: entity?.rarity || 'RARE',
                    priceRp: entity?.priceRp || 35000,
                    priceDisplay: entity?.priceDisplay || `Rp ${(entity?.priceRp || 35000).toLocaleString('id-ID')}`,
                    isUnlocked,
                    isEncrypted,
                  };
                } else {
                  const orb = ORB_COSMETICS.find((o) => o.id === itemRef.id);
                  const isUnlocked = effectiveUnlockedOrbCosmetics.includes(itemRef.id as OrbCosmeticId);
                  return {
                    type: 'ARTEFACT' as const,
                    id: itemRef.id,
                    name: orb?.name || itemRef.id,
                    rarity: orb?.rarity || 'RARE',
                    priceRp: orb?.priceRp || 10000,
                    priceDisplay: orb?.priceDisplay || `Rp ${(orb?.priceRp || 10000).toLocaleString('id-ID')}`,
                    isUnlocked,
                    isEncrypted: false,
                  };
                }
              });

              const totalIndividualRp = resolvedItems.reduce((acc, curr) => acc + curr.priceRp, 0);
              const bundlePriceRp = previewBundle.priceRp;
              const savingsRp = Math.max(0, totalIndividualRp - bundlePriceRp);
              const savingsPercent = totalIndividualRp > 0 ? Math.round((savingsRp / totalIndividualRp) * 100) : 0;

              return (
                <div className="text-center w-full mt-1 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400">
                      {previewBundle.tag || 'BUNDLE SPECIAL'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                      SAVE {savingsPercent}%
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white font-['Chakra_Petch'] uppercase tracking-wide">
                    {previewBundle.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xs leading-relaxed">
                    {previewBundle.description}
                  </p>

                  {/* ITEMIZATION SECTION: WHAT YOU GET */}
                  <div className="mt-2.5 w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
                    <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        <span>WHAT YOU GET ({resolvedItems.length} ITEMS)</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[9px]">INDIVIDUAL VALUE</span>
                    </div>

                    <div className="space-y-1.5">
                      {resolvedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.type === 'RUNNER'
                                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                                  : item.type === 'ENTITY'
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {item.type}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {item.isEncrypted && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                              <span className={`font-semibold ${item.isEncrypted ? 'text-amber-300 font-mono' : 'text-slate-200'}`}>
                                {item.name}
                              </span>
                              <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${getRarityBadgeColor(item.rarity)}`}>
                                {item.rarity}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono text-[10px] text-slate-400 shrink-0">
                            {item.isUnlocked ? (
                              <span className="text-emerald-400 font-bold">OWNED</span>
                            ) : (
                              <span>{item.priceDisplay}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AUTHENTIC SAVINGS SUMMARY */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <div className="text-slate-400 text-[10px]">
                          Individual Total: <span className="text-slate-300 line-through">Rp {totalIndividualRp.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-emerald-400 text-[10px] font-bold">
                          You Save: Rp {savingsRp.toLocaleString('id-ID')} ({savingsPercent}% OFF)
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Bundle Price</div>
                        <div className="text-sm font-black text-rose-400 font-['Chakra_Petch']">
                          {previewBundle.priceDisplay}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 w-full">
                    {isOwned ? (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>BUNDLE ALREADY OWNED</span>
                      </div>
                    ) : (
                      <button
                        id="btn-buy-bundle"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(previewBundle.id)}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>UNLOCK COMPLETE BUNDLE ({previewBundle.priceDisplay})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeTab === 'SPECIALS' && (
              <div className="text-center w-full mt-2 flex flex-col items-center">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border mb-1 bg-emerald-950/50 border-emerald-500/40 text-emerald-400">
                  SYSTEM UPGRADE
                </span>
                <h3 className="text-base font-black text-white font-['Chakra_Petch'] uppercase">
                  ACCOUNT PASSES
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Permanent lifetime account perks. No recurring fees or subscriptions.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Catalog Grid / List */}
          <div className="md:col-span-7 flex flex-col gap-2">
            {/* 1. PLAYERS TAB */}
            {activeTab === 'PLAYERS' && (
              <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
                {PLAYER_SKINS.map((s) => {
                  const sId = s.id as SkinId;
                  const unlocked = effectiveUnlockedSkins.includes(sId);
                  const isSelected = previewPlayerSkin === sId;
                  const isEquipped = currentSkin === sId;
                  const isEncrypted = (!s.allowPreviewWhenLocked && !unlocked) || (qaForceEncrypted && !unlocked);
                  const cost = s.costCoins || 0;

                  return (
                    <button
                      key={s.id}
                      id={`skin-item-${s.id}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPreviewPlayerSkin(sId);
                        if (unlocked) onSelectSkin(sId);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{
                            backgroundColor: isEncrypted ? '#374151' : '#06b6d4',
                            boxShadow: isEncrypted ? 'none' : '0 0 6px rgba(6,182,212,0.6)',
                          }}
                        />
                        {isEquipped ? (
                          <span className="text-[9px] font-black text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                            ACTIVE
                          </span>
                        ) : unlocked ? (
                          <span className="text-[9px] font-bold text-slate-400">
                            OWNED
                          </span>
                        ) : s.category === 'COIN' ? (
                          <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                            <Coins className="w-2.5 h-2.5" />
                            {cost.toLocaleString()}
                          </span>
                        ) : s.category === 'PREMIUM' ? (
                          <span className="text-[9px] font-bold text-emerald-400">
                            {s.priceDisplay}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            SECRET
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-black text-white font-['Chakra_Petch'] truncate">
                          {isEncrypted ? 'CLASSIFIED ???' : s.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {s.category} • {s.rarity}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. ENTITIES TAB */}
            {activeTab === 'ENTITIES' && (
              <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
                {ENTITY_SKINS.map((e) => {
                  const eId = e.id as EntitySkinId;
                  const unlocked = effectiveUnlockedEntitySkins.includes(eId);
                  const isSelected = previewEntitySkin === eId;
                  const isEquipped = currentEntitySkin === eId;
                  const isEncrypted = (!e.allowPreviewWhenLocked && !unlocked) || (qaForceEncrypted && !unlocked);
                  const cost = e.costCoins || 0;

                  return (
                    <button
                      key={e.id}
                      id={`entity-item-${e.id}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPreviewEntitySkin(eId);
                        if (unlocked) onSelectEntitySkin(eId);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{
                            backgroundColor: isEncrypted ? '#1e1b4b' : '#a855f7',
                            boxShadow: isEncrypted ? 'none' : '0 0 6px rgba(168,85,247,0.6)',
                          }}
                        />
                        {isEquipped ? (
                          <span className="text-[9px] font-black text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded-full border border-purple-500/30">
                            ACTIVE
                          </span>
                        ) : unlocked ? (
                          <span className="text-[9px] font-bold text-slate-400">
                            OWNED
                          </span>
                        ) : e.category === 'COIN' ? (
                          <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                            <Coins className="w-2.5 h-2.5" />
                            {cost.toLocaleString()}
                          </span>
                        ) : e.category === 'PREMIUM' ? (
                          <span className="text-[9px] font-bold text-emerald-400">
                            {e.priceDisplay}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            SECRET
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-black text-white font-['Chakra_Petch'] truncate">
                          {isEncrypted ? 'ANOMALY ???' : e.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {e.category} • {e.rarity}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. ORBS TAB */}
            {activeTab === 'ORBS' && (
              <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
                {ORB_COSMETICS.map((o) => {
                  const oId = o.id as OrbCosmeticId;
                  const unlocked = effectiveUnlockedOrbCosmetics.includes(oId);
                  const isSelected = previewOrb === oId;
                  const isEquipped = currentOrbCosmetic === oId;

                  return (
                    <button
                      key={o.id}
                      id={`orb-item-${o.id}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPreviewOrb(oId);
                        if (unlocked) onSelectOrbCosmetic(oId);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{
                            backgroundColor: '#f59e0b',
                            boxShadow: '0 0 6px rgba(245,158,11,0.6)',
                          }}
                        />
                        {isEquipped ? (
                          <span className="text-[9px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                            ACTIVE
                          </span>
                        ) : unlocked ? (
                          <span className="text-[9px] font-bold text-slate-400">
                            OWNED
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-400">
                            {o.priceDisplay}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-black text-white font-['Chakra_Petch'] truncate">
                          {o.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {o.priceDisplay} • {o.rarity}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. BUNDLES TAB */}
            {activeTab === 'BUNDLES' && (
              <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
                {BUNDLES.map((b) => {
                  const isOwned = effectivePurchasedBundles.includes(b.id);
                  const isSelected = previewBundle?.id === b.id;

                  // Compute real authentic savings
                  const totalIndiv = b.itemIds.reduce((sum, item) => {
                    if (item.type === 'player') return sum + (PLAYER_SKINS.find((p) => p.id === item.id)?.priceRp || 30000);
                    if (item.type === 'entity') return sum + (ENTITY_SKINS.find((e) => e.id === item.id)?.priceRp || 35000);
                    return sum + (ORB_COSMETICS.find((o) => o.id === item.id)?.priceRp || 10000);
                  }, 0);
                  const bundleSavings = Math.max(0, totalIndiv - b.priceRp);
                  const bundlePct = totalIndiv > 0 ? Math.round((bundleSavings / totalIndiv) * 100) : 0;

                  return (
                    <button
                      key={b.id}
                      id={`bundle-item-${b.id}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPreviewBundle(b);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-white font-['Chakra_Petch']">
                            {b.name}
                          </span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300">
                            {b.tag || 'DEAL'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {b.description}
                        </p>
                        <div className="text-[10px] text-cyan-400 font-mono mt-1">
                          Contains: {b.itemIds.length} exclusive items
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {b.priceDisplay}
                        </span>
                        {isOwned ? (
                          <span className="text-[10px] text-emerald-400 font-bold mt-1">
                            OWNED
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-bold mt-1 font-mono">
                            SAVE {bundlePct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5. SPECIALS & NO-ADS TAB */}
            {activeTab === 'SPECIALS' && (
              <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                {/* 1. REMOVE ADS */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0 mt-0.5">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white font-['Chakra_Petch'] uppercase">
                        {STORE_PRODUCTS.REMOVE_ADS.name}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                        {STORE_PRODUCTS.REMOVE_ADS.description}
                      </p>
                      <span className="inline-block text-[10px] text-cyan-400 font-mono mt-1">
                        ✓ Ad-free experience ✓ Instant rewarded revive
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    {adsRemoved ? (
                      <span className="text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
                        PURCHASED
                      </span>
                    ) : (
                      <button
                        id="btn-buy-remove-ads"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(STORE_PRODUCTS.REMOVE_ADS.id)}
                        className="py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-md cursor-pointer"
                      >
                        {STORE_PRODUCTS.REMOVE_ADS.priceDisplay}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. FULL STORY */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400 shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white font-['Chakra_Petch'] uppercase">
                        {STORE_PRODUCTS.FULL_STORY.name}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                        {STORE_PRODUCTS.FULL_STORY.description}
                      </p>
                      <span className="inline-block text-[10px] text-purple-400 font-mono mt-1">
                        ✓ All 6 story chapters ✓ Narrative archives
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    {fullStoryUnlocked ? (
                      <span className="text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
                        PURCHASED
                      </span>
                    ) : (
                      <button
                        id="btn-buy-full-story"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(STORE_PRODUCTS.FULL_STORY.id)}
                        className="py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white shadow-md cursor-pointer"
                      >
                        {STORE_PRODUCTS.FULL_STORY.priceDisplay}
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. SUPPORTER PACK */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white font-['Chakra_Petch'] uppercase">
                          {STORE_PRODUCTS.SUPPORTER_PACK.name}
                        </h4>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          BEST VALUE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                        {STORE_PRODUCTS.SUPPORTER_PACK.description}
                      </p>
                      <span className="inline-block text-[10px] text-amber-400 font-mono mt-1">
                        ✓ Remove Ads + Full Story + Supporter Badge
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    {supporterPackUnlocked ? (
                      <span className="text-xs font-bold text-amber-400 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30">
                        ACTIVE VIP
                      </span>
                    ) : (
                      <button
                        id="btn-buy-supporter-pack"
                        type="button"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(STORE_PRODUCTS.SUPPORTER_PACK.id)}
                        className="py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-md cursor-pointer"
                      >
                        {STORE_PRODUCTS.SUPPORTER_PACK.priceDisplay}
                      </button>
                    )}
                  </div>
                </div>

                {/* Restore Purchases Action */}
                <div className="pt-2 text-center">
                  <button
                    id="btn-restore-purchases"
                    type="button"
                    onClick={handleRestore}
                    disabled={isPurchasing}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESTORE PREVIOUS PURCHASES</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Policy Guarantee */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
          <span>Purely cosmetic & narrative. No pay-to-win. No lootboxes.</span>
          <span>Google Play & Cloud Sync Ready</span>
        </div>
      </div>
    </div>
  );
};
