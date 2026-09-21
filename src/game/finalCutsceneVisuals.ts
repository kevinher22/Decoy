import { SkinId } from '../types';
import { renderCharacter } from './characterRenderer';
import { renderConsistentEntity } from './entityVisuals';

/**
 * Animated Canvas Renderer for the Final Story Cutscene (Unlocked after all 7 Endings).
 * Renders high-fidelity cinematic shots showcasing the player and the unified mysterious entity.
 */
export function renderFinalStoryScene(
  ctx: CanvasRenderingContext2D,
  shotIndex: number,
  timeSec: number,
  playerSkin: SkinId = 'default'
): void {
  const W = 960;
  const H = 540;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  switch (shotIndex) {
    case 1: // Shot 2: Initial silent corridor
      renderSilentCorridorShot(ctx, W, H, timeSec, playerSkin);
      break;
    case 2: // Shot 3: Entity appears peacefully
      renderEntityAppearanceShot(ctx, W, H, timeSec, playerSkin);
      break;
    case 3: // Shot 4: Confrontation without fear
      renderPeacefulConfrontationShot(ctx, W, H, timeSec, playerSkin);
      break;
    case 4: // Shot 5: Memory convergence & neural link
      renderMemoryConvergenceShot(ctx, W, H, timeSec, playerSkin);
      break;
    case 5: // Shot 6: Dramatic close-up reveal dialogue
      renderEntityRevealDialogueShot(ctx, W, H, timeSec);
      break;
    case 6: // Shot 7: The story continues...
      renderStoryContinuesShot(ctx, W, H, timeSec);
      break;
    default:
      renderSilentCorridorShot(ctx, W, H, timeSec, playerSkin);
      break;
  }

  // Cinematic Letterbox Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.7);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
}

/**
 * SHOT 2: Initial corridor from the opening cutscene.
 * Total silence, alarms dead, runner standing alone.
 */
function renderSilentCorridorShot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Cold, dark corridor
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#040711');
  bg.addColorStop(0.6, '#0b1329');
  bg.addColorStop(1, '#03050a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Distant corridor archways
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const scale = 0.3 + i * 0.14;
    const fw = W * scale;
    const fh = H * scale;
    ctx.strokeRect((W - fw) / 2, (H - fh) / 2 - 20, fw, fh);
  }

  // Still emergency lamps (inactive / dim cyan)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.beginPath();
  ctx.arc(W * 0.2, 80, 4, 0, Math.PI * 2);
  ctx.arc(W * 0.8, 80, 4, 0, Math.PI * 2);
  ctx.fill();

  // Floor
  ctx.fillStyle = '#080c18';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Runner alone in the center
  renderCharacter(ctx, W / 2 - 40, H * 0.74, 'idle', skin, t, 1.2);
}

/**
 * SHOT 3: Entity appears in the hallway.
 * It does not chase; it simply stands there peacefully.
 */
function renderEntityAppearanceShot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Ambient hallway
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#040714');
  bg.addColorStop(0.6, '#0f172a');
  bg.addColorStop(1, '#050811');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#090e1b';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Runner on the left
  renderCharacter(ctx, 320, H * 0.74, 'idle', skin, t, 1.2);

  // Mysterious Entity appearing on the right
  const manifestAlpha = Math.min(1.0, t * 0.8 + 0.3);
  renderConsistentEntity(ctx, 640, H * 0.74, {
    scale: 1.2,
    alpha: manifestAlpha,
    stance: 'STANDING',
    animTime: t,
    eyeGlowIntensity: 1.0,
    distanceToPlayer: 320,
  });

  // Soft atmospheric particles between them
  for (let i = 0; i < 15; i++) {
    const px = 360 + (i / 15) * 260;
    const py = H * 0.65 + Math.sin(t * 2 + i) * 12;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * SHOT 4: Runner steps forward and faces the entity directly.
 * No fear, no running.
 */
function renderPeacefulConfrontationShot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Rich midnight indigo backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#060d21');
  bg.addColorStop(0.7, '#1e1b4b');
  bg.addColorStop(1, '#050711');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#0c1222';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Runner closer on left
  renderCharacter(ctx, 390, H * 0.74, 'idle', skin, t, 1.25);

  // Entity floating gently on right
  const floatY = H * 0.68 + Math.sin(t * 1.5) * 10;
  renderConsistentEntity(ctx, 570, floatY, {
    scale: 1.25,
    alpha: 0.98,
    stance: 'GLIDING',
    animTime: t,
    eyeGlowIntensity: 1.2,
    distanceToPlayer: 180,
  });
}

/**
 * SHOT 5: Memory convergence.
 * Shards circle between runner and entity, golden and cyan light connects them.
 */
function renderMemoryConvergenceShot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Deep cosmic indigo
  const bg = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, W * 0.6);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.6, '#0b132b');
  bg.addColorStop(1, '#030712');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // 7 Orbiting Story Crystals between player and entity
  const centerX = 480;
  const centerY = H * 0.58;
  const orbitRadius = 90;

  for (let i = 0; i < 7; i++) {
    const angle = t * 1.5 + (i * Math.PI * 2) / 7;
    const cx = centerX + Math.cos(angle) * orbitRadius;
    const cy = centerY + Math.sin(angle) * (orbitRadius * 0.5);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();

    // Shard light beam to center
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(centerX - cx, centerY - cy);
    ctx.stroke();

    ctx.restore();
  }

  // Runner
  renderCharacter(ctx, 350, H * 0.74, 'idle', skin, t, 1.25);

  // Entity
  renderConsistentEntity(ctx, 610, H * 0.68, {
    scale: 1.3,
    alpha: 1.0,
    stance: 'GLIDING',
    animTime: t,
    eyeGlowIntensity: 1.5,
    distanceToPlayer: 260,
  });

  // Connecting neural aurora thread
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(370, H * 0.65);
  ctx.bezierCurveTo(440, H * 0.45, 520, H * 0.45, 590, H * 0.65);
  ctx.stroke();
}

/**
 * SHOT 6: Dramatic close-up on the entity's face and eyes.
 * Quiet revelation dialogue.
 */
function renderEntityRevealDialogueShot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number
): void {
  // Void blackness with cosmic nebula swirls
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, W, H);

  // Nebula swirl
  const neb = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 350);
  neb.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
  neb.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
  neb.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);

  // Close-up Entity silhouette dominating the frame
  renderConsistentEntity(ctx, W / 2, H * 0.85, {
    scale: 2.2,
    alpha: 0.98,
    stance: 'STANDING',
    animTime: t,
    eyeGlowIntensity: 1.8 + Math.sin(t * 3) * 0.3,
    distanceToPlayer: 100,
  });
}

/**
 * SHOT 7: Blinding white/gold dimensional convergence.
 * DON'T BLINK // THE STORY CONTINUES...
 */
function renderStoryContinuesShot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number
): void {
  // Expanding radiant golden sunrise
  const bg = ctx.createRadialGradient(W / 2, H / 2, 20 + t * 40, W / 2, H / 2, W * 0.8);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.3, '#fde68a');
  bg.addColorStop(0.6, '#0284c7');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Light rays radiating outward
  ctx.save();
  ctx.translate(W / 2, H / 2);
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 + t * 0.08;
    ctx.rotate(0.05);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 600, angle, angle + 0.15);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Floating embers of light
  for (let i = 0; i < 35; i++) {
    const ex = (i * 37 + t * 25) % W;
    const ey = (i * 19 + Math.sin(t + i) * 30) % H;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.beginPath();
    ctx.arc(ex, ey, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}
