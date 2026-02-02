// ============================================
// Crazy Fun Boxing - Fighter Renderer
// Draws fighters on canvas
// ============================================

import { FighterRuntimeState, FighterId, CostumeId } from "@/data/boxing/types";

// -------------------- Types --------------------

export interface FighterRenderConfig {
  width: number;
  height: number;
  groundY: number;
}

interface FighterColors {
  body: string;
  gloves: string;
  shorts: string;
  accent: string;
}

// -------------------- Color Definitions --------------------

const FIGHTER_COLORS: Record<FighterId, FighterColors> = {
  rocky: {
    body: "#FFD1A4",
    gloves: "#E63946",
    shorts: "#1D3557",
    accent: "#457B9D",
  },
  flash: {
    body: "#F4D35E",
    gloves: "#F7B801",
    shorts: "#7209B7",
    accent: "#3A0CA3",
  },
  bruno: {
    body: "#8D6346",
    gloves: "#2D6A4F",
    shorts: "#40916C",
    accent: "#95D5B2",
  },
  phoenix: {
    body: "#FF6B35",
    gloves: "#FF0000",
    shorts: "#FFA500",
    accent: "#FFD700",
  },
};

const COSTUME_OVERRIDES: Partial<Record<CostumeId, Partial<FighterColors>>> = {
  chicken: { body: "#FFEB3B", accent: "#FF5722" },
  knight: { body: "#9E9E9E", gloves: "#757575", accent: "#BDBDBD" },
  banana: { shorts: "#FFEB3B", accent: "#FFC107" },
  astronaut: { body: "#FFFFFF", shorts: "#E0E0E0", accent: "#2196F3" },
  disco: { gloves: "#E040FB", shorts: "#7C4DFF", accent: "#00E5FF" },
  superhero: { gloves: "#F44336", shorts: "#3F51B5", accent: "#FFEB3B" },
};

// -------------------- Fighter Drawing --------------------

export function drawFighter(
  ctx: CanvasRenderingContext2D,
  fighter: FighterRuntimeState,
  config: FighterRenderConfig,
  isPlayer: boolean
): void {
  const { x, y, facingRight, state, animationFrame } = fighter;

  // Get colors
  const baseColors = FIGHTER_COLORS[fighter.fighterId];
  const costumeOverride = COSTUME_OVERRIDES[fighter.costumeId] || {};
  const colors = { ...baseColors, ...costumeOverride };

  ctx.save();

  // Apply position
  ctx.translate(x, y);

  // Flip for facing direction
  if (!facingRight) {
    ctx.scale(-1, 1);
  }

  // Apply state-based transformations
  applyStateTransform(ctx, state, animationFrame, fighter);

  // Draw shadow
  drawShadow(ctx, state);

  // Draw body parts
  drawLegs(ctx, colors, state, animationFrame);
  drawBody(ctx, colors, state);
  drawArms(ctx, colors, state, animationFrame, fighter);
  drawHead(ctx, colors, state, fighter);
  drawGloves(ctx, colors, state, animationFrame, fighter);

  // Draw effects based on state
  drawStateEffects(ctx, fighter, colors);

  ctx.restore();
}

// -------------------- State Transformations --------------------

function applyStateTransform(
  ctx: CanvasRenderingContext2D,
  state: FighterRuntimeState["state"],
  frame: number,
  fighter: FighterRuntimeState
): void {
  switch (state) {
    case "stunned":
      // Wobble effect
      const wobble = Math.sin(frame * 0.3) * 5;
      ctx.rotate((wobble * Math.PI) / 180);
      break;

    case "knocked_down":
      // Fall over
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, 30);
      break;

    case "dodging":
      // Lean in dodge direction
      const leanAmount = fighter.dodgeDirection === "left" ? -15 : 15;
      ctx.rotate((leanAmount * Math.PI) / 180);
      break;

    case "blocking":
      // Slight crouch
      ctx.translate(0, 5);
      break;
  }
}

// -------------------- Shadow --------------------

function drawShadow(
  ctx: CanvasRenderingContext2D,
  state: FighterRuntimeState["state"]
): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();

  const shadowWidth = state === "knocked_down" ? 60 : 40;
  const shadowHeight = state === "knocked_down" ? 15 : 10;

  ctx.ellipse(0, 60, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
  ctx.fill();
}

// -------------------- Body Parts --------------------

function drawBody(
  ctx: CanvasRenderingContext2D,
  colors: FighterColors,
  state: FighterRuntimeState["state"]
): void {
  // Torso
  ctx.fillStyle = colors.body;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  // Body shape
  ctx.beginPath();
  ctx.moveTo(-20, -30);
  ctx.lineTo(-25, 20);
  ctx.lineTo(25, 20);
  ctx.lineTo(20, -30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shorts
  ctx.fillStyle = colors.shorts;
  ctx.beginPath();
  ctx.moveTo(-25, 15);
  ctx.lineTo(-30, 45);
  ctx.lineTo(-5, 45);
  ctx.lineTo(0, 25);
  ctx.lineTo(5, 45);
  ctx.lineTo(30, 45);
  ctx.lineTo(25, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawLegs(
  ctx: CanvasRenderingContext2D,
  colors: FighterColors,
  state: FighterRuntimeState["state"],
  frame: number
): void {
  ctx.fillStyle = colors.body;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  // Animation offset based on state
  let leftOffset = 0;
  let rightOffset = 0;

  if (state === "attacking") {
    leftOffset = Math.sin(frame * 0.5) * 3;
    rightOffset = -Math.sin(frame * 0.5) * 3;
  }

  // Left leg
  ctx.beginPath();
  ctx.moveTo(-20 + leftOffset, 45);
  ctx.lineTo(-15 + leftOffset, 70);
  ctx.lineTo(-25 + leftOffset, 70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(20 + rightOffset, 45);
  ctx.lineTo(15 + rightOffset, 70);
  ctx.lineTo(25 + rightOffset, 70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawArms(
  ctx: CanvasRenderingContext2D,
  colors: FighterColors,
  state: FighterRuntimeState["state"],
  frame: number,
  fighter: FighterRuntimeState
): void {
  ctx.fillStyle = colors.body;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  // Arm positions based on state
  let leftArmAngle = -30;
  let rightArmAngle = -30;
  let leftArmLength = 35;
  let rightArmLength = 35;

  switch (state) {
    case "attacking":
      // Punch animation
      if (fighter.currentAction?.includes("left")) {
        leftArmAngle = 0;
        leftArmLength = 50;
      } else if (fighter.currentAction?.includes("right")) {
        rightArmAngle = 0;
        rightArmLength = 50;
      } else {
        // Both arms for combo/power
        leftArmAngle = -10;
        rightArmAngle = -10;
        leftArmLength = 45;
        rightArmLength = 45;
      }
      break;

    case "blocking":
      // Guard position
      leftArmAngle = -60;
      rightArmAngle = -60;
      leftArmLength = 30;
      rightArmLength = 30;
      break;

    case "idle":
      // Slight bob
      const bob = Math.sin(frame * 0.1) * 2;
      leftArmAngle = -30 + bob;
      rightArmAngle = -30 - bob;
      break;
  }

  // Left arm
  ctx.save();
  ctx.translate(-25, -15);
  ctx.rotate((leftArmAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.roundRect(-5, 0, 10, leftArmLength, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(25, -15);
  ctx.rotate((rightArmAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.roundRect(-5, 0, 10, rightArmLength, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGloves(
  ctx: CanvasRenderingContext2D,
  colors: FighterColors,
  state: FighterRuntimeState["state"],
  frame: number,
  fighter: FighterRuntimeState
): void {
  ctx.fillStyle = colors.gloves;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  // Glove positions based on state
  let leftGloveX = -35;
  let leftGloveY = 15;
  let rightGloveX = 35;
  let rightGloveY = 15;
  const gloveSize = 18;

  switch (state) {
    case "attacking":
      if (fighter.currentAction?.includes("left")) {
        leftGloveX = -20;
        leftGloveY = -20;
      } else if (fighter.currentAction?.includes("right")) {
        rightGloveX = 20;
        rightGloveY = -20;
      } else {
        leftGloveX = -15;
        leftGloveY = -10;
        rightGloveX = 15;
        rightGloveY = -10;
      }
      break;

    case "blocking":
      leftGloveX = -15;
      leftGloveY = -25;
      rightGloveX = 15;
      rightGloveY = -25;
      break;

    case "idle":
      const bob = Math.sin(frame * 0.1) * 3;
      leftGloveY += bob;
      rightGloveY -= bob;
      break;
  }

  // Left glove
  ctx.beginPath();
  ctx.arc(leftGloveX, leftGloveY, gloveSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right glove
  ctx.beginPath();
  ctx.arc(rightGloveX, rightGloveY, gloveSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  colors: FighterColors,
  state: FighterRuntimeState["state"],
  fighter: FighterRuntimeState
): void {
  ctx.fillStyle = colors.body;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  // Head
  ctx.beginPath();
  ctx.arc(0, -50, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  const eyeOffsetX = state === "stunned" ? Math.random() * 4 - 2 : 0;
  ctx.fillStyle = "#000";

  // Left eye
  ctx.beginPath();
  ctx.arc(-8 + eyeOffsetX, -55, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.arc(8 + eyeOffsetX, -55, 4, 0, Math.PI * 2);
  ctx.fill();

  // Expression based on state
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();

  switch (state) {
    case "stunned":
      // Dizzy X eyes
      ctx.moveTo(-12, -58);
      ctx.lineTo(-4, -52);
      ctx.moveTo(-12, -52);
      ctx.lineTo(-4, -58);
      ctx.moveTo(4, -58);
      ctx.lineTo(12, -52);
      ctx.moveTo(4, -52);
      ctx.lineTo(12, -58);
      break;

    case "attacking":
      // Determined mouth
      ctx.moveTo(-10, -40);
      ctx.lineTo(10, -40);
      ctx.lineTo(5, -35);
      ctx.lineTo(-5, -35);
      ctx.closePath();
      break;

    case "victory":
      // Big smile
      ctx.arc(0, -45, 12, 0.2, Math.PI - 0.2);
      break;

    case "defeat":
      // Sad mouth
      ctx.arc(0, -35, 8, Math.PI + 0.3, -0.3);
      break;

    default:
      // Neutral mouth
      ctx.moveTo(-6, -42);
      ctx.lineTo(6, -42);
  }

  ctx.stroke();
}

// -------------------- State Effects --------------------

function drawStateEffects(
  ctx: CanvasRenderingContext2D,
  fighter: FighterRuntimeState,
  colors: FighterColors
): void {
  // Fury mode effect (Phoenix)
  if (fighter.currentHealth / fighter.maxHealth <= 0.3) {
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
    ctx.fillStyle = "#FF4500";
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Stun stars
  if (fighter.isStunned) {
    drawStunStars(ctx, Date.now());
  }

  // Overheat steam
  if (fighter.isOverheated) {
    drawOverheatSteam(ctx, Date.now());
  }

  // Charge indicator
  if (fighter.chargeLevel > 0) {
    drawChargeIndicator(ctx, fighter.chargeLevel, colors);
  }
}

function drawStunStars(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  for (let i = 0; i < 3; i++) {
    const angle = (time * 0.003 + (i * Math.PI * 2) / 3) % (Math.PI * 2);
    const x = Math.cos(angle) * 35;
    const y = -60 + Math.sin(angle) * 10;

    drawStar(ctx, x, y, 8);
  }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const outerX = x + Math.cos(angle) * size;
    const outerY = y + Math.sin(angle) * size;
    const innerAngle = angle + Math.PI / 5;
    const innerX = x + Math.cos(innerAngle) * (size / 2);
    const innerY = y + Math.sin(innerAngle) * (size / 2);

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

function drawOverheatSteam(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "rgba(255, 100, 100, 0.5)";

  for (let i = 0; i < 5; i++) {
    const offset = (time * 0.002 + i * 0.5) % 2;
    const x = -20 + i * 10 + Math.sin(time * 0.005 + i) * 5;
    const y = -70 - offset * 30;
    const size = 5 + offset * 3;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawChargeIndicator(
  ctx: CanvasRenderingContext2D,
  chargeLevel: number,
  colors: FighterColors
): void {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 4;

  // Draw charging circle
  ctx.beginPath();
  ctx.arc(0, 0, 60, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * chargeLevel);
  ctx.stroke();

  ctx.restore();
}

// -------------------- Exports --------------------

export function getFighterColors(fighterId: FighterId, costumeId: CostumeId): FighterColors {
  const base = FIGHTER_COLORS[fighterId];
  const override = COSTUME_OVERRIDES[costumeId] || {};
  return { ...base, ...override };
}
