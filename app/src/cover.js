// The cover engine: panel layouts, colour grades and the lettering that
// turns a set of pictures into one multi-panel poster cover.

export const LAYOUTS = {
  grid4: {
    label: "Cover Grid",
    panels: () => [
      [0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5],
    ],
  },
  hero3: {
    label: "Hero + Three",
    panels: () => [
      [0, 0, 0.56, 1], [0.56, 0, 0.44, 0.34],
      [0.56, 0.34, 0.44, 0.33], [0.56, 0.67, 0.44, 0.33],
    ],
  },
  six: {
    label: "Six Pack",
    panels: () => {
      const out = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) out.push([c / 3, r / 2, 1 / 3, 0.5]);
      return out;
    },
  },
  trio: {
    label: "Triptych",
    panels: () => [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]],
  },
  full: {
    label: "Full Bleed",
    panels: () => [[0, 0, 1, 1]],
  },
};

// A grade is a photo filter plus two tint passes: a soft-light wash that
// bends the midtones and a screen/multiply gradient that lays the mood.
export const GRADES = {
  sunset: {
    label: "Vice Sunset",
    filter: "saturate(1.35) contrast(1.06) brightness(1.02)",
    wash: "rgba(255,110,80,0.55)",
    top: "rgba(64,16,96,0.55)", bottom: "rgba(255,170,80,0.28)",
  },
  neon: {
    label: "Neon Nights",
    filter: "saturate(1.5) contrast(1.12) brightness(0.98)",
    wash: "rgba(40,200,220,0.45)",
    top: "rgba(10,4,40,0.6)", bottom: "rgba(255,60,140,0.30)",
  },
  gold: {
    label: "Golden Hour",
    filter: "saturate(1.2) contrast(1.03) sepia(0.28)",
    wash: "rgba(255,180,70,0.5)",
    top: "rgba(90,50,10,0.35)", bottom: "rgba(255,205,110,0.30)",
  },
  noir: {
    label: "Midnight Noir",
    filter: "saturate(0.55) contrast(1.22) brightness(0.92)",
    wash: "rgba(70,90,160,0.5)",
    top: "rgba(0,0,10,0.65)", bottom: "rgba(20,20,40,0.35)",
  },
};

export const INKS = {
  sunset: ["#fff7e8", "#ffb347", "#ff4d8d"],
  neon: ["#eafffb", "#2ee6c8", "#ff4d8d"],
  clean: ["#ffffff", "#f2f2f2", "#cfd6dd"],
};

function drawPictureCover(ctx, img, x, y, w, h, place) {
  const zoom = place.zoom || 1;
  const scale = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * scale, dh = img.height * scale;
  const roomX = Math.max(0, (dw - w) / 2), roomY = Math.max(0, (dh - h) / 2);
  const dx = x + (w - dw) / 2 + (place.px || 0) * roomX;
  const dy = y + (h - dh) / 2 + (place.py || 0) * roomY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function gradePanel(ctx, x, y, w, h, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = grade.wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = "multiply";
  const top = ctx.createLinearGradient(0, y, 0, y + h);
  top.addColorStop(0, grade.top);
  top.addColorStop(0.45, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = "screen";
  const bottom = ctx.createLinearGradient(0, y, 0, y + h);
  bottom.addColorStop(0.55, "rgba(0,0,0,0)");
  bottom.addColorStop(1, grade.bottom);
  ctx.fillStyle = bottom;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

let grainTile = null;
function makeGrain() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d");
  const data = g.createImageData(128, 128);
  let seed = 20261119;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = 118 + (seed % 120);
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return c;
}

function drawLettering(ctx, W, H, caption) {
  const inks = INKS[caption.ink] || INKS.sunset;
  const title = (caption.title || "").trim();
  const sub = (caption.sub || "").trim();
  const unit = Math.min(W, H);
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (title) {
    let size = unit * 0.148;
    ctx.font = `900 ${size}px "Arial Black", "Segoe UI", sans-serif`;
    const widest = Math.max(...title.split(" ").map((word) => ctx.measureText(word).width));
    if (widest > W * 0.62) {
      size *= (W * 0.62) / widest;
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI", sans-serif`;
    }
    const words = title.split(" ");
    const lineH = size * 0.94;
    let ty = H * 0.045 + size;
    ctx.lineJoin = "round";
    for (let i = 0; i < words.length; i++) {
      const fill = ctx.createLinearGradient(0, ty - size, 0, ty + size * 0.2);
      fill.addColorStop(0, inks[0]);
      fill.addColorStop(0.55, inks[1]);
      fill.addColorStop(1, inks[2]);
      ctx.strokeStyle = "rgba(12,4,24,0.92)";
      ctx.lineWidth = size * 0.16;
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = size * 0.055;
      ctx.strokeText(words[i], W * 0.045, ty);
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = fill;
      ctx.fillText(words[i], W * 0.045, ty);
      ty += lineH;
    }
    if (sub) {
      ctx.font = `italic 600 ${unit * 0.036}px "Segoe Script", "Comic Sans MS", cursive`;
      ctx.fillStyle = inks[0];
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = unit * 0.008;
      ctx.fillText(sub, W * 0.05, ty + unit * 0.012);
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
}

function drawHeatAndBadge(ctx, W, H, heat) {
  const unit = Math.min(W, H);
  ctx.save();
  if (heat > 0) {
    const r = unit * 0.021, gap = r * 2.5;
    const x0 = W - unit * 0.045 - gap * 4, y = H * 0.055;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${r * 2}px "Segoe UI Symbol", sans-serif`;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < heat ? "#ffc93c" : "rgba(255,255,255,0.35)";
      ctx.strokeStyle = "rgba(10,4,20,0.8)";
      ctx.lineWidth = 2;
      const label = "★";
      ctx.strokeText(label, x0 + i * gap, y);
      ctx.fillText(label, x0 + i * gap, y);
    }
  }
  const bw = unit * 0.30, bh = unit * 0.052;
  const bx = W - bw - unit * 0.035, by = H - bh - unit * 0.035;
  ctx.fillStyle = "rgba(10,4,22,0.78)";
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, bh * 0.3);
  ctx.fill();
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = Math.max(2, unit * 0.003);
  ctx.stroke();
  ctx.fillStyle = "#ffd98c";
  ctx.font = `700 ${bh * 0.44}px "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VICE COVER STUDIO", bx + bw / 2, by + bh / 2 + 1);
  ctx.restore();
}

// Renders the whole cover. state: {layout, grade, caption:{title,sub,ink},
// heat, panels:[{img, px, py, zoom}]} — one entry per layout panel.
export function renderCover(ctx, W, H, state) {
  const rects = LAYOUTS[state.layout].panels();
  const grade = GRADES[state.grade] || GRADES.sunset;
  const border = Math.max(3, Math.round(Math.min(W, H) * 0.006));
  ctx.fillStyle = "#f5efe6";
  ctx.fillRect(0, 0, W, H);
  rects.forEach((rect, i) => {
    const [fx, fy, fw, fh] = rect;
    const x = fx * W + border, y = fy * H + border;
    const w = fw * W - border * 2, h = fh * H - border * 2;
    const place = state.panels[i] || {};
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.filter = grade.filter;
    if (place.img) drawPictureCover(ctx, place.img, x, y, w, h, place);
    else {
      ctx.fillStyle = "#241239";
      ctx.fillRect(x, y, w, h);
    }
    ctx.filter = "none";
    gradePanel(ctx, x, y, w, h, grade);
    ctx.restore();
    if (state.selected === i) {
      ctx.strokeStyle = "#ffc93c";
      ctx.lineWidth = border * 1.1;
      ctx.strokeRect(x, y, w, h);
    }
  });
  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(10,2,24,0.30)");
  shade.addColorStop(0.30, "rgba(0,0,0,0)");
  shade.addColorStop(0.78, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(10,2,24,0.34)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);
  if (!grainTile) grainTile = makeGrain();
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.globalCompositeOperation = "overlay";
  const pattern = ctx.createPattern(grainTile, "repeat");
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  drawLettering(ctx, W, H, state.caption);
  drawHeatAndBadge(ctx, W, H, state.heat || 0);
  return rects;
}
