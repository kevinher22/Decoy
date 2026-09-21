/**
 * Shared Entity Visual Renderer
 * Ensures the mysterious entity has 100% consistent appearance across:
 * - Opening cutscene chase
 * - Gameplay encounters (Encounter A-H)
 * - Look Back mechanic
 * - Ending scenes
 * - Final convergence cutscene
 * - Shop / Locker previews
 *
 * Full-fidelity implementation for all 16 distinct Entity identities.
 */

import { EntitySkinId } from '../types';
import { drawRoundRect } from '../utils/canvasHelper';

export interface EntityRenderOptions {
  stance?: 'STALKING' | 'CHASING' | 'STANDING' | 'CROSSING' | 'DISSOLVING' | 'GLIDING';
  animClock?: number;
  animTime?: number;
  alpha?: number;
  scale?: number;
  facingRight?: boolean;
  eyeGlowIntensity?: number;
  showRedAura?: boolean;
  blurTendrils?: boolean;
  distanceToPlayer?: number;
  entitySkinId?: EntitySkinId;
  isEncrypted?: boolean;
}

export function renderEncryptedEntitySilhouette(
  ctx: CanvasRenderingContext2D,
  animClock: number,
  scale: number = 1
): void {
  const glitch = Math.sin(animClock * 16) * 4;
  const flicker = 0.6 + Math.sin(animClock * 22) * 0.3;

  ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
  ctx.shadowBlur = 20;

  // Corrupted monolithic shadow mass
  ctx.fillStyle = '#06020c';
  ctx.beginPath();
  ctx.moveTo(-35 + glitch, 10);
  ctx.lineTo(-40, -110);
  ctx.lineTo(0, -145);
  ctx.lineTo(40, -110);
  ctx.lineTo(35 - glitch, 10);
  ctx.closePath();
  ctx.fill();

  // Redaction censor blocks
  ctx.fillStyle = '#000000';
  ctx.fillRect(-45, -125, 90, 24);
  ctx.fillRect(-50, -75, 100, 28);
  ctx.fillRect(-38, -25, 76, 20);

  // Digital scanlines
  ctx.strokeStyle = `rgba(239, 68, 68, ${flicker * 0.7})`;
  ctx.lineWidth = 2;
  for (let y = -140; y < 10; y += 12) {
    if (Math.sin(animClock * 12 + y) > 0) {
      ctx.beginPath();
      ctx.moveTo(-45, y);
      ctx.lineTo(45, y);
      ctx.stroke();
    }
  }

  // Encrypted text
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'center';
  ctx.fillText('UNKNOWN ENTITY', glitch, -62);
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('ENCRYPTED', 0, -42);
}

export function renderConsistentEntity(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  options: EntityRenderOptions
): void {
  const {
    stance = 'STALKING',
    alpha = 1.0,
    scale = 1.0,
    facingRight = true,
    eyeGlowIntensity = 1.0,
    showRedAura = true,
    entitySkinId = 'entity_original',
    isEncrypted = false,
  } = options;
  const animClock = options.animClock ?? options.animTime ?? 0;

  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x, y);
  ctx.scale(facingRight ? scale : -scale, scale);

  // Check if encrypted
  if (isEncrypted) {
    renderEncryptedEntitySilhouette(ctx, animClock, scale);
    ctx.restore();
    return;
  }

  const breath = Math.sin(animClock * 3.5) * 3;
  const tendrilWiggle = Math.sin(animClock * 6) * 8;
  const fastTendril = Math.cos(animClock * 9) * 12;

  // 1. Cast Ground Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  const shadowWidth = stance === 'CHASING' ? 70 : 50;
  ctx.ellipse(0, 10, shadowWidth, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Aura & Shadow Glow
  if (showRedAura) {
    const auraPulse = 16 + Math.sin(animClock * 4) * 8;
    switch (entitySkinId) {
      case 'entity_watcher':
        ctx.shadowColor = '#ef4444';
        break;
      case 'entity_red_shift':
        ctx.shadowColor = '#dc2626';
        break;
      case 'entity_white_signal':
        ctx.shadowColor = '#38bdf8';
        break;
      case 'entity_clock':
        ctx.shadowColor = '#f59e0b';
        break;
      case 'entity_machine':
        ctx.shadowColor = '#f97316';
        break;
      case 'entity_artificial_angel':
        ctx.shadowColor = '#fef08a';
        break;
      case 'entity_fractured':
        ctx.shadowColor = '#a855f7';
        break;
      case 'entity_archive':
        ctx.shadowColor = '#06b6d4';
        break;
      case 'entity_redacted':
        ctx.shadowColor = '#eab308';
        break;
      case 'entity_drowned':
        ctx.shadowColor = '#14b8a6';
        break;
      case 'entity_paradox':
        ctx.shadowColor = '#ec4899';
        break;
      case 'entity_origin':
        ctx.shadowColor = '#ffffff';
        break;
      case 'entity_hollow':
        ctx.shadowColor = '#6366f1';
        break;
      case 'entity_old_one':
        ctx.shadowColor = '#84cc16';
        break;
      case 'entity_ashen':
        ctx.shadowColor = '#ea580c';
        break;
      case 'entity_cryo_phantom':
        ctx.shadowColor = '#38bdf8';
        break;
      case 'entity_neon_parasite':
        ctx.shadowColor = '#06b6d4';
        break;
      case 'entity_chitin_colossus':
        ctx.shadowColor = '#10b981';
        break;
      case 'entity_prismatic_shard':
        ctx.shadowColor = '#c084fc';
        break;
      case 'entity_iron_bell':
        ctx.shadowColor = '#d97706';
        break;
      case 'entity_ocular_swarm':
        ctx.shadowColor = '#ef4444';
        break;
      case 'entity_wire_weaver':
        ctx.shadowColor = '#fbbf24';
        break;
      case 'entity_solar_seraph':
        ctx.shadowColor = '#f59e0b';
        break;
      default:
        ctx.shadowColor = '#dc2626';
        break;
    }
    ctx.shadowBlur = auraPulse;
  }

  // ---------------------------------------------------------------------------
  // 3. FULL BESPOKE ENTITY BODY CONSTRUCTION (16 DISTINCT IDENTITIES)
  // ---------------------------------------------------------------------------

  if (entitySkinId === 'entity_watcher') {
    // -------------------------------------------------------------------------
    // THE WATCHER: Unnatural observer silhouette, spindly limbs, tall observation crest,
    // auxiliary scanning sensors, multi-lens surveillance optics.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#06030c';

    // Tall spindly legs
    ctx.beginPath();
    ctx.moveTo(-18, 10);
    ctx.lineTo(-24, -30);
    ctx.lineTo(-12, -70);
    ctx.lineTo(-6, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.lineTo(22, -30);
    ctx.lineTo(12, -70);
    ctx.lineTo(6, 0);
    ctx.fill();

    // Torso: Asymmetrical chitinous spire
    ctx.beginPath();
    ctx.moveTo(-16, -65);
    ctx.lineTo(-28, -115 + breath * 0.5);
    ctx.lineTo(0, -155 + breath); // High towering observation spire
    ctx.lineTo(24, -120 + breath * 0.5);
    ctx.lineTo(14, -65);
    ctx.closePath();
    ctx.fill();

    // Multi-jointed spindly arms with sensor fingers
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-22, -100);
    ctx.lineTo(-44 + tendrilWiggle * 0.4, -60);
    ctx.lineTo(-32, -10);
    ctx.moveTo(22, -100);
    ctx.lineTo(42 - tendrilWiggle * 0.4, -65);
    ctx.lineTo(34, -15);
    ctx.stroke();

    // Observation spine nodes on the crest
    const nodeY = [-145, -135, -125, -112];
    nodeY.forEach((ny, idx) => {
      const offset = (idx % 2 === 0 ? -7 : 7) + Math.sin(animClock * 5 + idx) * 2;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(offset, ny + breath, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central primary unblinking observation lens
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -105 + breath, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -105 + breath, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Surveillance red scan cone
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(animClock * 8) * 0.08;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -105 + breath);
    ctx.lineTo(facingRight ? 90 : -90, -90);
    ctx.lineTo(facingRight ? 85 : -85, -120);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

  } else if (entitySkinId === 'entity_red_shift') {
    // -------------------------------------------------------------------------
    // RED SHIFT: Relativistic spatial tearing! Multiple offset Doppler layers,
    // displaced body sections, chromatic velocity shears.
    // -------------------------------------------------------------------------
    const shifts = [
      { dx: -14, col: 'rgba(153, 27, 27, 0.45)', blur: 10 },
      { dx: -7, col: 'rgba(220, 38, 38, 0.65)', blur: 6 },
      { dx: 0, col: '#7f1d1d', blur: 0 },
    ];

    shifts.forEach((s) => {
      ctx.save();
      ctx.fillStyle = s.col;
      if (s.blur > 0) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = s.blur;
      }
      ctx.translate(s.dx, 0);

      // Displaced jagged silhouette
      ctx.beginPath();
      ctx.moveTo(-28, 6);
      ctx.lineTo(-38 + tendrilWiggle * 0.3, -45);
      ctx.lineTo(-32, -90);
      ctx.lineTo(5, -135 + breath);
      ctx.lineTo(36, -95);
      ctx.lineTo(32, -40);
      ctx.lineTo(26, 6);
      ctx.closePath();
      ctx.fill();

      // Shear lines across torso
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-35, -70);
      ctx.lineTo(25, -60);
      ctx.moveTo(-25, -35);
      ctx.lineTo(35, -25);
      ctx.stroke();

      ctx.restore();
    });

  } else if (entitySkinId === 'entity_white_signal') {
    // -------------------------------------------------------------------------
    // WHITE SIGNAL: Alien broadcast, elongated geometry, CRT scanlines,
    // fragmented white/slate polygons, detached transmission shards.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-22, 6);
    ctx.lineTo(-32, -60);
    ctx.lineTo(-18, -135 + breath);
    ctx.lineTo(18, -135 + breath);
    ctx.lineTo(32, -60);
    ctx.lineTo(22, 6);
    ctx.closePath();
    ctx.fill();

    // Fragmented white broadcast facets
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-16, -115 + breath);
    ctx.lineTo(12, -125 + breath);
    ctx.lineTo(20, -95 + breath);
    ctx.lineTo(-8, -85 + breath);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(-22, -80);
    ctx.lineTo(14, -75);
    ctx.lineTo(8, -45);
    ctx.lineTo(-26, -50);
    ctx.closePath();
    ctx.fill();

    // Horizontal TV frequency raster lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 2;
    for (let y = -130; y < 0; y += 10) {
      const wave = Math.sin(animClock * 20 + y * 0.2) * 16;
      ctx.beginPath();
      ctx.moveTo(-26 + wave * 0.3, y + breath);
      ctx.lineTo(26 + wave * 0.3, y + breath);
      ctx.stroke();
    }

    // Detached floating broadcast shards
    ctx.fillStyle = '#f8fafc';
    const shard1Y = -110 + Math.sin(animClock * 7) * 8;
    ctx.fillRect(-38, shard1Y, 6, 6);
    const shard2Y = -60 + Math.cos(animClock * 9) * 10;
    ctx.fillRect(36, shard2Y, 7, 5);

  } else if (entitySkinId === 'entity_clock') {
    // -------------------------------------------------------------------------
    // THE CLOCK: Segmented horological titan, active rotating brass gear train,
    // escapement wheel, large chronometer chest dial, ticking pendulum.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#1c1917';

    // Segmented brass/iron legs
    ctx.beginPath();
    drawRoundRect(ctx, -24, -40, 14, 48, 4);
    drawRoundRect(ctx, 10, -40, 14, 48, 4);
    ctx.fill();

    // Brass articulated joints
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(-17, -15, 6, 0, Math.PI * 2);
    ctx.arc(17, -15, 6, 0, Math.PI * 2);
    ctx.fill();

    // Heavy mechanical body casing
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath();
    drawRoundRect(ctx, -32, -125 + breath, 64, 90, 12);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Large ornamental brass chronometer dial in chest
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(0, -78 + breath, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -78 + breath, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating internal gear in dial
    ctx.save();
    ctx.translate(0, -78 + breath);
    ctx.rotate(animClock * 4);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-1.5, -16, 3, 4);
    }
    // Clock hands
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.restore();

    // Escapement counterweight pendulum swinging at base
    const pendAngle = Math.sin(animClock * 4) * 0.4;
    ctx.save();
    ctx.translate(0, -50 + breath);
    ctx.rotate(pendAngle);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 24, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (entitySkinId === 'entity_machine') {
    // -------------------------------------------------------------------------
    // THE MACHINE: Heavy industrial hydraulic sentinel, thick armor plating,
    // active hydraulic pistons, industrial hazard stripes, steam exhaust.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#0f172a';

    // Heavy hydraulic legs
    ctx.beginPath();
    ctx.fillRect(-28, -45, 18, 55);
    ctx.fillRect(10, -45, 18, 55);

    // Main reinforced angular blast torso
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-34, -125 + breath);
    ctx.lineTo(34, -125 + breath);
    ctx.lineTo(26, -45);
    ctx.lineTo(-26, -45);
    ctx.closePath();
    ctx.fill();

    // Exposed working hydraulic cylinder rods
    const pistonCompress = Math.sin(animClock * 7) * 6;
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-24, -100 + breath, 8, 30);
    ctx.fillRect(16, -100 + breath, 8, 30);
    ctx.fillStyle = '#cbd5e1'; // polished chrome rod
    ctx.fillRect(-22, -85 + breath + pistonCompress, 4, 25);
    ctx.fillRect(18, -85 + breath + pistonCompress, 4, 25);

    // Hazard chevrons on chest
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-18, -115 + breath, 36, 6);
    ctx.fillStyle = '#0f172a';
    for (let c = -14; c < 14; c += 8) {
      ctx.beginPath();
      ctx.moveTo(c, -115 + breath);
      ctx.lineTo(c + 4, -115 + breath);
      ctx.lineTo(c + 1, -109 + breath);
      ctx.lineTo(c - 3, -109 + breath);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy mechanical claw arms
    ctx.fillStyle = '#334155';
    ctx.fillRect(-48, -110 + breath, 14, 60);
    ctx.fillRect(34, -110 + breath, 14, 60);

  } else if (entitySkinId === 'entity_artificial_angel') {
    // -------------------------------------------------------------------------
    // ARTIFICIAL ANGEL: Damaged celestial engineering, ivory ceramic plates,
    // mechanical blade-wings, floating halo armature, holy synthetic energy.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#090714';

    // Streamlined celestial body
    ctx.beginPath();
    ctx.moveTo(-20, 8);
    ctx.lineTo(-26, -120 + breath);
    ctx.lineTo(0, -145 + breath);
    ctx.lineTo(26, -120 + breath);
    ctx.lineTo(20, 8);
    ctx.closePath();
    ctx.fill();

    // Ivory ceramic armor plates
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    drawRoundRect(ctx, -16, -110 + breath, 32, 45, 6);
    ctx.fill();

    // Gold filigree inlay
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -105 + breath);
    ctx.lineTo(0, -70 + breath);
    ctx.moveTo(-10, -90 + breath);
    ctx.lineTo(10, -90 + breath);
    ctx.stroke();

    // Giant articulated blade wings
    const wingFlap = Math.sin(animClock * 5) * 8;
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;

    // Left Wing (Intact & segmented)
    ctx.beginPath();
    ctx.moveTo(-20, -95 + breath);
    ctx.lineTo(-75, -145 + wingFlap + breath);
    ctx.lineTo(-50, -90 + breath);
    ctx.lineTo(-85, -110 + wingFlap + breath);
    ctx.lineTo(-30, -60 + breath);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing (Asymmetrical & cracked)
    ctx.beginPath();
    ctx.moveTo(20, -95 + breath);
    ctx.lineTo(65, -135 - wingFlap + breath);
    ctx.lineTo(45, -85 + breath);
    ctx.lineTo(75, -100 - wingFlap + breath);
    ctx.lineTo(28, -55 + breath);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Floating mechanical halo armature behind head
    ctx.save();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, -145 + breath, 22, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (entitySkinId === 'entity_fractured') {
    // -------------------------------------------------------------------------
    // FRACTURED: Reality tear entity, split detached body segments,
    // unstable violet-cyan dimensional rift energy crackling between shards.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#0f0c29';

    // Segment 1: Lower torso & floating legs
    const seg1X = Math.sin(animClock * 6) * 4;
    ctx.beginPath();
    ctx.moveTo(-24 + seg1X, 6);
    ctx.lineTo(-30 + seg1X, -35);
    ctx.lineTo(18 + seg1X, -40);
    ctx.lineTo(24 + seg1X, 6);
    ctx.closePath();
    ctx.fill();

    // Segment 2: Displaced midsection
    const seg2X = Math.sin(animClock * 8 + 2) * -6;
    ctx.beginPath();
    ctx.moveTo(-34 + seg2X, -50);
    ctx.lineTo(-20 + seg2X, -85);
    ctx.lineTo(28 + seg2X, -80);
    ctx.lineTo(22 + seg2X, -45);
    ctx.closePath();
    ctx.fill();

    // Segment 3: Floating shattered head
    const seg3X = Math.sin(animClock * 10 + 4) * 5;
    ctx.beginPath();
    ctx.moveTo(-18 + seg3X, -100 + breath);
    ctx.lineTo(-24 + seg3X, -135 + breath);
    ctx.lineTo(16 + seg3X, -138 + breath);
    ctx.lineTo(22 + seg3X, -95 + breath);
    ctx.closePath();
    ctx.fill();

    // Electric dimensional rift lightning connecting the fragments
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10 + seg1X, -38);
    ctx.lineTo(0 + seg2X, -48);
    ctx.lineTo(-8 + seg2X, -82);
    ctx.lineTo(4 + seg3X, -98 + breath);
    ctx.stroke();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12 + seg1X, -40);
    ctx.lineTo(18 + seg2X, -52);
    ctx.lineTo(14 + seg2X, -80);
    ctx.lineTo(10 + seg3X, -102 + breath);
    ctx.stroke();

  } else if (entitySkinId === 'entity_archive') {
    // -------------------------------------------------------------------------
    // THE ARCHIVE: Coalesced memories, layered floating scrolls,
    // memory glass vials, rotating archival runes, crystalline lore core.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#1c1917';

    // Monolithic scholar frame
    ctx.beginPath();
    ctx.moveTo(-28, 8);
    ctx.lineTo(-36, -115 + breath);
    ctx.lineTo(0, -140 + breath);
    ctx.lineTo(36, -115 + breath);
    ctx.lineTo(28, 8);
    ctx.closePath();
    ctx.fill();

    // Floating parchment / document fragments
    ctx.fillStyle = '#78350f';
    for (let p = 0; p < 4; p++) {
      const pY = -110 + p * 25 + breath;
      const pX = (p % 2 === 0 ? -38 : 30) + Math.sin(animClock * 4 + p) * 6;
      ctx.fillRect(pX, pY, 14, 18);
      // Faint script lines on scrolls
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pX + 2, pY + 5);
      ctx.lineTo(pX + 12, pY + 5);
      ctx.moveTo(pX + 2, pY + 9);
      ctx.lineTo(pX + 10, pY + 9);
      ctx.stroke();
    }

    // Memory glass cylinder in chest with glowing cyan lore data
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    drawRoundRect(ctx, -10, -85 + breath, 20, 36, 6);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing cyan lore fluid inside
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    drawRoundRect(ctx, -7, -78 + breath, 14, 25, 4);
    ctx.fill();

  } else if (entitySkinId === 'entity_redacted') {
    // -------------------------------------------------------------------------
    // THE REDACTED: Erased threat, missing body chunks, pitch black
    // censor blocks, digital redaction distortion bars, classified markings.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#18181b';

    // Incomplete base anatomy (missing chunks)
    ctx.beginPath();
    ctx.moveTo(-26, 8);
    ctx.lineTo(-34, -40);
    // Gap: chunk erased from left side
    ctx.lineTo(-20, -50);
    ctx.lineTo(-30, -90);
    ctx.lineTo(0, -135 + breath);
    ctx.lineTo(32, -90);
    // Gap on right side
    ctx.lineTo(16, -65);
    ctx.lineTo(28, -40);
    ctx.lineTo(24, 8);
    ctx.closePath();
    ctx.fill();

    // Pure black censor bars obscuring key anatomy
    ctx.fillStyle = '#000000';
    ctx.fillRect(-38, -125 + breath, 76, 22); // Face censor
    ctx.fillRect(-42, -80 + breath, 84, 18); // Chest censor
    ctx.fillRect(-30, -25, 60, 16); // Legs censor

    // Classified yellow stamp markings
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText('[TOP SECRET]', 0, -112 + breath);
    ctx.fillText('REDACTED', 0, -68 + breath);

  } else if (entitySkinId === 'entity_drowned') {
    // -------------------------------------------------------------------------
    // THE DROWNED: Abyssal trench horror, pressure-warped elongated body,
    // brass diving bell cage, barnacle chitin, bioluminescent photophores.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#042f2e';

    // Elongated fluid abyssal mantle
    ctx.beginPath();
    ctx.moveTo(-28, 8);
    ctx.bezierCurveTo(-45 + tendrilWiggle * 0.5, -40, -32, -100, 0, -130 + breath);
    ctx.bezierCurveTo(32, -100, 45 - tendrilWiggle * 0.5, -40, 28, 8);
    ctx.closePath();
    ctx.fill();

    // Abyssal diving bell helm cage
    ctx.fillStyle = '#134e4a';
    ctx.beginPath();
    ctx.arc(0, -110 + breath, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Heavy brass viewport cross-bars
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -110 + breath);
    ctx.lineTo(16, -110 + breath);
    ctx.moveTo(0, -126 + breath);
    ctx.lineTo(0, -94 + breath);
    ctx.stroke();

    // Bioluminescent cyan photophores along the spine
    const photoY = [-90, -75, -60, -45, -30, -15];
    photoY.forEach((py) => {
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, py + breath * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (entitySkinId === 'entity_paradox') {
    // -------------------------------------------------------------------------
    // THE PARADOX: Impossible causality violation, overlapping contradictory
    // dual silhouettes, rotating Möbius strip, dual-tone lighting.
    // -------------------------------------------------------------------------
    // Silhouette 1: Midnight-violet state
    ctx.save();
    ctx.fillStyle = 'rgba(76, 29, 149, 0.75)';
    ctx.beginPath();
    ctx.moveTo(-26, 8);
    ctx.lineTo(-36, -80);
    ctx.lineTo(-10, -135 + breath);
    ctx.lineTo(24, -90);
    ctx.lineTo(18, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Silhouette 2: Deep azure contradictory state (offset in conflicting direction)
    ctx.save();
    ctx.fillStyle = 'rgba(14, 116, 144, 0.75)';
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.lineTo(-24, -90);
    ctx.lineTo(10, -135 - breath);
    ctx.lineTo(36, -80);
    ctx.lineTo(26, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Rotating Möbius energy ring around torso
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    const ringRot = animClock * 3;
    ctx.ellipse(0, -75 + breath, 28, 10, ringRot * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (entitySkinId === 'entity_origin') {
    // -------------------------------------------------------------------------
    // ORIGIN: The Source Code anomaly, geometric monolith core,
    // orbiting Platonic polyhedral shards, pulsing white-gold singularity heart.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#05020c';

    // Monolithic hyper-symmetrical silhouette
    ctx.beginPath();
    ctx.moveTo(-24, 8);
    ctx.lineTo(-32, -90);
    ctx.lineTo(0, -145 + breath);
    ctx.lineTo(32, -90);
    ctx.lineTo(24, 8);
    ctx.closePath();
    ctx.fill();

    // Singularity Core in chest
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, -85 + breath, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Orbiting Platonic polyhedral shards
    const shardAngles = [animClock * 2, animClock * 2 + (Math.PI * 2) / 3, animClock * 2 + (Math.PI * 4) / 3];
    shardAngles.forEach((ang) => {
      const sx = Math.cos(ang) * 35;
      const sy = -85 + Math.sin(ang) * 16 + breath;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 6);
      ctx.lineTo(sx + 5, sy);
      ctx.lineTo(sx, sy + 6);
      ctx.lineTo(sx - 5, sy);
      ctx.closePath();
      ctx.fill();
    });

  } else if (entitySkinId === 'entity_hollow') {
    // -------------------------------------------------------------------------
    // THE HOLLOW: Gaping reality void, central light-swallowing cavity,
    // event horizon accretion rim, empty socket violet mist.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#0a0618';

    // Slender outer shell
    ctx.beginPath();
    ctx.moveTo(-26, 8);
    ctx.lineTo(-32, -120 + breath);
    ctx.lineTo(0, -140 + breath);
    ctx.lineTo(32, -120 + breath);
    ctx.lineTo(26, 8);
    ctx.closePath();
    ctx.fill();

    // Massive central light-eating cavity (the void hole)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, -75 + breath, 18, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Accretion rim pulling inwards
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -75 + breath, 20, 32, 0, 0, Math.PI * 2);
    ctx.stroke();

  } else if (entitySkinId === 'entity_old_one') {
    // -------------------------------------------------------------------------
    // THE OLD ONE: Primordial cosmic horror, crowned cranial crest,
    // writhing ancient tentacles at base, constellation specks inside obsidian skin.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#020617';

    // Towering crowned cranial silhouette
    ctx.beginPath();
    ctx.moveTo(-30, 6);
    ctx.lineTo(-45, -50);
    ctx.lineTo(-35, -120 + breath);
    // Crown spikes
    ctx.lineTo(-20, -145 + breath);
    ctx.lineTo(-10, -135 + breath);
    ctx.lineTo(0, -150 + breath);
    ctx.lineTo(10, -135 + breath);
    ctx.lineTo(20, -145 + breath);
    ctx.lineTo(35, -120 + breath);
    ctx.lineTo(45, -50);
    ctx.lineTo(30, 6);
    ctx.closePath();
    ctx.fill();

    // Writhing bottom eldritch tentacles
    ctx.fillStyle = '#0f172a';
    for (let t = -3; t <= 3; t++) {
      const tx = t * 9;
      const tw = Math.sin(animClock * 8 + t) * 10;
      ctx.beginPath();
      ctx.moveTo(tx - 3, 2);
      ctx.quadraticCurveTo(tx + tw, 18, tx + tw * 0.6, 24);
      ctx.lineTo(tx + 3, 2);
      ctx.fill();
    }

    // Constellation starfield specks shimmering inside
    ctx.fillStyle = 'rgba(132, 204, 22, 0.8)';
    const stars = [
      { x: -12, y: -90 },
      { x: 8, y: -100 },
      { x: -4, y: -70 },
      { x: 14, y: -60 },
      { x: -16, y: -45 },
    ];
    stars.forEach((st) => {
      ctx.beginPath();
      ctx.arc(st.x, st.y + breath * 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (entitySkinId === 'entity_ashen') {
    // -------------------------------------------------------------------------
    // ASHEN: Scorched volcanic terror, cracked obsidian/basalt carapace,
    // glowing molten magma fissure veins, burning ember shoulder smoke.
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-36, 6);
    ctx.lineTo(-44 + tendrilWiggle * 0.5, -40);
    ctx.lineTo(-28, -110);
    ctx.lineTo(0, -135);
    ctx.lineTo(28, -110);
    ctx.lineTo(44 - tendrilWiggle * 0.5, -40);
    ctx.lineTo(36, 6);
    ctx.closePath();
    ctx.fill();

    // Glowing orange/amber molten magma fissure veins
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-10, -100);
    ctx.lineTo(-4, -60);
    ctx.lineTo(-18, -30);
    ctx.moveTo(12, -80);
    ctx.lineTo(6, -45);
    ctx.lineTo(16, -10);
    ctx.stroke();

    // Molten ember particles floating upward
    ctx.fillStyle = '#fbbf24';
    const ember1Y = -70 - ((animClock * 30) % 60);
    ctx.fillRect(-12, ember1Y, 3, 3);
    const ember2Y = -50 - ((animClock * 25 + 20) % 60);
    ctx.fillRect(10, ember2Y, 2.5, 2.5);

  } else if (entitySkinId === 'entity_cryo_phantom') {
    // Subzero glacial phantom: jagged permafrost ice spines, translucent frost chitin
    ctx.fillStyle = '#081c2e';
    ctx.beginPath();
    ctx.moveTo(-28, 6);
    ctx.lineTo(-36, -45);
    ctx.lineTo(-44, -75);
    ctx.lineTo(-24, -115);
    ctx.lineTo(0, -135);
    ctx.lineTo(24, -115);
    ctx.lineTo(44, -75);
    ctx.lineTo(36, -45);
    ctx.lineTo(28, 6);
    ctx.closePath();
    ctx.fill();

    // Sharp permafrost ice crystals erupting from spine
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-20, -70);
    ctx.lineTo(-50, -85);
    ctx.lineTo(-22, -95);
    ctx.lineTo(-40, -115);
    ctx.lineTo(-12, -120);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(20, -70);
    ctx.lineTo(50, -85);
    ctx.lineTo(22, -95);
    ctx.lineTo(40, -115);
    ctx.lineTo(12, -120);
    ctx.closePath();
    ctx.fill();

    // Billowing subzero frost mist & drifting ice flakes
    ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
    for (let f = 0; f < 5; f++) {
      const flakeY = -40 - ((animClock * 25 + f * 20) % 90);
      const flakeX = Math.sin(animClock * 3 + f) * 25;
      ctx.fillRect(flakeX, flakeY, 3, 3);
    }

  } else if (entitySkinId === 'entity_neon_parasite') {
    // Bioluminescent abyssal organism: exposed pale vertebrae + undulating cyan tendrils
    ctx.fillStyle = '#02151d';
    ctx.beginPath();
    ctx.ellipse(0, -65 + breath, 24, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Exposed bleached vertebrae bones
    ctx.fillStyle = '#e0f2fe';
    for (let v = 0; v < 7; v++) {
      const vertY = -110 + v * 15;
      ctx.fillRect(-6, vertY, 12, 5);
      ctx.fillRect(-10, vertY + 1, 20, 2);
    }

    // 4 undulating bioluminescent photophore tendrils
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    for (let t = 0; t < 4; t++) {
      const side = t % 2 === 0 ? -1 : 1;
      const tWave = Math.sin(animClock * 6 + t) * 16;
      ctx.beginPath();
      ctx.moveTo(side * 12, -90 + t * 22);
      ctx.quadraticCurveTo(side * (35 + tWave), -70 + t * 22, side * (20 - tWave), -20 + t * 15);
      ctx.stroke();

      // Glowing photophore node at tip
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(side * (20 - tWave), -20 + t * 15, 3, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (entitySkinId === 'entity_chitin_colossus') {
    // Armored insectoid leviathan: heavy chitin carapace + hydraulic mantis pincers
    ctx.fillStyle = '#041f18';
    ctx.beginPath();
    ctx.moveTo(-38, 6);
    ctx.lineTo(-45, -50);
    ctx.lineTo(-30, -110);
    ctx.lineTo(0, -135);
    ctx.lineTo(30, -110);
    ctx.lineTo(45, -50);
    ctx.lineTo(38, 6);
    ctx.closePath();
    ctx.fill();

    // Carapace plate segments
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    for (let c = 0; c < 4; c++) {
      const plateY = -100 + c * 25;
      ctx.beginPath();
      ctx.moveTo(-25, plateY);
      ctx.lineTo(0, plateY + 10);
      ctx.lineTo(25, plateY);
      ctx.stroke();
    }

    // Massive mantis scythe appendages
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    const pincerAngle = Math.sin(animClock * 5) * 0.15;
    // Left pincer
    ctx.save();
    ctx.translate(-35, -80);
    ctx.rotate(-0.3 + pincerAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-25, 35);
    ctx.lineTo(-15, 45);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // Right pincer
    ctx.save();
    ctx.translate(35, -80);
    ctx.rotate(0.3 - pincerAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, 35);
    ctx.lineTo(15, 45);
    ctx.lineTo(-5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

  } else if (entitySkinId === 'entity_prismatic_shard') {
    // Faceted crystalline monolith with glowing purple amethyst geode core
    ctx.fillStyle = '#1e1035';
    ctx.beginPath();
    ctx.moveTo(-30, 6);
    ctx.lineTo(-42, -60);
    ctx.lineTo(0, -145);
    ctx.lineTo(42, -60);
    ctx.lineTo(30, 6);
    ctx.closePath();
    ctx.fill();

    // Geometric faceted edges
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -145);
    ctx.lineTo(-18, -60);
    ctx.lineTo(0, 6);
    ctx.moveTo(0, -145);
    ctx.lineTo(18, -60);
    ctx.lineTo(0, 6);
    ctx.moveTo(-42, -60);
    ctx.lineTo(42, -60);
    ctx.stroke();

    // Orbiting floating crystal razor shards
    for (let s = 0; s < 4; s++) {
      const sAngle = animClock * 3 + s * (Math.PI / 2);
      const sx = Math.cos(sAngle) * 45;
      const sy = -75 + Math.sin(sAngle) * 20;
      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 8);
      ctx.lineTo(sx + 5, sy);
      ctx.lineTo(sx, sy + 8);
      ctx.lineTo(sx - 5, sy);
      ctx.closePath();
      ctx.fill();
    }

  } else if (entitySkinId === 'entity_iron_bell') {
    // Inverted bronze gothic cathedral bell torso
    ctx.fillStyle = '#1f150b';
    ctx.beginPath();
    ctx.moveTo(-35, 6);
    ctx.lineTo(-38, -30);
    ctx.quadraticCurveTo(-25, -90, -14, -125);
    ctx.lineTo(14, -125);
    ctx.quadraticCurveTo(25, -90, 38, -30);
    ctx.lineTo(35, 6);
    ctx.closePath();
    ctx.fill();

    // Bell rim & verdigris bronze bands
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-38, -30);
    ctx.lineTo(38, -30);
    ctx.stroke();

    // Cathedral bell soundwave shockwaves
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    const ringRad = 45 + ((animClock * 40) % 50);
    ctx.beginPath();
    ctx.arc(0, -60, ringRad, 0, Math.PI * 2);
    ctx.stroke();

    // Swinging pendulum clapper inside bell mouth
    const swing = Math.sin(animClock * 6) * 12;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(swing, -5, 8, 0, Math.PI * 2);
    ctx.fill();

  } else if (entitySkinId === 'entity_ocular_swarm') {
    // Hive of shifting unblinking eyes bound by pulsing crimson nerve fibers
    ctx.fillStyle = '#180408';
    ctx.beginPath();
    ctx.ellipse(0, -65 + breath, 26, 62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing optic nerve cords
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    for (let n = 0; n < 6; n++) {
      const nAngle = animClock * 2 + n;
      ctx.beginPath();
      ctx.moveTo(0, -65);
      ctx.quadraticCurveTo(Math.cos(nAngle) * 35, -65 + Math.sin(nAngle) * 35, Math.cos(nAngle) * 45, -65 + Math.sin(nAngle) * 45);
      ctx.stroke();
    }

    // Satellite hovering tracking eyes
    for (let o = 0; o < 6; o++) {
      const oAngle = animClock * 2 + o * (Math.PI / 3);
      const ox = Math.cos(oAngle) * 38;
      const oy = -65 + Math.sin(oAngle) * 38;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (entitySkinId === 'entity_wire_weaver') {
    // Tall spindly jointed marionette + cracked Venetian smiling mask
    ctx.fillStyle = '#1c1917';
    // Spindly elongated body
    ctx.fillRect(-8, -120, 16, 126);

    // Golden puppet wire strings stretching to the heavens
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-18, -110);
    ctx.lineTo(-18, -200);
    ctx.moveTo(0, -135);
    ctx.lineTo(0, -200);
    ctx.moveTo(18, -110);
    ctx.lineTo(18, -200);
    ctx.stroke();

    // Cracked Venetian porcelain mask
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -115, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Painted eerie red smile
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -110, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

  } else if (entitySkinId === 'entity_solar_seraph') {
    // Eclipse silhouette + obsidian blade-wings + violent golden plasma corona
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(0, -65 + breath, 22, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6 radiant obsidian blade wings fanned radially
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    for (let w = 0; w < 6; w++) {
      const side = w < 3 ? -1 : 1;
      const wingIdx = w % 3;
      const wingY = -110 + wingIdx * 30;
      const wingLen = 45 + wingIdx * 10;
      ctx.beginPath();
      ctx.moveTo(side * 10, wingY);
      ctx.lineTo(side * wingLen, wingY - 25);
      ctx.lineTo(side * (wingLen - 10), wingY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Swirling solar flares around eclipse crown
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    for (let sf = 0; sf < 8; sf++) {
      const sfa = animClock * 4 + sf * (Math.PI / 4);
      ctx.beginPath();
      ctx.arc(Math.cos(sfa) * 22, -115 + Math.sin(sfa) * 22, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

  } else {
    // -------------------------------------------------------------------------
    // THE ORIGINAL: Classic towering supernatural silhouette with dark smoky tendrils
    // -------------------------------------------------------------------------
    ctx.fillStyle = '#05020c';

    if (stance === 'CHASING') {
      ctx.beginPath();
      ctx.moveTo(15, 6);
      ctx.bezierCurveTo(-20 + tendrilWiggle, -20, -50 + fastTendril, -50, -35, -95);
      ctx.bezierCurveTo(-20, -135, 10, -145, 25, -130);
      ctx.bezierCurveTo(45, -100, 40, -40, 30, 6);
      ctx.closePath();
      ctx.fill();

      // Trailing dark smoky tendrils
      ctx.fillStyle = 'rgba(10, 5, 25, 0.9)';
      ctx.beginPath();
      ctx.moveTo(-25, -30);
      ctx.bezierCurveTo(-65 + fastTendril, -35, -95 + tendrilWiggle, -55, -80, -20);
      ctx.bezierCurveTo(-60, -10, -40, -15, -20, -5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-32, 6);
      ctx.bezierCurveTo(-45 + tendrilWiggle, -35, -30, -105, 0, -130);
      ctx.bezierCurveTo(30, -105, 45 - tendrilWiggle, -35, 32, 6);
      ctx.closePath();
      ctx.fill();

      // Ground tendrils
      ctx.beginPath();
      ctx.moveTo(-20, 4);
      ctx.quadraticCurveTo(-30 + fastTendril, 18, -12, 12);
      ctx.quadraticCurveTo(-5, 8, 0, 6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(15, 4);
      ctx.quadraticCurveTo(28 - fastTendril, 18, 10, 12);
      ctx.quadraticCurveTo(4, 8, 0, 6);
      ctx.fill();

      // Inner Core Mass
      ctx.fillStyle = '#090418';
      ctx.beginPath();
      ctx.ellipse(0, -65 + breath, 22, 58, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SIGNATURE EYES & OCULAR SENSORS
  // ---------------------------------------------------------------------------
  const eyePulse = Math.min(1.0, Math.max(0.4, 0.75 + Math.sin(animClock * 7) * 0.25 * eyeGlowIntensity));

  let eyeColor = `rgba(239, 68, 68, ${eyePulse})`;
  let pupilColor = '#fef08a';

  if (entitySkinId === 'entity_ashen') {
    eyeColor = `rgba(249, 115, 22, ${eyePulse})`;
    pupilColor = '#ffedd5';
  } else if (entitySkinId === 'entity_white_signal') {
    eyeColor = `rgba(56, 189, 248, ${eyePulse})`;
    pupilColor = '#ffffff';
  } else if (entitySkinId === 'entity_clock') {
    eyeColor = `rgba(250, 204, 21, ${eyePulse})`;
    pupilColor = '#fef08a';
  } else if (entitySkinId === 'entity_machine') {
    eyeColor = `rgba(249, 115, 22, ${eyePulse})`;
    pupilColor = '#facc15';
  } else if (entitySkinId === 'entity_artificial_angel') {
    eyeColor = `rgba(254, 240, 138, ${eyePulse})`;
    pupilColor = '#ffffff';
  } else if (entitySkinId === 'entity_fractured') {
    eyeColor = `rgba(168, 85, 247, ${eyePulse})`;
    pupilColor = '#22d3ee';
  } else if (entitySkinId === 'entity_archive') {
    eyeColor = `rgba(6, 182, 212, ${eyePulse})`;
    pupilColor = '#e0f2fe';
  } else if (entitySkinId === 'entity_drowned') {
    eyeColor = `rgba(45, 212, 191, ${eyePulse})`;
    pupilColor = '#ccfbf1';
  } else if (entitySkinId === 'entity_paradox') {
    eyeColor = `rgba(236, 72, 153, ${eyePulse})`;
    pupilColor = '#38bdf8';
  } else if (entitySkinId === 'entity_old_one') {
    eyeColor = `rgba(132, 204, 22, ${eyePulse})`;
    pupilColor = '#fef08a';
  } else if (entitySkinId === 'entity_cryo_phantom') {
    eyeColor = `rgba(56, 189, 248, ${eyePulse})`;
    pupilColor = '#ffffff';
  } else if (entitySkinId === 'entity_neon_parasite') {
    eyeColor = `rgba(6, 182, 212, ${eyePulse})`;
    pupilColor = '#a5f3fc';
  } else if (entitySkinId === 'entity_chitin_colossus') {
    eyeColor = `rgba(16, 185, 129, ${eyePulse})`;
    pupilColor = '#6ee7b7';
  } else if (entitySkinId === 'entity_prismatic_shard') {
    eyeColor = `rgba(192, 132, 252, ${eyePulse})`;
    pupilColor = '#fdf4ff';
  } else if (entitySkinId === 'entity_iron_bell') {
    eyeColor = `rgba(217, 119, 6, ${eyePulse})`;
    pupilColor = '#fef08a';
  } else if (entitySkinId === 'entity_wire_weaver') {
    eyeColor = `rgba(251, 191, 36, ${eyePulse})`;
    pupilColor = '#ffffff';
  } else if (entitySkinId === 'entity_solar_seraph') {
    eyeColor = `rgba(245, 158, 11, ${eyePulse})`;
    pupilColor = '#fef08a';
  }

  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 14 * eyeGlowIntensity;

  let eyeY = -105 + breath;
  let eyeX1 = -8;
  let eyeX2 = 8;

  if (stance === 'CHASING') {
    eyeY = -115 + breath;
    eyeX1 = 5;
    eyeX2 = 18;
  }

  // Render eye configurations
  if (entitySkinId === 'entity_machine') {
    // Single glowing amber horizontal industrial sensor slit
    ctx.fillRect(-12, eyeY, 24, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, eyeY + 1, 6, 2);
  } else if (entitySkinId === 'entity_redacted') {
    // No eyes rendered (obscured by top secret censor bar)
  } else if (entitySkinId === 'entity_watcher') {
    // Central primary surveillance lens + dual piercing pupils
    ctx.beginPath();
    ctx.arc(0, eyeY, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(facingRight ? 1 : -1, eyeY, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (entitySkinId === 'entity_chitin_colossus') {
    // Quad compound insectoid eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(eyeX2, eyeY - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(eyeX1 - 3, eyeY + 2, 2, 0, Math.PI * 2);
    ctx.arc(eyeX2 + 3, eyeY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (entitySkinId === 'entity_solar_seraph') {
    // Blinding central solar corona aperture
    ctx.beginPath();
    ctx.arc(0, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pupilColor;
    ctx.beginPath();
    ctx.arc(0, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Left & Right predatory eyes
    ctx.beginPath();
    ctx.ellipse(eyeX1, eyeY, 4.2, 2.6, -0.15, 0, Math.PI * 2);
    ctx.ellipse(eyeX2, eyeY, 4.2, 2.6, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Intense inner pupil
    ctx.fillStyle = pupilColor;
    ctx.shadowColor = pupilColor;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(eyeX1 + (facingRight ? 1 : -1), eyeY, 1.2, 0, Math.PI * 2);
    ctx.arc(eyeX2 + (facingRight ? 1 : -1), eyeY, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
