import { SkinId } from '../types';
import { renderCharacter } from './characterRenderer';
import { renderConsistentEntity } from './entityVisuals';

/**
 * Animated Canvas Renderer for all 7 Ending Cinematics.
 * Replaces static images with rich, dynamic 60fps scenes featuring the player
 * and the consistent mysterious entity in customized narrative stances.
 */
export function renderEndingScene(
  ctx: CanvasRenderingContext2D,
  endingId: string,
  timeSec: number,
  playerSkin: SkinId = 'default'
): void {
  const W = 960;
  const H = 540;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  switch (endingId) {
    case 'ending_01':
      renderEscapeScene(ctx, W, H, timeSec, playerSkin);
      break;
    case 'ending_02':
      renderTruthScene(ctx, W, H, timeSec, playerSkin);
      break;
    case 'ending_03':
      renderBlinkedScene(ctx, W, H, timeSec, playerSkin);
      break;
    case 'ending_04':
      renderThingFollowsScene(ctx, W, H, timeSec, playerSkin);
      break;
    case 'ending_05':
      renderMemoryScene(ctx, W, H, timeSec, playerSkin);
      break;
    case 'ending_06':
      renderFalseEscapeScene(ctx, W, H, timeSec, playerSkin);
      break;
    case 'ending_07':
      renderDontBlinkTrueEndingScene(ctx, W, H, timeSec, playerSkin);
      break;
    default:
      renderEscapeScene(ctx, W, H, timeSec, playerSkin);
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
 * ENDING 01: THE ESCAPE
 * Runner emerges from the dark tunnel towards brilliant sunlight.
 * Behind in the archway, the entity dissolves into the shadows.
 */
function renderEscapeScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Sunlight dawn gradient
  const bg = ctx.createLinearGradient(0, 0, W, 0);
  bg.addColorStop(0, '#060913');
  bg.addColorStop(0.35, '#0f172a');
  bg.addColorStop(0.7, '#38bdf8');
  bg.addColorStop(1, '#ffffff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Blinding sun rays radiating from exit
  ctx.save();
  ctx.translate(W * 0.88, H * 0.4);
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + t * 0.05;
    ctx.rotate(0.1);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 500, angle, angle + 0.2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Silhouette of tunnel concrete archway
  ctx.fillStyle = '#060811';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W * 0.4, 0);
  ctx.bezierCurveTo(W * 0.45, H * 0.1, W * 0.48, H * 0.6, W * 0.5, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Ground platform
  ctx.fillStyle = '#0a0d18';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Glowing boundary line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.76);
  ctx.lineTo(W, H * 0.76);
  ctx.stroke();

  // Floating dust particles caught in sunlight
  for (let i = 0; i < 25; i++) {
    const px = ((i * 47 + t * 30) % (W * 0.5)) + W * 0.45;
    const py = (i * 31 + Math.sin(t + i) * 20) % (H * 0.7);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  // The Mysterious Entity in the dark tunnel threshold, dissolving peacefully
  const entityAlpha = Math.max(0.2, 0.9 - t * 0.08);
  renderConsistentEntity(ctx, 160, H * 0.74, {
    scale: 1.1,
    alpha: entityAlpha,
    stance: 'DISSOLVING',
    animTime: t,
    eyeGlowIntensity: Math.max(0.3, 1.0 - t * 0.1),
    distanceToPlayer: 400,
  });

  // Runner running towards the daylight
  const runnerX = Math.min(W * 0.82, 380 + t * 45);
  renderCharacter(ctx, runnerX, H * 0.74, 'run', skin, t, 1.1);
}

/**
 * ENDING 02: THE TRUTH
 * Cold cyber lab, scrolling telemetry data, terminal reflection on runner,
 * entity observing from behind the server racks.
 */
function renderTruthScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Dark cyber background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#020617');
  bg.addColorStop(1, '#082f49');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Server racks in background
  for (let i = 0; i < 5; i++) {
    const rx = 60 + i * 180;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(rx, 80, 120, H * 0.65);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, 80, 120, H * 0.65);

    // Blinking LEDs
    for (let j = 0; j < 6; j++) {
      const ledColor = (i + j + Math.floor(t * 3)) % 3 === 0 ? '#06b6d4' : '#10b981';
      ctx.fillStyle = ledColor;
      ctx.fillRect(rx + 15, 110 + j * 40, 8, 4);
    }
  }

  // Scrolling data streams (green/cyan matrix rain effect)
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.font = '10px monospace';
  for (let col = 0; col < 12; col++) {
    const cx = col * 80 + 30;
    for (let row = 0; row < 10; row++) {
      const cy = ((row * 30 + t * 60) % (H * 0.65)) + 80;
      const char = String.fromCharCode(48 + ((col * 7 + row * 13) % 10));
      ctx.fillText(`0x${char}F`, cx, cy);
    }
  }

  // Center Terminal Screen
  const termX = 360;
  const termY = 220;
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(termX, termY, 240, 160);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(termX, termY, 240, 160);

  // Terminal screen text glow
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('CLASSIFIED: TELEMETRY 02', termX + 20, termY + 35);
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '10px monospace';
  ctx.fillText('> SUBJECT 7: CONSCIOUSNESS SPLIT', termX + 20, termY + 65);
  ctx.fillText('> THE ENTITY IS AN ECHO', termX + 20, termY + 85);
  ctx.fillText('> PROTOCOL: OBSERVE & RECORD', termX + 20, termY + 105);

  // Ground platform
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Player studying the terminal
  renderCharacter(ctx, 420, H * 0.74, 'idle', skin, t, 1.15);

  // Entity silently standing in shadows beside server rack
  renderConsistentEntity(ctx, 740, H * 0.74, {
    scale: 1.15,
    alpha: 0.9,
    stance: 'STANDING',
    animTime: t,
    eyeGlowIntensity: 1.2,
    distanceToPlayer: 320,
  });
}

/**
 * ENDING 03: YOU BLINKED
 * Red emergency alarms flashing, horror zoom, player turned around looking back,
 * Entity looming toweringly right behind!
 */
function renderBlinkedScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Blood-red flashing emergency corridor
  const flash = Math.sin(t * 12) * 0.5 + 0.5;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1c0303');
  bg.addColorStop(1, '#450a0a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Flashing red warning hazard stripes on walls
  ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + flash * 0.2})`;
  for (let i = -5; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 90, 0);
    ctx.lineTo(i * 90 + 50, 0);
    ctx.lineTo(i * 90 + 10, H);
    ctx.lineTo(i * 90 - 40, H);
    ctx.closePath();
    ctx.fill();
  }

  // Broken warning text
  ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + flash * 0.5})`;
  ctx.font = 'bold 36px Chakra Petch, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRITICAL BREACH // RULE BROKEN', W / 2, 80);
  ctx.textAlign = 'left';

  // Ground
  ctx.fillStyle = '#0a0505';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Player centered, frozen looking back in absolute horror
  renderCharacter(ctx, 360, H * 0.74, 'look_back', skin, t, 1.25);

  // Looming Entity directly behind player, gigantic, writhing tendrils
  renderConsistentEntity(ctx, 580, H * 0.70, {
    scale: 1.5,
    alpha: 0.95,
    stance: 'CHASING',
    animTime: t * 1.5,
    eyeGlowIntensity: 1.8 + flash * 0.8,
    distanceToPlayer: 120,
  });

  // Glitch scanline bars
  for (let s = 0; s < 6; s++) {
    const gy = (Math.sin(t * 7 + s) * 0.5 + 0.5) * H;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(0, gy, W, 4 + (s % 3) * 3);
  }
}

/**
 * ENDING 04: THE THING THAT FOLLOWS
 * Quiet misty corridor, runner and entity stand face-to-face, peaceful truce.
 */
function renderThingFollowsScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Quiet blue-purple mist
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0a1a');
  bg.addColorStop(0.6, '#1e1b4b');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Ambient rolling fog banks
  for (let f = 0; f < 3; f++) {
    const fx = ((t * 20 * (f + 1)) % (W + 200)) - 100;
    const fy = H * 0.6 + f * 40;
    const fogGrad = ctx.createRadialGradient(fx, fy, 40, fx, fy, 260);
    fogGrad.addColorStop(0, 'rgba(192, 132, 252, 0.12)');
    fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
  }

  // Ground
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Player standing still on left
  renderCharacter(ctx, 360, H * 0.74, 'idle', skin, t, 1.15);

  // Entity standing quietly on right, gentle breathing eye glow, no attack
  renderConsistentEntity(ctx, 600, H * 0.74, {
    scale: 1.15,
    alpha: 0.9,
    stance: 'STANDING',
    animTime: t * 0.7,
    eyeGlowIntensity: 0.9 + Math.sin(t * 2) * 0.2,
    distanceToPlayer: 240,
  });

  // Soft glowing bridge of light particles between them
  for (let i = 0; i < 15; i++) {
    const px = 390 + (i / 15) * 180;
    const py = H * 0.65 + Math.sin(t * 3 + i) * 10;
    ctx.fillStyle = 'rgba(192, 132, 252, 0.5)';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * ENDING 05: THE MEMORY
 * Prismatic floating memory crystal shards, player reaching up, entity gliding gracefully.
 */
function renderMemoryScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Celestial indigo deep void
  const bg = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, '#172554');
  bg.addColorStop(0.7, '#090d1f');
  bg.addColorStop(1, '#030712');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 12 Floating, rotating crystalline shards
  for (let i = 0; i < 12; i++) {
    const cx = ((i * 83 + t * 15) % (W - 100)) + 50;
    const cy = H * 0.2 + ((i * 47) % (H * 0.5)) + Math.sin(t * 2 + i) * 15;
    const rot = t * 1.2 + i;
    const shardSize = 12 + (i % 3) * 6;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Glowing prism diamond
    const shardGrad = ctx.createLinearGradient(-shardSize, -shardSize, shardSize, shardSize);
    shardGrad.addColorStop(0, '#38bdf8');
    shardGrad.addColorStop(0.5, '#c084fc');
    shardGrad.addColorStop(1, '#f472b6');
    ctx.fillStyle = shardGrad;
    ctx.beginPath();
    ctx.moveTo(0, -shardSize * 1.5);
    ctx.lineTo(shardSize, 0);
    ctx.lineTo(0, shardSize * 1.5);
    ctx.lineTo(-shardSize, 0);
    ctx.closePath();
    ctx.fill();

    // Shard aura glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Platform
  ctx.fillStyle = '#0b132b';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Player reaching hand upwards towards memories
  renderCharacter(ctx, 380, H * 0.74, 'celebrate', skin, t, 1.15);

  // Entity gliding gently overhead in starlight
  const entityX = 580 + Math.sin(t * 0.8) * 30;
  const entityY = H * 0.52 + Math.cos(t * 0.8) * 15;
  renderConsistentEntity(ctx, entityX, entityY, {
    scale: 1.2,
    alpha: 0.95,
    stance: 'GLIDING',
    animTime: t,
    eyeGlowIntensity: 1.3,
    distanceToPlayer: 280,
  });
}

/**
 * ENDING 06: FALSE ESCAPE
 * Infinite perspective digital hallway with repeating doorways and entity silhouettes at each.
 */
function renderFalseEscapeScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Dark void background
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, W, H);

  const vanishX = W / 2;
  const vanishY = H * 0.48;

  // Perspective corridor grid lines
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2;
  for (let a = 0; a < 8; a++) {
    const edgeX = (a / 7) * W;
    ctx.beginPath();
    ctx.moveTo(vanishX, vanishY);
    ctx.lineTo(edgeX, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(vanishX, vanishY);
    ctx.lineTo(edgeX, 0);
    ctx.stroke();
  }

  // Recursive corridor doorframes moving forward
  for (let d = 0; d < 6; d++) {
    const distProg = ((d * 0.2 + t * 0.1) % 1.0);
    const frameW = W * 0.8 * distProg;
    const frameH = H * 0.8 * distProg;
    const fx = vanishX - frameW / 2;
    const fy = vanishY - frameH / 2;

    ctx.strokeStyle = `rgba(245, 158, 11, ${distProg * 0.6})`;
    ctx.lineWidth = 2 + distProg * 3;
    ctx.strokeRect(fx, fy, frameW, frameH);
  }

  // Ground
  ctx.fillStyle = '#0d111d';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Player at foreground archway
  renderCharacter(ctx, 280, H * 0.74, 'idle', skin, t, 1.15);

  // 3 Identical Entity Silhouettes at recurring depths
  // 1. Far depth
  renderConsistentEntity(ctx, vanishX + 20, vanishY + 30, {
    scale: 0.35,
    alpha: 0.5,
    stance: 'STANDING',
    animTime: t,
    eyeGlowIntensity: 0.8,
  });

  // 2. Medium depth
  renderConsistentEntity(ctx, vanishX + 80, H * 0.66, {
    scale: 0.7,
    alpha: 0.75,
    stance: 'STANDING',
    animTime: t,
    eyeGlowIntensity: 1.0,
  });

  // 3. Foreground depth
  renderConsistentEntity(ctx, 640, H * 0.74, {
    scale: 1.15,
    alpha: 0.95,
    stance: 'STANDING',
    animTime: t,
    eyeGlowIntensity: 1.4,
  });

  // Chromatic glitch flicker
  if (Math.sin(t * 15) > 0.85) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fillRect(0, 0, W, H);
  }
}

/**
 * ENDING 07: DON'T BLINK (TRUE ENDING)
 * Collapsed ceiling reveals celestial aurora, player and entity united as harmonized consciousness.
 */
function renderDontBlinkTrueEndingScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  skin: SkinId
): void {
  // Celestial aurora sky gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#051026');
  bg.addColorStop(0.45, '#0e2a47');
  bg.addColorStop(0.7, '#1e1b4b');
  bg.addColorStop(1, '#070b14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Aurora wave ribbons across top sky
  for (let a = 0; a < 3; a++) {
    ctx.beginPath();
    ctx.moveTo(0, 60 + a * 30);
    for (let x = 0; x <= W; x += 30) {
      const y =
        80 +
        a * 35 +
        Math.sin((x * 0.005) + t * 0.8 + a) * 35 +
        Math.cos((x * 0.01) + t * 0.5) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();

    const auroraGrad = ctx.createLinearGradient(0, 0, 0, 180);
    auroraGrad.addColorStop(0, a === 1 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.2)');
    auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auroraGrad;
    ctx.fill();
  }

  // Twinkling stars
  for (let s = 0; s < 40; s++) {
    const sx = (s * 37) % W;
    const sy = (s * 23) % (H * 0.45);
    const twinkle = Math.sin(t * 3 + s) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + (s % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden light beams spilling down from broken facility roof
  ctx.save();
  for (let b = 0; b < 4; b++) {
    const bx = 300 + b * 110;
    const beamGrad = ctx.createLinearGradient(bx, 0, bx + 60, H * 0.76);
    beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(bx - 30, 0);
    ctx.lineTo(bx + 30, 0);
    ctx.lineTo(bx + 110, H * 0.76);
    ctx.lineTo(bx + 20, H * 0.76);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Ground
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  // Player standing proudly
  renderCharacter(ctx, 390, H * 0.74, 'idle', skin, t, 1.2);

  // Entity hovering peacefully beside runner with warm golden-cyan aura
  const entityFloatY = H * 0.64 + Math.sin(t * 1.5) * 12;
  renderConsistentEntity(ctx, 600, entityFloatY, {
    scale: 1.3,
    alpha: 0.98,
    stance: 'GLIDING',
    animTime: t,
    eyeGlowIntensity: 1.5,
    distanceToPlayer: 210,
  });

  // Energy ribbons harmonizing player and entity
  ctx.save();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(410, H * 0.66);
  ctx.bezierCurveTo(480, H * 0.60 + Math.sin(t * 3) * 15, 520, H * 0.70 + Math.cos(t * 3) * 15, 580, entityFloatY);
  ctx.stroke();
  ctx.restore();
}
