// Demo scenes: original poster-style artwork painted in code, offered as
// starter pictures so the studio can be tried before a photo is added.
// Each painter draws one scene into a fresh canvas at the size asked for.

function canvasOf(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function palmTree(ctx, x, y, s, lean) {
  ctx.strokeStyle = "#1c0f2e";
  ctx.fillStyle = "#1c0f2e";
  ctx.lineCap = "round";
  ctx.lineWidth = 7 * s;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * 0.4 * s, y - 60 * s, x + lean * s, y - 105 * s);
  ctx.stroke();
  const topX = x + lean * s, topY = y - 105 * s;
  ctx.lineWidth = 4.5 * s;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + i * 0.14);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * 34 * s, topY - Math.sin(a) * 26 * s - 6 * s,
      topX + Math.cos(a) * 52 * s, topY - Math.sin(a) * 20 * s + 14 * s);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX - 5 * s, topY + 4 * s, 5 * s, 0, Math.PI * 2);
  ctx.arc(topX + 6 * s, topY + 5 * s, 4.4 * s, 0, Math.PI * 2);
  ctx.fill();
}

function convertible(ctx, x, y, s, body) {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 14 * s, y - 16 * s);
  ctx.quadraticCurveTo(x + 30 * s, y - 22 * s, x + 58 * s, y - 23 * s);
  ctx.lineTo(x + 96 * s, y - 24 * s);
  ctx.quadraticCurveTo(x + 128 * s, y - 23 * s, x + 138 * s, y - 12 * s);
  ctx.lineTo(x + 142 * s, y);
  ctx.quadraticCurveTo(x + 120 * s, y + 4 * s, x + 104 * s, y);
  ctx.arc(x + 88 * s, y, 11 * s, 0, Math.PI, true);
  ctx.lineTo(x + 40 * s, y);
  ctx.arc(x + 28 * s, y, 11 * s, 0, Math.PI, true);
  ctx.quadraticCurveTo(x + 8 * s, y + 3 * s, x, y);
  ctx.fill();
  ctx.fillStyle = "#12081f";
  for (const wx of [28, 88]) {
    ctx.beginPath(); ctx.arc(x + wx * s, y, 10 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d9d3e8";
    ctx.beginPath(); ctx.arc(x + wx * s, y, 4.4 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#12081f";
  }
  ctx.fillStyle = "rgba(18,8,31,0.9)";
  ctx.fillRect(x + 44 * s, y - 34 * s, 5 * s, 12 * s);
  ctx.beginPath();
  ctx.arc(x + 47 * s, y - 38 * s, 5.4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,220,160,0.95)";
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(x + 132 * s, y - 10 * s);
  ctx.lineTo(x + 140 * s, y - 10 * s);
  ctx.stroke();
}

export function paintBoulevard(w, h) {
  const c = canvasOf(w, h), ctx = c.getContext("2d");
  const s = Math.min(w, h) / 300;
  skyGradient(ctx, w, h, [[0, "#3b1560"], [0.45, "#b03072"], [0.72, "#ff7a4d"], [1, "#ffc46b"]]);
  const sunY = h * 0.68;
  const sun = ctx.createRadialGradient(w * 0.62, sunY, 4, w * 0.62, sunY, h * 0.30);
  sun.addColorStop(0, "rgba(255,236,170,0.95)");
  sun.addColorStop(0.25, "rgba(255,180,90,0.55)");
  sun.addColorStop(1, "rgba(255,150,80,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffd98c";
  ctx.beginPath(); ctx.arc(w * 0.62, sunY, h * 0.085, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a1245";
  for (let i = 0; i < 6; i++) {
    const bx = (i * 0.19 + 0.02) * w, bh = h * (0.16 + (i % 3) * 0.05);
    ctx.fillRect(bx, sunY - bh + h * 0.06, w * 0.09, bh);
  }
  ctx.fillStyle = "#170a29";
  ctx.fillRect(0, h * 0.74, w, h * 0.26);
  ctx.strokeStyle = "rgba(255,196,107,0.8)";
  ctx.lineWidth = 2.4 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.76);
    ctx.lineTo(w * (0.06 + i * 0.22), h);
    ctx.stroke();
  }
  palmTree(ctx, w * 0.16, h * 0.78, 1.25 * s, 16);
  palmTree(ctx, w * 0.88, h * 0.80, 1.5 * s, -20);
  palmTree(ctx, w * 0.30, h * 0.76, 0.8 * s, 10);
  convertible(ctx, w * 0.34, h * 0.90, 1.55 * s, "#d92662");
  return c;
}

export function paintNeonStreet(w, h) {
  const c = canvasOf(w, h), ctx = c.getContext("2d");
  const s = Math.min(w, h) / 300;
  skyGradient(ctx, w, h, [[0, "#060214"], [0.6, "#1b0b38"], [1, "#33135c"]]);
  ctx.fillStyle = "#0d0620";
  ctx.fillRect(0, h * 0.12, w * 0.30, h * 0.62);
  ctx.fillRect(w * 0.74, h * 0.06, w * 0.26, h * 0.68);
  const signs = [
    [0.05, 0.20, "#ff4d8d", "DINER"], [0.09, 0.38, "#2ee6c8", "BAR"],
    [0.79, 0.18, "#ffb347", "HOTEL"], [0.82, 0.40, "#7ab8ff", "24H"],
  ];
  ctx.textAlign = "center";
  for (const [fx, fy, colour, word] of signs) {
    const x = fx * w, y = fy * h;
    ctx.save();
    ctx.shadowColor = colour; ctx.shadowBlur = 16 * s;
    ctx.strokeStyle = colour; ctx.lineWidth = 2 * s;
    ctx.strokeRect(x, y, w * 0.17, h * 0.10);
    ctx.fillStyle = colour;
    ctx.font = `700 ${15 * s}px "Arial", sans-serif`;
    ctx.fillText(word, x + w * 0.085, y + h * 0.066);
    ctx.restore();
  }
  ctx.fillStyle = "#08040f";
  ctx.fillRect(0, h * 0.74, w, h * 0.26);
  const wet = ctx.createLinearGradient(0, h * 0.74, 0, h);
  wet.addColorStop(0, "rgba(255,77,141,0.30)");
  wet.addColorStop(0.5, "rgba(46,230,200,0.16)");
  wet.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wet;
  ctx.fillRect(0, h * 0.74, w, h * 0.26);
  ctx.fillStyle = "#05030c";
  for (const [fx, fs] of [[0.40, 1], [0.52, 1.18]]) {
    const x = fx * w, y = h * 0.76, u = fs * s;
    ctx.beginPath(); ctx.arc(x, y - 34 * u, 6 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 5 * u, y - 30 * u, 10 * u, 24 * u);
    ctx.fillRect(x - 9 * u, y - 8 * u, 4.6 * u, 16 * u);
    ctx.fillRect(x + 4.4 * u, y - 8 * u, 4.6 * u, 16 * u);
  }
  return c;
}

export function paintRooftop(w, h) {
  const c = canvasOf(w, h), ctx = c.getContext("2d");
  const s = Math.min(w, h) / 300;
  skyGradient(ctx, w, h, [[0, "#1d1440"], [0.55, "#6d2a6e"], [0.85, "#e85d75"], [1, "#ff9e64"]]);
  ctx.fillStyle = "#ffe9b0";
  ctx.beginPath(); ctx.arc(w * 0.80, h * 0.20, h * 0.045, 0, Math.PI * 2); ctx.fill();
  const base = h * 0.66;
  for (let i = 0; i < 9; i++) {
    const bx = i * w * 0.115 - w * 0.02, bw = w * 0.10;
    const bh = h * (0.14 + ((i * 37) % 5) * 0.045);
    ctx.fillStyle = "#241239";
    ctx.fillRect(bx, base - bh, bw, bh);
    ctx.fillStyle = "rgba(255,205,110,0.85)";
    for (let wy = 0; wy < 4; wy++) for (let wx = 0; wx < 3; wx++) {
      if ((i * 7 + wy * 3 + wx) % 3 !== 0) ctx.fillRect(bx + bw * (0.16 + wx * 0.28), base - bh + bh * (0.14 + wy * 0.2), bw * 0.13, bh * 0.10);
    }
  }
  ctx.fillStyle = "#150a26";
  ctx.fillRect(0, base, w, h - base);
  ctx.fillRect(w * 0.60, base - h * 0.16, w * 0.05, h * 0.16);
  ctx.beginPath();
  ctx.moveTo(w * 0.575, base - h * 0.16);
  ctx.lineTo(w * 0.675, base - h * 0.16);
  ctx.lineTo(w * 0.65, base - h * 0.215);
  ctx.lineTo(w * 0.60, base - h * 0.215);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#0d0518";
  ctx.lineWidth = 3.4 * s;
  ctx.beginPath(); ctx.moveTo(0, h * 0.80); ctx.lineTo(w, h * 0.80); ctx.stroke();
  for (let i = 0; i <= 10; i++) ctx.fillRect(i * w * 0.1, h * 0.80, 3 * s, h * 0.09);
  ctx.fillStyle = "#0d0518";
  ctx.fillRect(0, h * 0.885, w, 3.4 * s);
  ctx.strokeStyle = "rgba(255,190,90,0.9)";
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.70);
  ctx.quadraticCurveTo(w * 0.5, h * 0.80, w, h * 0.68);
  ctx.stroke();
  ctx.fillStyle = "#ffd98c";
  for (let i = 1; i < 8; i++) {
    const t = i / 8, x = t * w;
    const y = h * 0.70 + (h * 0.80 - h * 0.70) * 2 * t * (1 - t) + (h * 0.68 - h * 0.70) * t * t;
    ctx.beginPath(); ctx.arc(x, y + 3 * s, 2.6 * s, 0, Math.PI * 2); ctx.fill();
  }
  return c;
}

export const SCENE_PAINTERS = [
  { name: "Boulevard Sunset", paint: paintBoulevard },
  { name: "Neon Street", paint: paintNeonStreet },
  { name: "Rooftop Dusk", paint: paintRooftop },
];
