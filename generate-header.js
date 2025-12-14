#!/usr/bin/env node

/**
 * Generates a Josh Davis-inspired generative art SVG header
 * Organic flowing shapes, vibrant gradients, controlled chaos
 * With animated elements and name
 */

const WIDTH = 800;
const HEIGHT = 200;

// Badass color palette
const PALETTES = [
  ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#1dd1a1"], // tropical
  ["#e17055", "#fdcb6e", "#00b894", "#6c5ce7", "#fd79a8"], // sunset
  ["#0984e3", "#00cec9", "#6c5ce7", "#e84393", "#fdcb6e"], // electric
  ["#ff7675", "#fab1a0", "#ffeaa7", "#81ecec", "#74b9ff"], // pastel pop
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(random(min, max));
}

function pick(arr) {
  return arr[randomInt(0, arr.length)];
}

function generateBlobPath(cx, cy, radius, points, variance) {
  const angleStep = (Math.PI * 2) / points;
  const pathPoints = [];

  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    const r = radius + random(-variance, variance);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    pathPoints.push({ x, y });
  }

  let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

  for (let i = 0; i < pathPoints.length; i++) {
    const p0 = pathPoints[(i - 1 + pathPoints.length) % pathPoints.length];
    const p1 = pathPoints[i];
    const p2 = pathPoints[(i + 1) % pathPoints.length];
    const p3 = pathPoints[(i + 2) % pathPoints.length];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d + " Z";
}

function generateFlowLine(startX, startY, length, amplitude) {
  let d = `M ${startX} ${startY}`;
  let x = startX;
  let y = startY;
  const step = 20;

  for (let i = 0; i < length; i += step) {
    const cx1 = x + step / 3;
    const cy1 = y + random(-amplitude, amplitude);
    const cx2 = x + (step * 2) / 3;
    const cy2 = y + random(-amplitude, amplitude);
    x += step;
    y += random(-amplitude / 2, amplitude / 2);
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`;
  }

  return d;
}

function generateSVG() {
  const palette = pick(PALETTES);
  const bgColor = "#0d1117"; // GitHub dark mode

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
      <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${palette[3]};stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:${palette[0]};stop-opacity:0.6" />
      </linearGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${palette[0]}" />
        <stop offset="25%" style="stop-color:${palette[1]}" />
        <stop offset="50%" style="stop-color:${palette[2]}" />
        <stop offset="75%" style="stop-color:${palette[3]}" />
        <stop offset="100%" style="stop-color:${palette[0]}" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
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
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
      .float { animation: float 6s ease-in-out infinite; }
      .float-delay { animation: float 6s ease-in-out infinite; animation-delay: -3s; }
      .pulse { animation: pulse 4s ease-in-out infinite; }
      .drift { animation: drift 8s ease-in-out infinite; }
      .shimmer { animation: shimmer 3s ease-in-out infinite; }
      .name-text { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-weight: 700;
        font-size: 64px;
        letter-spacing: -2px;
      }
    </style>
  `;

  let elements = "";

  // Animated background blobs
  for (let i = 0; i < 5; i++) {
    const cx = random(50, WIDTH - 50);
    const cy = random(30, HEIGHT - 30);
    const radius = random(40, 100);
    const path = generateBlobPath(
      cx,
      cy,
      radius,
      randomInt(6, 10),
      radius * 0.3,
    );
    const gradId = `grad${randomInt(1, 4)}`;
    const animClass = i % 2 === 0 ? "float" : "float-delay";
    elements += `<path class="${animClass}" d="${path}" fill="url(#${gradId})" opacity="${random(0.2, 0.5)}" />\n`;
  }

  // Animated flow lines
  for (let i = 0; i < 6; i++) {
    const startY = random(30, HEIGHT - 30);
    const path = generateFlowLine(-50, startY, WIDTH + 100, random(15, 40));
    const color = pick(palette);
    const strokeWidth = random(1, 3);
    const animClass = i % 2 === 0 ? "pulse" : "drift";
    elements += `<path class="${animClass}" d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="${random(0.3, 0.6)}" stroke-linecap="round" filter="url(#glow)" />\n`;
  }

  // Animated accent circles
  for (let i = 0; i < 15; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const r = random(2, 6);
    const color = pick(palette);
    const delay = random(0, 4);
    elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.7" class="shimmer" style="animation-delay: ${delay}s" />\n`;
  }

  // Small detail dots
  for (let i = 0; i < 25; i++) {
    const cx = random(0, WIDTH);
    const cy = random(0, HEIGHT);
    const r = random(0.5, 1.5);
    elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" opacity="${random(0.15, 0.4)}" />\n`;
  }

  // Name text with gradient and glow
  const nameText = `
    <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 20}" text-anchor="middle" class="name-text" fill="url(#textGrad)" filter="url(#textGlow)">
      JOEL HOOKS
    </text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${bgColor}"/>
  ${defs}
  ${styles}
  ${elements}
  ${nameText}
</svg>`;
}

console.log(generateSVG());
