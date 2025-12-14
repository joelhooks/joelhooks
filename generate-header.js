#!/usr/bin/env node

/**
 * Generates mood-specific generative art SVG headers
 * Each mood has unique shapes, animations, and visual language
 */

const WIDTH = 800;
const HEIGHT = 200;

// Get mood from command line or default to random
const MOOD = process.argv[2] || "random";

const MOODS = {
  cyberpunk: {
    palette: ["#ff006e", "#00f5ff", "#ff00ff", "#7d00ff", "#39ff14"],
    bg: "#0a0a0f",
    style: "glitch",
    shapes: ["scanlines", "glitchBlocks", "dataStreams", "hexagons"],
    glow: 4,
    animSpeed: "fast",
  },
  neon: {
    palette: ["#ff006e", "#00f5ff", "#ff00ff", "#7d00ff", "#00ff9f"],
    bg: "#0d0d0d",
    style: "glow",
    shapes: ["tubes", "rings", "sparks", "lines"],
    glow: 6,
    animSpeed: "medium",
  },
  nature: {
    palette: ["#2d5a27", "#4a7c59", "#8fbc8f", "#c9e4ca", "#f0fff0"],
    bg: "#0d1117",
    style: "organic",
    shapes: ["leaves", "branches", "particles", "waves"],
    glow: 2,
    animSpeed: "slow",
  },
  ocean: {
    palette: ["#006994", "#40a4c8", "#89cff0", "#b0e0e6", "#e0ffff"],
    bg: "#0a1628",
    style: "fluid",
    shapes: ["waves", "bubbles", "ripples", "foam"],
    glow: 3,
    animSpeed: "slow",
  },
  sunset: {
    palette: ["#ff4500", "#ff6b35", "#f7c59f", "#efa48b", "#d4a5a5"],
    bg: "#1a0a0a",
    style: "warm",
    shapes: ["horizonLayers", "sunRays", "clouds", "birds"],
    glow: 3,
    animSpeed: "slow",
  },
  minimal: {
    palette: ["#ffffff", "#e0e0e0", "#a0a0a0", "#606060", "#303030"],
    bg: "#0d1117",
    style: "clean",
    shapes: ["geometricLines", "dots", "circles"],
    glow: 1,
    animSpeed: "slow",
  },
  cosmic: {
    palette: ["#4a0080", "#7b2cbf", "#9d4edd", "#c77dff", "#e0aaff"],
    bg: "#05010d",
    style: "ethereal",
    shapes: ["nebulae", "stars", "galaxySwirls", "constellations"],
    glow: 5,
    animSpeed: "slow",
  },
  random: null, // Will be assigned randomly
};

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(random(min, max));
}

function pick(arr) {
  return arr[randomInt(0, arr.length)];
}

function getMood() {
  if (MOOD === "random" || !MOODS[MOOD]) {
    const moods = Object.keys(MOODS).filter((m) => m !== "random");
    return MOODS[pick(moods)];
  }
  return MOODS[MOOD];
}

// Shape generators
function generateBlob(cx, cy, radius, points, variance) {
  const angleStep = (Math.PI * 2) / points;
  const pathPoints = [];
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    const r = radius + random(-variance, variance);
    pathPoints.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
  for (let i = 0; i < pathPoints.length; i++) {
    const p0 = pathPoints[(i - 1 + pathPoints.length) % pathPoints.length];
    const p1 = pathPoints[i];
    const p2 = pathPoints[(i + 1) % pathPoints.length];
    const p3 = pathPoints[(i + 2) % pathPoints.length];
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d + " Z";
}

function generateWave(startY, amplitude, frequency, phase = 0) {
  let d = `M -10 ${startY}`;
  for (let x = 0; x <= WIDTH + 20; x += 10) {
    const y = startY + Math.sin(x * frequency + phase) * amplitude;
    d += ` L ${x} ${y}`;
  }
  return d;
}

function generateHexagon(cx, cy, size) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(
      `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`,
    );
  }
  return `M ${points.join(" L ")} Z`;
}

function generateStar(cx, cy, outerR, innerR, points) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d + " Z";
}

function generateSpiral(cx, cy, maxR, turns) {
  let d = `M ${cx} ${cy}`;
  for (let i = 0; i <= turns * 360; i += 5) {
    const angle = (i * Math.PI) / 180;
    const r = (i / (turns * 360)) * maxR;
    d += ` L ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)}`;
  }
  return d;
}

// Style-specific element generators
function generateCyberpunkElements(palette) {
  let elements = "";

  // Scanlines
  for (let y = 0; y < HEIGHT; y += 4) {
    if (Math.random() > 0.7) {
      elements += `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${palette[0]}" stroke-width="0.5" opacity="${random(0.05, 0.15)}" />\n`;
    }
  }

  // Glitch blocks
  for (let i = 0; i < 8; i++) {
    const x = random(0, WIDTH);
    const y = random(0, HEIGHT);
    const w = random(20, 100);
    const h = random(2, 8);
    const color = pick(palette);
    elements += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="${random(0.1, 0.3)}" class="glitch" />\n`;
  }

  // Data streams (vertical lines with dots)
  for (let i = 0; i < 12; i++) {
    const x = random(50, WIDTH - 50);
    const color = pick(palette);
    elements += `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${color}" stroke-width="1" opacity="0.2" stroke-dasharray="2,8" class="dataStream" />\n`;
  }

  // Hexagon grid (sparse)
  for (let i = 0; i < 6; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const size = random(15, 40);
    elements += `<path d="${generateHexagon(cx, cy, size)}" fill="none" stroke="${pick(palette)}" stroke-width="1" opacity="${random(0.2, 0.4)}" class="float" />\n`;
  }

  return elements;
}

function generateNeonElements(palette) {
  let elements = "";

  // Neon tubes (thick glowing lines)
  for (let i = 0; i < 5; i++) {
    const y1 = random(20, HEIGHT - 20);
    const y2 = y1 + random(-30, 30);
    const color = pick(palette);
    elements += `<line x1="${random(-50, 100)}" y1="${y1}" x2="${random(WIDTH - 100, WIDTH + 50)}" y2="${y2}" stroke="${color}" stroke-width="${random(2, 5)}" opacity="0.6" stroke-linecap="round" filter="url(#glow)" class="pulse" />\n`;
  }

  // Neon rings
  for (let i = 0; i < 4; i++) {
    const cx = random(100, WIDTH - 100);
    const cy = random(30, HEIGHT - 30);
    const r = random(20, 60);
    elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${pick(palette)}" stroke-width="2" opacity="0.5" filter="url(#glow)" class="float" />\n`;
  }

  // Sparks
  for (let i = 0; i < 20; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const r = random(1, 4);
    elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${pick(palette)}" opacity="0.8" filter="url(#glow)" class="shimmer" style="animation-delay: ${random(0, 3)}s" />\n`;
  }

  return elements;
}

function generateNatureElements(palette) {
  let elements = "";

  // Organic flowing shapes (leaves/petals)
  for (let i = 0; i < 6; i++) {
    const cx = random(50, WIDTH - 50);
    const cy = random(30, HEIGHT - 30);
    const size = random(30, 80);
    // Leaf shape using quadratic curves
    const angle = random(0, Math.PI * 2);
    const x1 = cx + Math.cos(angle) * size;
    const y1 = cy + Math.sin(angle) * size;
    elements += `<path d="M ${cx} ${cy} Q ${cx + random(-20, 20)} ${cy + random(-20, 20)} ${x1} ${y1} Q ${cx + random(-20, 20)} ${cy + random(-20, 20)} ${cx} ${cy}" fill="${pick(palette)}" opacity="${random(0.2, 0.4)}" class="float" />\n`;
  }

  // Branch-like lines
  for (let i = 0; i < 4; i++) {
    const startX = random(0, WIDTH);
    const startY = HEIGHT + 10;
    let d = `M ${startX} ${startY}`;
    let x = startX,
      y = startY;
    for (let j = 0; j < 5; j++) {
      x += random(-30, 30);
      y -= random(20, 50);
      d += ` L ${x} ${y}`;
    }
    elements += `<path d="${d}" fill="none" stroke="${pick(palette)}" stroke-width="${random(1, 3)}" opacity="0.3" stroke-linecap="round" />\n`;
  }

  // Floating particles
  for (let i = 0; i < 30; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    elements += `<circle cx="${cx}" cy="${cy}" r="${random(0.5, 2)}" fill="${pick(palette)}" opacity="${random(0.3, 0.6)}" class="float" style="animation-delay: ${random(0, 5)}s" />\n`;
  }

  return elements;
}

function generateOceanElements(palette) {
  let elements = "";

  // Layered waves
  for (let i = 0; i < 5; i++) {
    const baseY = 50 + i * 30;
    const wave = generateWave(baseY, 15 - i * 2, 0.02, i * 0.5);
    elements += `<path d="${wave} L ${WIDTH + 10} ${HEIGHT + 10} L -10 ${HEIGHT + 10} Z" fill="${palette[i % palette.length]}" opacity="${0.15 + i * 0.05}" class="drift" style="animation-delay: ${i * 0.5}s" />\n`;
  }

  // Bubbles
  for (let i = 0; i < 25; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const r = random(2, 10);
    elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${pick(palette)}" stroke-width="1" opacity="${random(0.2, 0.5)}" class="float" style="animation-delay: ${random(0, 4)}s" />\n`;
  }

  // Ripple circles
  for (let i = 0; i < 3; i++) {
    const cx = random(100, WIDTH - 100);
    const cy = random(50, HEIGHT - 50);
    for (let j = 0; j < 3; j++) {
      elements += `<circle cx="${cx}" cy="${cy}" r="${20 + j * 15}" fill="none" stroke="${palette[0]}" stroke-width="1" opacity="${0.3 - j * 0.1}" class="pulse" />\n`;
    }
  }

  return elements;
}

function generateSunsetElements(palette) {
  let elements = "";

  // Horizon gradient layers
  for (let i = 0; i < 5; i++) {
    const y = HEIGHT - 40 + i * 10;
    elements += `<rect x="0" y="${y}" width="${WIDTH}" height="${HEIGHT - y + 10}" fill="${palette[i % palette.length]}" opacity="${0.3 - i * 0.05}" />\n`;
  }

  // Sun rays
  const sunX = random(WIDTH * 0.3, WIDTH * 0.7);
  const sunY = HEIGHT - 30;
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 12) * i;
    const length = random(80, 150);
    const x2 = sunX + Math.cos(angle - Math.PI / 2) * length;
    const y2 = sunY - Math.sin(angle - Math.PI / 2) * length;
    elements += `<line x1="${sunX}" y1="${sunY}" x2="${x2}" y2="${y2}" stroke="${palette[0]}" stroke-width="${random(1, 3)}" opacity="${random(0.1, 0.3)}" class="pulse" />\n`;
  }

  // Clouds (soft blobs)
  for (let i = 0; i < 4; i++) {
    const cx = random(50, WIDTH - 50);
    const cy = random(20, 80);
    const blob = generateBlob(cx, cy, random(30, 60), 8, 15);
    elements += `<path d="${blob}" fill="${palette[2]}" opacity="${random(0.1, 0.25)}" class="drift" />\n`;
  }

  // Birds (simple V shapes)
  for (let i = 0; i < 5; i++) {
    const x = random(50, WIDTH - 50);
    const y = random(20, 80);
    const size = random(5, 12);
    elements += `<path d="M ${x - size} ${y + size / 2} L ${x} ${y} L ${x + size} ${y + size / 2}" fill="none" stroke="${palette[4]}" stroke-width="1.5" opacity="0.4" class="float" style="animation-delay: ${random(0, 3)}s" />\n`;
  }

  return elements;
}

function generateMinimalElements(palette) {
  let elements = "";

  // Clean geometric lines
  for (let i = 0; i < 8; i++) {
    const x1 = random(0, WIDTH);
    const y1 = random(0, HEIGHT);
    const x2 = x1 + random(-100, 100);
    const y2 = y1 + random(-50, 50);
    elements += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${pick(palette)}" stroke-width="1" opacity="${random(0.2, 0.5)}" />\n`;
  }

  // Precise dots in a loose grid
  for (let x = 50; x < WIDTH - 50; x += random(40, 80)) {
    for (let y = 30; y < HEIGHT - 30; y += random(30, 60)) {
      if (Math.random() > 0.6) {
        elements += `<circle cx="${x + random(-10, 10)}" cy="${y + random(-10, 10)}" r="${random(1, 3)}" fill="${pick(palette)}" opacity="${random(0.3, 0.6)}" />\n`;
      }
    }
  }

  // Simple circles
  for (let i = 0; i < 3; i++) {
    const cx = random(100, WIDTH - 100);
    const cy = random(50, HEIGHT - 50);
    elements += `<circle cx="${cx}" cy="${cy}" r="${random(20, 50)}" fill="none" stroke="${pick(palette)}" stroke-width="1" opacity="${random(0.2, 0.4)}" />\n`;
  }

  return elements;
}

function generateCosmicElements(palette) {
  let elements = "";

  // Nebula clouds (large soft blobs)
  for (let i = 0; i < 4; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const blob = generateBlob(cx, cy, random(60, 120), randomInt(8, 12), 40);
    elements += `<path d="${blob}" fill="${pick(palette)}" opacity="${random(0.1, 0.25)}" filter="url(#glow)" class="float" />\n`;
  }

  // Galaxy swirls
  for (let i = 0; i < 2; i++) {
    const cx = random(100, WIDTH - 100);
    const cy = random(50, HEIGHT - 50);
    const spiral = generateSpiral(cx, cy, random(40, 80), random(1.5, 3));
    elements += `<path d="${spiral}" fill="none" stroke="${pick(palette)}" stroke-width="1" opacity="0.3" class="drift" />\n`;
  }

  // Stars (various sizes)
  for (let i = 0; i < 40; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const r = random(0.5, 2);
    const twinkle = Math.random() > 0.7;
    elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" opacity="${random(0.3, 0.8)}" ${twinkle ? 'class="shimmer"' : ""} style="animation-delay: ${random(0, 5)}s" />\n`;
  }

  // Bright stars with glow
  for (let i = 0; i < 8; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    elements += `<circle cx="${cx}" cy="${cy}" r="${random(1, 3)}" fill="${pick(palette)}" opacity="0.8" filter="url(#glow)" class="shimmer" style="animation-delay: ${random(0, 3)}s" />\n`;
  }

  // Constellation lines
  const points = [];
  for (let i = 0; i < 6; i++) {
    points.push({ x: random(50, WIDTH - 50), y: random(30, HEIGHT - 30) });
  }
  for (let i = 0; i < points.length - 1; i++) {
    if (Math.random() > 0.4) {
      elements += `<line x1="${points[i].x}" y1="${points[i].y}" x2="${points[i + 1].x}" y2="${points[i + 1].y}" stroke="${palette[4]}" stroke-width="0.5" opacity="0.3" />\n`;
    }
  }

  return elements;
}

function generateSVG() {
  const mood = getMood();
  const { palette, bg, glow, animSpeed } = mood;

  const animDuration =
    animSpeed === "fast" ? "3s" : animSpeed === "slow" ? "8s" : "5s";

  const defs = `
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${palette[0]};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${palette[1]};stop-opacity:0.8" />
      </linearGradient>
      <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${palette[2]};stop-opacity:0.7" />
        <stop offset="100%" style="stop-color:${palette[3]};stop-opacity:0.7" />
      </linearGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${palette[0]}" />
        <stop offset="25%" style="stop-color:${palette[1]}" />
        <stop offset="50%" style="stop-color:${palette[2]}" />
        <stop offset="75%" style="stop-color:${palette[3]}" />
        <stop offset="100%" style="stop-color:${palette[4] || palette[0]}" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="${glow}" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="textGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;

  const styles = `
    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.9; }
      }
      @keyframes drift {
        0% { transform: translateX(0px); }
        50% { transform: translateX(10px); }
        100% { transform: translateX(0px); }
      }
      @keyframes shimmer {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
      }
      @keyframes glitch {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-2px); }
        40% { transform: translateX(2px); }
        60% { transform: translateX(-1px); }
        80% { transform: translateX(1px); }
      }
      @keyframes dataStream {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -20; }
      }
      .float { animation: float ${animDuration} ease-in-out infinite; }
      .pulse { animation: pulse ${animDuration} ease-in-out infinite; }
      .drift { animation: drift ${animDuration} ease-in-out infinite; }
      .shimmer { animation: shimmer 3s ease-in-out infinite; }
      .glitch { animation: glitch 0.5s ease-in-out infinite; }
      .dataStream { animation: dataStream 2s linear infinite; }
      .name-text { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-weight: 700;
        font-size: 64px;
        letter-spacing: -2px;
      }
    </style>
  `;

  // Generate mood-specific elements
  let elements = "";
  const moodName =
    MOOD === "random"
      ? Object.keys(MOODS).find((k) => MOODS[k] === mood)
      : MOOD;

  switch (moodName) {
    case "cyberpunk":
      elements = generateCyberpunkElements(palette);
      break;
    case "neon":
      elements = generateNeonElements(palette);
      break;
    case "nature":
      elements = generateNatureElements(palette);
      break;
    case "ocean":
      elements = generateOceanElements(palette);
      break;
    case "sunset":
      elements = generateSunsetElements(palette);
      break;
    case "minimal":
      elements = generateMinimalElements(palette);
      break;
    case "cosmic":
      elements = generateCosmicElements(palette);
      break;
    default:
      elements = generateNeonElements(palette);
  }

  const nameText = `
    <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 20}" text-anchor="middle" class="name-text" fill="url(#textGrad)" filter="url(#textGlow)">
      JOEL HOOKS
    </text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${bg}"/>
  ${defs}
  ${styles}
  ${elements}
  ${nameText}
</svg>`;
}

console.log(generateSVG());
