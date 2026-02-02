// ============================================
// Crazy Fun Boxing - Effects Renderer
// Draws hit effects, particles, damage numbers
// ============================================

import { HitEffect, DamageNumber } from "@/data/boxing/types";
import { easeOutBounce } from "@/hooks/boxing/useGameLoop";

// -------------------- Types --------------------

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "spark" | "sweat" | "star";
}

// -------------------- Hit Effects --------------------

export function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  effect: HitEffect
): void {
  const elapsed = Date.now() - effect.startTime;
  const progress = Math.min(1, elapsed / effect.durationMs);

  if (progress >= 1) return;

  ctx.save();
  ctx.translate(effect.x, effect.y);

  switch (effect.type) {
    case "impact":
      drawImpactEffect(ctx, progress);
      break;
    case "block":
      drawBlockEffect(ctx, progress);
      break;
    case "crit":
      drawCritEffect(ctx, progress);
      break;
    case "miss":
      drawMissEffect(ctx, progress);
      break;
    case "stun":
      drawStunEffect(ctx, progress);
      break;
  }

  ctx.restore();
}

function drawImpactEffect(ctx: CanvasRenderingContext2D, progress: number): void {
  const scale = 1 + progress * 0.5;
  const alpha = 1 - progress;

  ctx.globalAlpha = alpha;
  ctx.scale(scale, scale);

  // Burst lines
  ctx.strokeStyle = "#FFEB3B";
  ctx.lineWidth = 4;

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const innerRadius = 10 + progress * 20;
    const outerRadius = 25 + progress * 30;

    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    ctx.stroke();
  }

  // Center flash
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, "rgba(255, 255, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlockEffect(ctx: CanvasRenderingContext2D, progress: number): void {
  const scale = 0.8 + progress * 0.4;
  const alpha = 1 - progress;

  ctx.globalAlpha = alpha;
  ctx.scale(scale, scale);

  // Shield shape
  ctx.fillStyle = "#2196F3";
  ctx.strokeStyle = "#1565C0";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(20, -15);
  ctx.lineTo(20, 10);
  ctx.lineTo(0, 25);
  ctx.lineTo(-20, 10);
  ctx.lineTo(-20, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ripple effect
  ctx.strokeStyle = "rgba(33, 150, 243, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 30 + progress * 20, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCritEffect(ctx: CanvasRenderingContext2D, progress: number): void {
  const scale = 1.2 + progress * 0.8;
  const alpha = 1 - progress;

  ctx.globalAlpha = alpha;
  ctx.scale(scale, scale);

  // Star burst
  ctx.fillStyle = "#FF5722";
  ctx.strokeStyle = "#E64A19";
  ctx.lineWidth = 3;

  // Draw star
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? 30 : 15;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner flash
  ctx.fillStyle = "#FFEB3B";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // Sparks
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + progress * 2;
    const dist = 35 + progress * 20;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 30, Math.sin(angle) * 30);
    ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
    ctx.stroke();
  }
}

function drawMissEffect(ctx: CanvasRenderingContext2D, progress: number): void {
  const alpha = 1 - progress;
  const yOffset = progress * 30;

  ctx.globalAlpha = alpha;
  ctx.translate(0, -yOffset);

  // "MISS" text
  ctx.font = "bold 24px Fredoka";
  ctx.fillStyle = "#9E9E9E";
  ctx.strokeStyle = "#616161";
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeText("MISS", 0, 0);
  ctx.fillText("MISS", 0, 0);

  // Whoosh lines
  ctx.strokeStyle = "rgba(158, 158, 158, 0.5)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const y = -10 + i * 10;
    ctx.beginPath();
    ctx.moveTo(-40, y);
    ctx.lineTo(40 - progress * 30, y);
    ctx.stroke();
  }
}

function drawStunEffect(ctx: CanvasRenderingContext2D, progress: number): void {
  const alpha = 1 - progress;
  const rotation = progress * Math.PI * 2;

  ctx.globalAlpha = alpha;
  ctx.rotate(rotation);

  // Spinning stars
  ctx.fillStyle = "#FFEB3B";
  ctx.strokeStyle = "#F9A825";
  ctx.lineWidth = 2;

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const dist = 25;

    ctx.save();
    ctx.translate(Math.cos(angle) * dist, Math.sin(angle) * dist);
    drawStarShape(ctx, 10);
    ctx.restore();
  }
}

function drawStarShape(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const outerX = Math.cos(angle) * size;
    const outerY = Math.sin(angle) * size;
    const innerAngle = angle + Math.PI / 5;
    const innerX = Math.cos(innerAngle) * (size / 2);
    const innerY = Math.sin(innerAngle) * (size / 2);

    if (i === 0) {
      ctx.moveTo(outerX, outerY);
    } else {
      ctx.lineTo(outerX, outerY);
    }
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// -------------------- Damage Numbers --------------------

export function drawDamageNumber(
  ctx: CanvasRenderingContext2D,
  dmgNum: DamageNumber
): void {
  const elapsed = Date.now() - dmgNum.startTime;
  const duration = 1000; // 1 second
  const progress = Math.min(1, elapsed / duration);

  if (progress >= 1) return;

  // Bounce up animation
  const bounce = easeOutBounce(Math.min(1, progress * 2));
  const yOffset = -bounce * 40 - progress * 20;
  const alpha = 1 - progress * 0.5;
  const scale = dmgNum.isCrit ? 1.5 : 1;

  ctx.save();
  ctx.translate(dmgNum.x, dmgNum.y + yOffset);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // Text style
  ctx.font = dmgNum.isCrit ? "bold 36px Fredoka" : "bold 28px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Color based on crit
  if (dmgNum.isCrit) {
    ctx.fillStyle = "#FF5722";
    ctx.strokeStyle = "#E64A19";
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
  }

  ctx.lineWidth = 4;
  ctx.strokeText(String(dmgNum.value), 0, 0);
  ctx.fillText(String(dmgNum.value), 0, 0);

  // Crit indicator
  if (dmgNum.isCrit) {
    ctx.font = "bold 14px Fredoka";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("CRIT!", 0, -25);
  }

  ctx.restore();
}

// -------------------- Particles --------------------

export function createParticle(
  x: number,
  y: number,
  type: Particle["type"],
  color: string
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 4;

  return {
    id: `particle-${Date.now()}-${Math.random()}`,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2, // Bias upward
    life: 1,
    maxLife: 1,
    size: type === "star" ? 8 : 4,
    color,
    type,
  };
}

export function updateParticle(particle: Particle, deltaMs: number): Particle {
  const dt = deltaMs / 16.67; // Normalize to 60fps
  const decay = 0.02;

  return {
    ...particle,
    x: particle.x + particle.vx * dt,
    y: particle.y + particle.vy * dt,
    vy: particle.vy + 0.2 * dt, // Gravity
    life: Math.max(0, particle.life - decay * dt),
  };
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle
): void {
  if (particle.life <= 0) return;

  ctx.save();
  ctx.globalAlpha = particle.life;
  ctx.translate(particle.x, particle.y);

  switch (particle.type) {
    case "spark":
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "sweat":
      ctx.fillStyle = "#87CEEB";
      ctx.beginPath();
      ctx.ellipse(0, 0, particle.size / 2, particle.size, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "star":
      ctx.fillStyle = particle.color;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      drawStarShape(ctx, particle.size);
      break;
  }

  ctx.restore();
}

// -------------------- Screen Effects --------------------

export function drawScreenShake(
  ctx: CanvasRenderingContext2D,
  intensity: number
): { offsetX: number; offsetY: number } {
  const offsetX = (Math.random() - 0.5) * intensity * 10;
  const offsetY = (Math.random() - 0.5) * intensity * 10;

  return { offsetX, offsetY };
}

export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.3
): void {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.3,
    width / 2,
    height / 2,
    width * 0.8
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawLowHealthWarning(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  healthPercent: number
): void {
  if (healthPercent > 0.3) return;

  const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
  const alpha = (0.3 - healthPercent) * pulse * 0.5;

  ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
  ctx.fillRect(0, 0, width, height);
}

// -------------------- Ring/Background --------------------

export function drawRing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#1a237e");
  bgGradient.addColorStop(1, "#000051");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Ring floor
  const ringY = height * 0.7;
  const floorGradient = ctx.createLinearGradient(0, ringY, 0, height);
  floorGradient.addColorStop(0, "#5D4037");
  floorGradient.addColorStop(1, "#3E2723");
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, ringY, width, height - ringY);

  // Ring mat
  ctx.fillStyle = "#1565C0";
  ctx.beginPath();
  ctx.moveTo(width * 0.1, ringY);
  ctx.lineTo(width * 0.9, ringY);
  ctx.lineTo(width * 0.85, height * 0.95);
  ctx.lineTo(width * 0.15, height * 0.95);
  ctx.closePath();
  ctx.fill();

  // Ring ropes
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    const ropeY = ringY - 30 - i * 25;
    ctx.beginPath();
    ctx.moveTo(width * 0.05, ropeY);
    ctx.lineTo(width * 0.95, ropeY);
    ctx.stroke();
  }

  // Corner posts
  ctx.fillStyle = "#B71C1C";
  const postWidth = 15;
  const postHeight = 100;

  // Left post
  ctx.fillRect(width * 0.08, ringY - postHeight, postWidth, postHeight);
  // Right post
  ctx.fillRect(width * 0.92 - postWidth, ringY - postHeight, postWidth, postHeight);

  // Crowd (simple dots)
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * (ringY - 100);
    ctx.beginPath();
    ctx.arc(x, y, 3 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// -------------------- Combo Counter --------------------

export function drawComboCounter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  comboCount: number
): void {
  if (comboCount < 2) return;

  const scale = 1 + Math.min(0.5, comboCount * 0.05);
  const shake = comboCount > 5 ? Math.sin(Date.now() * 0.02) * 3 : 0;

  ctx.save();
  ctx.translate(x + shake, y);
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();
  ctx.roundRect(-50, -25, 100, 50, 10);
  ctx.fill();

  // Text
  ctx.font = "bold 24px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Color based on combo size
  if (comboCount >= 10) {
    ctx.fillStyle = "#FF5722";
  } else if (comboCount >= 5) {
    ctx.fillStyle = "#FFEB3B";
  } else {
    ctx.fillStyle = "#FFFFFF";
  }

  ctx.fillText(`${comboCount} HIT!`, 0, 0);

  ctx.restore();
}
