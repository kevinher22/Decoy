import { OrbCosmeticId } from '../types';

export function renderOrbArtefact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  orbId: OrbCosmeticId = 'orb_default',
  animTime: number = 0,
  scale: number = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const spin = animTime * 3;
  const floatY = Math.sin(animTime * 4) * 4;
  ctx.translate(0, floatY);

  if (orbId === 'orb_heart_of_null') {
    // 1. Black crystalline core pulling in light
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 18;

    // Void gravity well
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.7, '#09090b');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Geometric crystal facets
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = spin * 0.5 + (i * Math.PI) / 3;
      const rx = Math.cos(angle) * 11;
      const ry = Math.sin(angle) * 11;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();

    // Center singularity point
    ctx.fillStyle = '#f3e8ff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (orbId === 'orb_broken_clock') {
    // 2. Brass mechanical balance core with gear teeth
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Outer gear ring
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Gear teeth
    ctx.save();
    ctx.rotate(spin);
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-1.5, -14, 3, 3);
    }
    ctx.restore();

    // Clock hands
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(spin * 2) * 8, Math.sin(spin * 2) * 8);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(spin * 0.3) * 5, Math.sin(spin * 0.3) * 5);
    ctx.stroke();
  } else if (orbId === 'orb_white_signal') {
    // 3. Translucent white geometric crystal with waveform
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;

    ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    // Frequency line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(-4, Math.sin(spin * 5) * 6);
    ctx.lineTo(4, -Math.sin(spin * 5) * 6);
    ctx.lineTo(9, 0);
    ctx.stroke();
  } else if (orbId === 'orb_red_shift_core') {
    // 4. Asymmetric dimensional core with offset rings
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 20;

    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Offset Doppler ellipse
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(3, 0, 16, 8, spin, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#f87171';
    ctx.beginPath();
    ctx.ellipse(-3, 0, 14, 6, -spin * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  } else if (orbId === 'orb_angelic_failure') {
    // 5. Fragmented porcelain shell with halo arc
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 16;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Broken golden halo arc above
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -5, 15, -Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();

    // Ceramic crack
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(3, -2);
    ctx.lineTo(-2, 4);
    ctx.lineTo(2, 11);
    ctx.stroke();
  } else if (orbId === 'orb_memory_glass') {
    // 6. Translucent glass core with memory particles
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;

    ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Suspended memory shards inside
    ctx.fillStyle = '#facc15';
    for (let m = 0; m < 4; m++) {
      const ma = spin + (m * Math.PI) / 2;
      const mx = Math.cos(ma) * 5;
      const my = Math.sin(ma) * 5;
      ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
    }
  } else if (orbId === 'orb_static_heart') {
    // 7. Corrupted voxel pixel core
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-11, -11, 22, 22);

    // Random glitch pixels
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-8, -8, 6, 6);
    ctx.fillRect(2, 2, 6, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(2, -8, 6, 6);
    ctx.fillRect(-8, 2, 6, 6);
  } else if (orbId === 'orb_paradox_seed') {
    // 8. Impossible dual-centered mobius core
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 18;

    // Dual overlapping center circles
    ctx.fillStyle = 'rgba(129, 140, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(-4, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.beginPath();
    ctx.arc(4, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, spin, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Default Glowing Cyber Energy Core
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Orbital ring
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 6, spin, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
