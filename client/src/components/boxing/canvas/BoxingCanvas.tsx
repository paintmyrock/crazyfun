// ============================================
// Crazy Fun Boxing - Main Canvas Component
// ============================================

import { useRef, useEffect, useCallback } from "react";
import { MatchState, HitEffect, DamageNumber } from "@/data/boxing/types";
import { drawFighter, FighterRenderConfig } from "./FighterRenderer";
import {
  drawHitEffect,
  drawDamageNumber,
  drawRing,
  drawComboCounter,
  drawLowHealthWarning,
  drawVignette,
  drawScreenShake,
  Particle,
  drawParticle,
  updateParticle,
} from "./EffectsRenderer";

// -------------------- Types --------------------

interface BoxingCanvasProps {
  matchState: MatchState;
  width?: number;
  height?: number;
  screenShake?: number;
  className?: string;
}

// -------------------- Component --------------------

export function BoxingCanvas({
  matchState,
  width = 400,
  height = 600,
  screenShake = 0,
  className = "",
}: BoxingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastRenderRef = useRef<number>(0);

  const config: FighterRenderConfig = {
    width,
    height,
    groundY: height * 0.75,
  };

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = Date.now();
    const deltaMs = now - lastRenderRef.current;
    lastRenderRef.current = now;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply screen shake
    ctx.save();
    if (screenShake > 0) {
      const { offsetX, offsetY } = drawScreenShake(ctx, screenShake);
      ctx.translate(offsetX, offsetY);
    }

    // Draw ring background
    drawRing(ctx, width, height);

    // Update and draw particles
    particlesRef.current = particlesRef.current
      .map((p) => updateParticle(p, deltaMs))
      .filter((p) => p.life > 0);

    for (const particle of particlesRef.current) {
      drawParticle(ctx, particle);
    }

    // Draw fighters
    // Opponent (top)
    const opponentState = {
      ...matchState.opponent,
      x: width * 0.7,
      y: config.groundY - 70,
    };
    drawFighter(ctx, opponentState, config, false);

    // Player (bottom)
    const playerState = {
      ...matchState.player,
      x: width * 0.3,
      y: config.groundY - 20,
    };
    drawFighter(ctx, playerState, config, true);

    // Draw hit effects
    for (const effect of matchState.hitEffects) {
      if (isEffectActive(effect)) {
        drawHitEffect(ctx, effect);
      }
    }

    // Draw damage numbers
    for (const dmgNum of matchState.damageNumbers) {
      if (isDamageNumberActive(dmgNum)) {
        drawDamageNumber(ctx, dmgNum);
      }
    }

    // Draw combo counter for player
    if (matchState.player.comboCount > 1) {
      drawComboCounter(ctx, width * 0.5, height * 0.15, matchState.player.comboCount);
    }

    // Draw low health warning
    const playerHealthPercent = matchState.player.currentHealth / matchState.player.maxHealth;
    drawLowHealthWarning(ctx, width, height, playerHealthPercent);

    // Draw phase-specific overlays
    drawPhaseOverlay(ctx, matchState, width, height);

    // Draw vignette
    drawVignette(ctx, width, height, 0.2);

    ctx.restore();
  }, [matchState, width, height, config, screenShake]);

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    lastRenderRef.current = Date.now();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [render]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual canvas size
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`touch-none ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

// -------------------- Helper Functions --------------------

function isEffectActive(effect: HitEffect): boolean {
  const elapsed = Date.now() - effect.startTime;
  return elapsed < effect.durationMs;
}

function isDamageNumberActive(dmgNum: DamageNumber): boolean {
  const elapsed = Date.now() - dmgNum.startTime;
  return elapsed < 1000; // 1 second duration
}

function drawPhaseOverlay(
  ctx: CanvasRenderingContext2D,
  matchState: MatchState,
  width: number,
  height: number
): void {
  switch (matchState.phase) {
    case "countdown":
      drawCountdown(ctx, matchState, width, height);
      break;
    case "ko":
      drawKO(ctx, width, height);
      break;
    case "round_end":
      drawRoundEnd(ctx, matchState, width, height);
      break;
    case "match_end":
      drawMatchEnd(ctx, matchState, width, height);
      break;
    case "finisher":
      drawFinisherPrompt(ctx, matchState, width, height);
      break;
    case "paused":
      drawPaused(ctx, width, height);
      break;
  }
}

function drawCountdown(
  ctx: CanvasRenderingContext2D,
  matchState: MatchState,
  width: number,
  height: number
): void {
  const elapsed = Date.now() - matchState.matchStartTime;
  const countdown = Math.ceil((3000 - elapsed) / 1000);

  if (countdown <= 0) return;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 120px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;

  const text = countdown > 0 ? String(countdown) : "FIGHT!";
  const scale = 1 + (elapsed % 1000) / 1000 * 0.2;

  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawKO(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();

  // Slow-mo effect (darker)
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, width, height);

  // KO text
  ctx.font = "bold 100px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const gradient = ctx.createLinearGradient(width / 2 - 100, 0, width / 2 + 100, 0);
  gradient.addColorStop(0, "#FF5722");
  gradient.addColorStop(0.5, "#FFEB3B");
  gradient.addColorStop(1, "#FF5722");

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;

  ctx.strokeText("K.O.!", width / 2, height / 2);
  ctx.fillText("K.O.!", width / 2, height / 2);

  ctx.restore();
}

function drawRoundEnd(
  ctx: CanvasRenderingContext2D,
  matchState: MatchState,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 48px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";

  ctx.fillText(`Round ${matchState.round} Over`, width / 2, height / 2 - 30);

  ctx.font = "32px Fredoka";
  ctx.fillText(
    `${matchState.playerRoundWins} - ${matchState.opponentRoundWins}`,
    width / 2,
    height / 2 + 30
  );

  ctx.restore();
}

function drawMatchEnd(
  ctx: CanvasRenderingContext2D,
  matchState: MatchState,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 64px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const isWinner = matchState.winner === "player";
  ctx.fillStyle = isWinner ? "#4CAF50" : "#F44336";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 6;

  const text = isWinner ? "VICTORY!" : "DEFEAT";
  ctx.strokeText(text, width / 2, height / 2);
  ctx.fillText(text, width / 2, height / 2);

  ctx.restore();
}

function drawFinisherPrompt(
  ctx: CanvasRenderingContext2D,
  matchState: MatchState,
  width: number,
  height: number
): void {
  if (!matchState.isFinisherWindow || !matchState.finisherGesture) return;

  ctx.save();

  // Dim background
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, width, height);

  // Prompt box
  ctx.fillStyle = "rgba(255, 152, 0, 0.9)";
  ctx.beginPath();
  ctx.roundRect(width * 0.1, height * 0.3, width * 0.8, height * 0.3, 20);
  ctx.fill();

  // Border
  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Title
  ctx.font = "bold 28px Fredoka";
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("FINISH HIM!", width / 2, height * 0.38);

  // Time remaining
  const timePercent = matchState.finisherTimeRemaining / 5000;
  ctx.fillStyle = "#E65100";
  ctx.fillRect(width * 0.15, height * 0.55, width * 0.7 * timePercent, 10);

  ctx.restore();
}

function drawPaused(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 48px Fredoka";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("PAUSED", width / 2, height / 2);

  ctx.restore();
}

export default BoxingCanvas;
