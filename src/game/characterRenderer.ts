import { SkinId } from '../types';
import { AVAILABLE_SKINS } from './constants';
import { drawRoundRect } from '../utils/canvasHelper';

export type CharacterAction = 'idle' | 'run' | 'jump' | 'hit' | 'celebrate' | 'look_back';

/**
 * Renders an encrypted, redacted mystery silhouette for locked achievement/special skins
 * When used, shows an obscured glitch cipher.
 */
export function renderEncryptedSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  animTime: number,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const glitchShift = Math.sin(animTime * 18) * 3;
  const flicker = 0.65 + Math.sin(animTime * 25) * 0.25;

  // Dark aura
  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
  ctx.shadowBlur = 16;

  // Deep dark corrupted base silhouette
  ctx.fillStyle = '#090514';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18 + glitchShift, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Redacted censor bars across silhouette
  ctx.fillStyle = '#000000';
  ctx.fillRect(-22, -26 + Math.sin(animTime * 8) * 2, 44, 10);
  ctx.fillRect(-26, -6, 52, 14);
  ctx.fillRect(-20, 14, 40, 12);

  // Digital noise / static raster lines
  ctx.strokeStyle = `rgba(239, 68, 68, ${flicker * 0.6})`;
  ctx.lineWidth = 1.5;
  for (let i = -30; i < 30; i += 6) {
    if (Math.sin(animTime * 15 + i) > 0.1) {
      ctx.beginPath();
      ctx.moveTo(-24 + (i % 5), i);
      ctx.lineTo(24 - (i % 4), i);
      ctx.stroke();
    }
  }

  // Corrupted floating glyph / unknown symbols
  ctx.font = '9px monospace';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'center';
  ctx.fillText('???', glitchShift, -18);

  ctx.restore();
}

/**
 * Main Player Character Renderer
 * Full-fidelity, high-craft rendering pass for all 24 runner skins.
 */
export function renderCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  action: CharacterAction,
  skinId: SkinId,
  animTime: number,
  scale: number = 1,
  isEncrypted: boolean = false
) {
  if (isEncrypted) {
    renderEncryptedSilhouette(ctx, x, y, animTime, scale);
    return;
  }

  const skin = AVAILABLE_SKINS.find((s) => s.id === skinId) || AVAILABLE_SKINS[0];
  const { primary, secondary, accent, glow, trail } = skin.colors;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Transforms by action
  let tilt = 0;
  let bounce = 0;
  let alpha = 1;

  if (action === 'run') {
    bounce = Math.sin(animTime * 14) * 3.5;
    tilt = 0.09;
  } else if (action === 'jump') {
    tilt = -0.22;
    bounce = 0;
  } else if (action === 'look_back') {
    tilt = -0.06;
    bounce = Math.sin(animTime * 6) * 1.5;
  } else if (action === 'hit') {
    tilt = (animTime * 12) % (Math.PI * 2);
    alpha = 0.7 + Math.sin(animTime * 20) * 0.3;
  } else if (action === 'celebrate') {
    bounce = Math.abs(Math.sin(animTime * 8)) * -10;
    tilt = Math.sin(animTime * 6) * 0.1;
  } else {
    // idle
    bounce = Math.sin(animTime * 3) * 1.6;
  }

  // Ghost or spectral alpha
  if (skinId === 'ghost' || skinId === 'the_last_memory') {
    ctx.globalAlpha = 0.78 * alpha;
  } else {
    ctx.globalAlpha = alpha;
  }

  ctx.translate(0, bounce);
  ctx.rotate(tilt);

  // Glow shadow
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;

  // ---------------------------------------------------------------------------
  // 1. BACK ACCESSORIES, WINGS, CLOAKS, EXOSKELETONS & PROPS
  // ---------------------------------------------------------------------------

  if (skinId === 'artificial_angel' || skinId === 'broken_halo') {
    // Celestial mechanical blade-wings
    ctx.save();
    ctx.fillStyle = secondary;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    const wingFlap = Math.sin(animTime * 7) * 4;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(-34, -34 + wingFlap);
    ctx.lineTo(-24, -10);
    ctx.lineTo(-40, -18 + wingFlap);
    ctx.lineTo(-14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing
    if (skinId === 'artificial_angel') {
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(30, -30 - wingFlap);
      ctx.lineTo(20, -8);
      ctx.lineTo(36, -14 - wingFlap);
      ctx.lineTo(12, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Broken Halo: Broken shattered wing stub with sparking wire
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(18, -12);
      ctx.lineTo(14, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sparking electrical arc
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(18, -12);
      ctx.lineTo(22 + Math.sin(animTime * 20) * 3, -15);
      ctx.stroke();
    }
    ctx.restore();

  } else if (skinId === 'void_pilgrim' || skinId === 'the_drifter') {
    // Flowing traveler cloak / nomad poncho
    ctx.save();
    ctx.fillStyle = primary;
    const wave = Math.sin(animTime * 12) * 5;
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(-28 + wave, 12, -24 + wave, 28);
    ctx.lineTo(-4, 24);
    ctx.lineTo(12, 10);
    ctx.closePath();
    ctx.fill();

    // Nomad poncho hem stripes or celestial edge
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-20 + wave, 24);
    ctx.lineTo(-4, 24);
    ctx.stroke();

    if (skinId === 'void_pilgrim') {
      // Floating dark astral crystals
      ctx.fillStyle = '#c084fc';
      const c1Y = -12 + Math.sin(animTime * 5) * 4;
      ctx.fillRect(-26, c1Y, 3, 3);
      const c2Y = 6 + Math.cos(animClockSafe(animTime) * 6) * 4;
      ctx.fillRect(-22, c2Y, 2.5, 2.5);
    }
    ctx.restore();

  } else if (skinId === 'void_diver') {
    // Deep atmospheric diving tanks + umbilical life-support tubes
    ctx.save();
    ctx.fillStyle = '#042f2e';
    ctx.beginPath();
    drawRoundRect(ctx, -24, -6, 12, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-18, 4, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    // Umbilical cable arching over shoulder
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, -6);
    ctx.quadraticCurveTo(-14, -18, 0, -10);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'solar_nomad') {
    // Rotating brass astrolabe mechanism and flowing desert mantle
    ctx.save();
    const duneWave = Math.sin(animTime * 10) * 6;
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(-30 + duneWave, 10, -26 + duneWave, 28);
    ctx.lineTo(-6, 24);
    ctx.lineTo(8, 10);
    ctx.closePath();
    ctx.fill();
    // Astrolabe brass ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-18, 6, 7, 7, animTime * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'phantom_ronin') {
    // Sheathed kinetic katana on back & billowing haori split cloak
    ctx.save();
    const haoriWave = Math.sin(animTime * 14) * 6;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(-24 + haoriWave, 26);
    ctx.lineTo(-12, 22);
    ctx.lineTo(4, 10);
    ctx.closePath();
    ctx.fill();
    // Katana scabbard angled diagonally
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -18);
    ctx.lineTo(14, 24);
    ctx.stroke();
    // Red hilt cord wrapping
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-22, -18);
    ctx.lineTo(-16, -10);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'chrono_detective') {
    // High upturned noir trenchcoat tails
    ctx.save();
    const coatWave = Math.sin(animTime * 11) * 5;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-12, 4);
    ctx.quadraticCurveTo(-26 + coatWave, 16, -22 + coatWave, 32);
    ctx.lineTo(-6, 26);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

  } else if (skinId === 'neon_aristocrat') {
    // Flared midnight velvet tailcoat tails with violet trim
    ctx.save();
    const tailWave = Math.sin(animTime * 12) * 5;
    ctx.fillStyle = '#0f0e26';
    ctx.beginPath();
    ctx.moveTo(-12, 2);
    ctx.quadraticCurveTo(-28 + tailWave, 18, -26 + tailWave, 34);
    ctx.lineTo(-14, 24);
    ctx.lineTo(-4, 30);
    ctx.lineTo(6, 12);
    ctx.closePath();
    ctx.fill();
    // Silver filigree edging
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'astral_sovereign') {
    // Imperial starlight mantle + orbiting celestial rings
    ctx.save();
    const mantleWave = Math.sin(animTime * 8) * 4;
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-12, -6);
    ctx.quadraticCurveTo(-30 + mantleWave, 14, -28 + mantleWave, 32);
    ctx.lineTo(-4, 26);
    ctx.lineTo(10, 8);
    ctx.closePath();
    ctx.fill();
    // Orbiting concentric celestial rings
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 4, 22, 9, animTime * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 7, -animTime * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'glitch_weaver') {
    // Deconstructed holographic ribbon streamers
    ctx.save();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.lineWidth = 2;
    const r1 = Math.sin(animTime * 16) * 8;
    const r2 = Math.cos(animTime * 14) * 8;
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.quadraticCurveTo(-22 + r1, 12, -30 + r1, 20);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.quadraticCurveTo(-20 + r2, 18, -28 + r2, 28);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'aegis_vanguard') {
    // Hardlight shield emitter matrix on spine
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, 0, 7, 18);
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.fillRect(-16, 3, 3, 12);
    ctx.restore();

  } else if (skinId === 'cyber_courier') {
    // Aerodynamic courier harness with glowing data-conduit
    ctx.save();
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    drawRoundRect(ctx, -20, 2, 8, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, 4);
    ctx.lineTo(-16, 16);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'rust_nomad') {
    // Scavenged patchwork poncho
    ctx.save();
    const rustWave = Math.sin(animTime * 10) * 4;
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.quadraticCurveTo(-26 + rustWave, 10, -22 + rustWave, 26);
    ctx.lineTo(-4, 22);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

  } else if (skinId === 'deep_sea') {
    // Heavy dual atmospheric oxygen tanks on back
    ctx.save();
    ctx.fillStyle = secondary;
    ctx.beginPath();
    drawRoundRect(ctx, -22, -4, 10, 24, 4);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-17, 4, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Bubbles escaping from exhaust valve
    ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
    const bubY = -8 - ((animTime * 20) % 30);
    ctx.beginPath();
    ctx.arc(-19, bubY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (skinId === 'clockwork') {
    // Large brass winding key on back spine
    ctx.save();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.rect(-18, 2, 6, 6);
    ctx.arc(-21, 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (action === 'run' || action === 'jump') {
    // Agile cyber kinetic thruster trail
    ctx.save();
    ctx.fillStyle = accent;
    ctx.beginPath();
    const trailLen = action === 'jump' ? 22 : 12 + Math.sin(animTime * 20) * 4;
    ctx.moveTo(-12, 6);
    ctx.lineTo(-12 - trailLen, 10);
    ctx.lineTo(-12, 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Red Shift Doppler afterimage layers (Triple spatial displacement)
  if (skinId === 'red_shift') {
    ctx.save();
    // Far Doppler ghost
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-26, -18, 16, 36);
    ctx.fillRect(-20, -34, 14, 16);

    // Near Doppler ghost
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-18, -18, 16, 36);
    ctx.fillRect(-14, -34, 14, 16);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 2. TORSO & APPAREL CONSTRUCTION (STRUCTURAL UNIQUENESS)
  // ---------------------------------------------------------------------------
  ctx.fillStyle = primary;

  if (skinId === 'null_skin') {
    // Non-euclidean fragmented matte-black torso
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(8, -12);
    ctx.lineTo(16, 12);
    ctx.lineTo(-4, 26);
    ctx.lineTo(-16, 16);
    ctx.closePath();
    ctx.fill();

    // Floating detached negative shard orbiting
    ctx.fillStyle = '#000000';
    const shardRot = animTime * 4;
    const sx = Math.cos(shardRot) * 20;
    const sy = 4 + Math.sin(shardRot) * 10;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy);
    ctx.lineTo(sx + 4, sy - 3);
    ctx.lineTo(sx + 2, sy + 4);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'iron_witness') {
    // Heavy industrial bolted blast armor
    ctx.beginPath();
    drawRoundRect(ctx, -15, -4, 30, 28, 4);
    ctx.fill();
    ctx.fillStyle = secondary;
    ctx.fillRect(-10, 2, 20, 14);
    // Yellow/black warning hazard stripes
    ctx.fillStyle = accent;
    ctx.fillRect(-8, 6, 16, 3);
    ctx.fillRect(-8, 12, 16, 3);

  } else if (skinId === 'clockwork') {
    // Steampunk mechanical gear torso with open brass aperture
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 6);
    ctx.fill();
    // Glass window with visible spinning gear
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 8, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Spinning gear teeth
    const gearRot = animTime * 8;
    ctx.save();
    ctx.translate(0, 8);
    ctx.rotate(gearRot);
    ctx.fillStyle = accent;
    for (let g = 0; g < 6; g++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillRect(-1.5, -7.5, 3, 3);
    }
    ctx.restore();

  } else if (skinId === 'night_runner') {
    // Tactical lightweight harness & stealth vest
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 6);
    ctx.fill();
    ctx.fillStyle = secondary;
    ctx.fillRect(-10, 0, 20, 16);
    // Utility cross harness
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 16);
    ctx.moveTo(9, 0);
    ctx.lineTo(-9, 16);
    ctx.stroke();

  } else if (skinId === 'last_survivor') {
    // Ragged survivor vest with bandolier pouch
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 6);
    ctx.fill();
    ctx.fillStyle = secondary;
    ctx.fillRect(-10, 2, 20, 16);
    // Ammo / survival pouch
    ctx.fillStyle = accent;
    ctx.fillRect(-7, 10, 6, 7);
    ctx.fillRect(1, 10, 6, 7);

  } else if (skinId === 'the_archivist' || skinId === 'memory_keeper') {
    // Multi-tiered scholar / archivist coat
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 30, 6);
    ctx.fill();
    ctx.fillStyle = secondary;
    ctx.fillRect(-8, 2, 16, 18);
    // Memory shard container crystal / scroll tag
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(5, 12);
    ctx.lineTo(0, 20);
    ctx.lineTo(-5, 12);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'redacted') {
    // Erased censored torso with redaction bar
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(-16, 4, 32, 10);
    ctx.fillStyle = accent;
    ctx.fillRect(-12, 16, 8, 3);

  } else if (skinId === 'white_noise') {
    // White noise synthetic suit with TV scanlines
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-10, 0, 20, 16);
    // CRT scanline pattern
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.7)';
    ctx.lineWidth = 1.5;
    for (let sy = 2; sy < 16; sy += 3) {
      ctx.beginPath();
      ctx.moveTo(-8, sy);
      ctx.lineTo(8, sy);
      ctx.stroke();
    }

  } else if (skinId === 'static_skin') {
    // Digital corrupted raster slices across body
    ctx.fillRect(-12, -4, 24, 10);
    ctx.fillRect(-16, 6, 28, 8); // Jagged horizontal glitch offset
    ctx.fillRect(-10, 14, 22, 10);
    ctx.fillStyle = accent;
    ctx.fillRect(-6, 2, 12, 3);

  } else if (skinId === 'beyond_the_blink') {
    // The Watcher-attuned midnight chassis
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 8);
    ctx.fill();
    // Observation eye nodes on chest
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-4, 6, 1.8, 0, Math.PI * 2);
    ctx.arc(4, 6, 1.8, 0, Math.PI * 2);
    ctx.arc(0, 12, 2.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'ash_runner') {
    // Charcoal survivor suit with smoldering ember seams
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(0, 10);
    ctx.lineTo(6, 4);
    ctx.lineTo(2, 20);
    ctx.stroke();

  } else if (skinId === 'the_mirror') {
    // Liquid chrome reflective torso
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 8);
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.lineTo(10, 14);
    ctx.stroke();

  } else if (skinId === 'paradox') {
    // Split contradictory torso: half violet / half cyan
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(-12, -4, 12, 28);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, -4, 12, 28);

  } else if (skinId === 'rust_nomad') {
    // Weathered scrap leather tunic with copper rivets
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 5);
    ctx.fill();
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-10, 2, 20, 16);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-6, 6, 12, 3);
    ctx.fillRect(-6, 12, 12, 3);

  } else if (skinId === 'cyber_courier') {
    // Low-drag carbon-fiber courier vest with diagonal chest conduit
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-9, 0, 18, 16);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 16);
    ctx.stroke();

  } else if (skinId === 'void_diver') {
    // Heavy pressurized brass diving cuirass with circular glass pressure gauge
    ctx.beginPath();
    drawRoundRect(ctx, -14, -4, 28, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#134e4a';
    ctx.fillRect(-10, 0, 20, 18);
    // Pressure dial
    ctx.fillStyle = '#042f2e';
    ctx.beginPath();
    ctx.arc(0, 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

  } else if (skinId === 'glitch_weaver') {
    // Layered technical techwear vest with cybernetic buckle straps
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, 0, 20, 16);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(-8, 4, 16, 2);
    ctx.fillRect(-8, 10, 16, 2);

  } else if (skinId === 'aegis_vanguard') {
    // Reinforced ballistic shock-plate with hardlight hexagonal matrix
    ctx.beginPath();
    drawRoundRect(ctx, -14, -4, 28, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, 0, 20, 18);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-8, 2, 16, 14);

  } else if (skinId === 'solar_nomad') {
    // Desert dune linen tunic with brass sun medallion
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, 0, 20, 18);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 8, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'chrono_detective') {
    // Charcoal double-breasted waistcoat with pocket watch chain
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, 2, 20, 18);
    // Silver watch chain
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.quadraticCurveTo(0, 14, 6, 8);
    ctx.stroke();

  } else if (skinId === 'phantom_ronin') {
    // Black lacquered samurai do-cuirass with scarlet bindings
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.fillRect(-10, 0, 20, 18);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(8, 4);
    ctx.moveTo(-8, 10);
    ctx.lineTo(8, 10);
    ctx.stroke();

  } else if (skinId === 'neon_aristocrat') {
    // Regal midnight velvet vest with violet ascot
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#0f0e26';
    ctx.fillRect(-10, 0, 20, 18);
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(4, 10);
    ctx.lineTo(0, 14);
    ctx.lineTo(-4, 10);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'astral_sovereign') {
    // Deep royal indigo imperial tunic with gold cosmic constellation points
    ctx.beginPath();
    drawRoundRect(ctx, -13, -4, 26, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-10, 0, 20, 18);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 6, 2.5, 0, Math.PI * 2);
    ctx.arc(-5, 12, 1.8, 0, Math.PI * 2);
    ctx.arc(5, 12, 1.8, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'pixel') {
    ctx.fillRect(-12, -4, 24, 28);
    ctx.fillStyle = secondary;
    ctx.fillRect(-10, -2, 20, 10);

  } else {
    // Standard sleek aerodynamic chassis
    ctx.beginPath();
    drawRoundRect(ctx, -12, -4, 24, 28, 8);
    ctx.fill();

    // Chest emblem
    ctx.fillStyle = secondary;
    ctx.beginPath();
    drawRoundRect(ctx, -8, 0, 16, 16, 4);
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // 3. HEAD, HELMET, COWL, HOOD & VISOR CONSTRUCTION
  // ---------------------------------------------------------------------------
  ctx.fillStyle = primary;

  if (skinId === 'deep_sea') {
    // Spherical brass diving dome helmet
    ctx.beginPath();
    ctx.arc(0, -15, 12, 0, Math.PI * 2);
    ctx.fill();
    // Glass viewport
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(2, -14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(2, -14, 7, 0, Math.PI * 2);
    ctx.stroke();

  } else if (skinId === 'void_pilgrim') {
    // Deep pointed conical cosmic hood
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(14, -10);
    ctx.lineTo(-14, -10);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'the_drifter') {
    // Wide-brim traveler cowl
    ctx.beginPath();
    drawRoundRect(ctx, -12, -24, 24, 18, 6);
    ctx.fill();
    ctx.fillStyle = secondary;
    ctx.fillRect(-16, -12, 32, 4);

  } else if (skinId === 'fracture') {
    // Displaced floating fractured head
    const disX = Math.sin(animTime * 10) * 4;
    ctx.fillRect(-10 + disX, -28, 18, 16);

  } else if (skinId === 'null_skin') {
    // Sharp faceted void monolith head
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(8, -30);
    ctx.lineTo(12, -10);
    ctx.lineTo(-8, -8);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'last_survivor') {
    // Survivor cowl + emergency respirator mask
    ctx.beginPath();
    drawRoundRect(ctx, -10, -24, 20, 18, 6);
    ctx.fill();
    // Respirator canister
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.arc(6, -12, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'rust_nomad') {
    // Scavenged dust cowl + dual circular copper rebreathers
    ctx.beginPath();
    drawRoundRect(ctx, -11, -24, 22, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(3, -11, 3.5, 0, Math.PI * 2);
    ctx.arc(8, -11, 3.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'cyber_courier') {
    // Aerodynamic wedge helmet with rear spoiler fin
    ctx.beginPath();
    ctx.moveTo(-12, -26);
    ctx.lineTo(12, -18);
    ctx.lineTo(8, -6);
    ctx.lineTo(-12, -6);
    ctx.closePath();
    ctx.fill();
    // Aerodynamic fin
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-14, -28, 4, 8);

  } else if (skinId === 'void_diver') {
    // Heavy spherical brass diving helmet with reinforced brass bars
    ctx.beginPath();
    ctx.arc(0, -15, 13, 0, Math.PI * 2);
    ctx.fill();
    // Front face viewport with grill
    ctx.fillStyle = '#134e4a';
    ctx.beginPath();
    ctx.arc(3, -14, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, -21);
    ctx.lineTo(3, -7);
    ctx.moveTo(-4, -14);
    ctx.lineTo(10, -14);
    ctx.stroke();

  } else if (skinId === 'glitch_weaver') {
    // Loose techwear cowl with floating digital HUD projection
    ctx.beginPath();
    drawRoundRect(ctx, -12, -24, 24, 18, 7);
    ctx.fill();
    // Projected holographic reticle
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(2, -20, 10, 8);

  } else if (skinId === 'aegis_vanguard') {
    // Angular tactical heavy ballistic combat helmet
    ctx.beginPath();
    ctx.moveTo(-11, -26);
    ctx.lineTo(9, -26);
    ctx.lineTo(13, -15);
    ctx.lineTo(11, -6);
    ctx.lineTo(-11, -6);
    ctx.closePath();
    ctx.fill();
    // Comm antenna
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(-13, -33);
    ctx.stroke();

  } else if (skinId === 'solar_nomad') {
    // Nomad turban wrapped cowl with dark polarized sand goggles
    ctx.beginPath();
    drawRoundRect(ctx, -12, -26, 24, 20, 8);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-14, -18, 28, 4);

  } else if (skinId === 'chrono_detective') {
    // Wide-brim fedora hat silhouette
    ctx.beginPath();
    drawRoundRect(ctx, -10, -24, 20, 18, 5);
    ctx.fill();
    // Fedora brim & hatband
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-17, -22, 34, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-11, -24, 22, 2.5);

  } else if (skinId === 'phantom_ronin') {
    // Wide conical lacquered cyber kasa straw hat
    ctx.beginPath();
    drawRoundRect(ctx, -9, -22, 18, 16, 4);
    ctx.fill();
    // Conical hat
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(20, -18);
    ctx.lineTo(-20, -18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.2;
    ctx.stroke();

  } else if (skinId === 'neon_aristocrat') {
    // High dramatic standing collar + swept cyber aristocracy styling
    ctx.beginPath();
    drawRoundRect(ctx, -10, -24, 20, 18, 5);
    ctx.fill();
    // Standing collar
    ctx.fillStyle = '#0f0e26';
    ctx.beginPath();
    ctx.moveTo(-13, -12);
    ctx.lineTo(-15, -28);
    ctx.lineTo(-8, -20);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'astral_sovereign') {
    // Imperial starlight headwear + celestial crown
    ctx.beginPath();
    drawRoundRect(ctx, -10, -24, 20, 18, 6);
    ctx.fill();
    // Celestial crown
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-9, -24);
    ctx.lineTo(-11, -34);
    ctx.lineTo(-5, -28);
    ctx.lineTo(0, -36);
    ctx.lineTo(5, -28);
    ctx.lineTo(11, -34);
    ctx.lineTo(9, -24);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'pixel') {
    ctx.fillRect(-10, -24, 20, 18);

  } else {
    // Streamlined runner helmet
    ctx.beginPath();
    drawRoundRect(ctx, -10, -24, 20, 18, 6);
    ctx.fill();
  }

  // Halo / Crown structures
  if (skinId === 'broken_halo') {
    // Fractured tilted mechanical halo ring
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.translate(2, -30);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 1.4); // broken missing arc
    ctx.stroke();

    // Floating disconnected shard
    ctx.fillStyle = accent;
    ctx.fillRect(8, 4, 2.5, 2.5);
    ctx.restore();

  } else if (skinId === 'artificial_angel') {
    // Pristine mechanical halo ring
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, -29, 10, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (skinId === 'golden') {
    // Solar crown
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-8, -24);
    ctx.lineTo(-10, -32);
    ctx.lineTo(-4, -28);
    ctx.lineTo(0, -34);
    ctx.lineTo(4, -28);
    ctx.lineTo(10, -32);
    ctx.lineTo(8, -24);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'robot') {
    ctx.fillStyle = secondary;
    ctx.fillRect(-2, -30, 4, 6);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, -32, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // 4. VISOR & OCULAR SENSORS ("THE EYE")
  // ---------------------------------------------------------------------------
  const isLookingBack = action === 'look_back';
  const visorColor = isLookingBack ? '#ef4444' : accent;
  ctx.fillStyle = visorColor;
  ctx.shadowColor = visorColor;
  ctx.shadowBlur = isLookingBack ? 14 : 10;

  if (isLookingBack) {
    // Eye swivels to stare backwards into the darkness
    ctx.beginPath();
    drawRoundRect(ctx, -9, -18, 10, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -15, 1.8, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'redacted') {
    // Pure black censor box stamped over face
    ctx.fillStyle = '#000000';
    ctx.fillRect(-12, -19, 24, 7);

  } else if (skinId === 'white_noise' || skinId === 'static_skin') {
    // TV static interference bar
    ctx.fillRect(0, -18, 9, 5);
    ctx.fillStyle = '#ffffff';
    const staticDot = Math.sin(animTime * 30) > 0 ? 2 : 6;
    ctx.fillRect(staticDot, -17, 2, 2);

  } else if (skinId === 'deep_sea') {
    // Glowing aquamarine ocular lens inside dome
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(3, -14, 3.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'chrome_runner') {
    // Sharp high-gloss horizontal slit
    ctx.fillRect(-2, -17, 12, 3.5);

  } else if (skinId === 'null_skin') {
    // Single miniature purple singularity point
    ctx.beginPath();
    ctx.arc(2, -16, 2.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'the_archivist') {
    // Monocular magnifying brass eyepiece
    ctx.beginPath();
    ctx.arc(3, -15, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(3, -15, 1.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'beyond_the_blink') {
    // Twin unblinking crimson surveillance lenses
    ctx.beginPath();
    ctx.arc(1, -16, 2, 0, Math.PI * 2);
    ctx.arc(6, -16, 2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'phantom_ronin') {
    // Menacing horizontal crimson blade-glare optic
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillRect(-2, -18, 12, 2.5);

  } else if (skinId === 'chrono_detective') {
    // Monochromatic silver timeline eyepiece
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(4, -15, 3.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'neon_aristocrat') {
    // Refined glowing violet monocle with silver tether
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(4, -16, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

  } else if (skinId === 'astral_sovereign') {
    // Radiant golden starlight ocular constellation
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(4, -16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -16, 1.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'aegis_vanguard') {
    // Wide tactical sapphire combat HUD band
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-2, -18, 12, 4);

  } else if (skinId === 'void_diver') {
    // Luminous aquamarine pressure lens
    ctx.fillStyle = '#14b8a6';
    ctx.beginPath();
    ctx.arc(3, -14, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'solar_nomad') {
    // Mirrored amber sand-goggles
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, -17, 10, 3.5);

  } else if (skinId === 'cyber_courier') {
    // Cyan aero-visor with HUD scan dot
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, -18, 10, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, -17, 2, 2);

  } else {
    // Standard cyber aerodynamic visor
    ctx.beginPath();
    drawRoundRect(ctx, 0, -18, 9, 6, 3);
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // 5. LIMBS & RUNNING ANIMATION
  // ---------------------------------------------------------------------------
  const legCycle = animTime * 14;
  let leg1 = 0;
  let leg2 = 0;

  if (action === 'run') {
    leg1 = Math.sin(legCycle) * 11;
    leg2 = -leg1;
  } else if (action === 'jump') {
    leg1 = -7;
    leg2 = -3;
  }

  // Legs / Feet
  ctx.fillStyle = secondary;
  if (skinId === 'iron_witness') {
    // Heavy reinforced boots
    ctx.fillRect(-9, 24, 7, 8 + (action === 'run' ? leg1 : 0));
    ctx.fillRect(2, 24, 7, 8 + (action === 'run' ? leg2 : 0));

  } else if (skinId === 'the_last_memory') {
    // Dissolving legs (fades out at bottom into vapor)
    ctx.fillRect(-7, 24, 5, 4);
    ctx.fillRect(2, 24, 5, 4);

  } else {
    ctx.beginPath();
    drawRoundRect(ctx, -8, 24, 5, 7 + (action === 'run' ? leg1 : 0), 2);
    drawRoundRect(ctx, 3, 24, 5, 7 + (action === 'run' ? leg2 : 0), 2);
    ctx.fill();
  }

  ctx.restore();
}

function animClockSafe(t: number): number {
  return t || 0;
}
