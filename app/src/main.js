// Vice Cover Studio editor: wires the controls to the cover engine,
// keeps every photo on this machine, and exports the finished PNG.
import { GRADES, INKS, LAYOUTS, renderCover } from "./cover.js";
import { SCENE_PAINTERS } from "./scenes.js";

const canvas = document.getElementById("coverCanvas");
const ctx = canvas.getContext("2d");
const params = new URLSearchParams(location.search);

const state = {
  layout: "grid4",
  grade: "sunset",
  size: [1080, 1080],
  heat: 3,
  caption: { title: "NEON HARBOR", sub: "every tide brings trouble", ink: "sunset" },
  panels: [],
  selected: 0,
};
const pictures = []; // {img, name} — user photos first, demo scenes after
let lastRects = [];

function syncPanels() {
  const count = LAYOUTS[state.layout].panels().length;
  while (state.panels.length < count) {
    const i = state.panels.length;
    state.panels.push({ img: pictures.length ? pictures[i % pictures.length].img : null, px: 0, py: 0, zoom: 1 });
  }
  state.panels.length = count;
  if (state.selected >= count) state.selected = 0;
}

function draw() {
  syncPanels();
  canvas.width = state.size[0];
  canvas.height = state.size[1];
  lastRects = renderCover(ctx, canvas.width, canvas.height, state);
  buildAssignRow();
  syncSliders();
}

function markOn(rowId, attr, value) {
  document.querySelectorAll(`#${rowId} button`).forEach((b) => {
    b.classList.toggle("on", b.dataset[attr] === String(value));
  });
}

function buildAssignRow() {
  const row = document.getElementById("assignRow");
  row.replaceChildren();
  pictures.forEach((pic, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = pic.name;
    const current = state.panels[state.selected];
    if (current && current.img === pic.img) b.classList.add("on");
    b.addEventListener("click", () => {
      state.panels[state.selected].img = pic.img;
      draw();
    });
    row.append(b);
  });
}

function addThumbs() {
  const strip = document.getElementById("thumbStrip");
  strip.replaceChildren();
  for (const pic of pictures) {
    const t = document.createElement("canvas");
    t.width = 104; t.height = 104;
    const g = t.getContext("2d");
    const scale = Math.max(104 / pic.img.width, 104 / pic.img.height);
    g.drawImage(pic.img, (104 - pic.img.width * scale) / 2, (104 - pic.img.height * scale) / 2, pic.img.width * scale, pic.img.height * scale);
    t.title = pic.name;
    strip.append(t);
  }
}

function loadDemoScenes() {
  for (const scene of SCENE_PAINTERS) {
    if (pictures.some((p) => p.name === scene.name)) continue;
    pictures.push({ img: scene.paint(1200, 1200), name: scene.name });
  }
  state.panels = [];
  addThumbs();
  draw();
}

function readPhotoFiles(files) {
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.addEventListener("load", () => {
      pictures.unshift({ img, name: file.name.replace(/\.[^.]+$/, "").slice(0, 18) || "Photo" });
      state.panels = [];
      addThumbs();
      draw();
    });
    img.src = url;
  }
}

function syncSliders() {
  const p = state.panels[state.selected];
  if (!p) return;
  document.getElementById("zoomRange").value = Math.round((p.zoom || 1) * 100);
  document.getElementById("xRange").value = Math.round((p.px || 0) * 100);
  document.getElementById("yRange").value = Math.round((p.py || 0) * 100);
}

function bindControls() {
  document.getElementById("fileInput").addEventListener("change", (e) => readPhotoFiles(e.target.files));
  document.getElementById("sceneBtn").addEventListener("click", loadDemoScenes);
  document.getElementById("layoutRow").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-layout]");
    if (!b) return;
    state.layout = b.dataset.layout;
    state.panels = [];
    markOn("layoutRow", "layout", state.layout);
    draw();
  });
  document.getElementById("gradeRow").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-grade]");
    if (!b) return;
    state.grade = b.dataset.grade;
    markOn("gradeRow", "grade", state.grade);
    draw();
  });
  document.getElementById("inkRow").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-ink]");
    if (!b) return;
    state.caption.ink = b.dataset.ink;
    markOn("inkRow", "ink", state.caption.ink);
    draw();
  });
  document.getElementById("sizeRow").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-size]");
    if (!b) return;
    state.size = b.dataset.size.split("x").map(Number);
    markOn("sizeRow", "size", b.dataset.size);
    draw();
  });
  document.getElementById("titleInput").addEventListener("input", (e) => {
    state.caption.title = e.target.value.toUpperCase();
    draw();
  });
  document.getElementById("subInput").addEventListener("input", (e) => {
    state.caption.sub = e.target.value;
    draw();
  });
  document.getElementById("heatRange").addEventListener("input", (e) => {
    state.heat = Number(e.target.value);
    draw();
  });
  const place = () => state.panels[state.selected];
  document.getElementById("zoomRange").addEventListener("input", (e) => { place().zoom = Number(e.target.value) / 100; draw(); });
  document.getElementById("xRange").addEventListener("input", (e) => { place().px = Number(e.target.value) / 100; draw(); });
  document.getElementById("yRange").addEventListener("input", (e) => { place().py = Number(e.target.value) / 100; draw(); });
  document.getElementById("exportBtn").addEventListener("click", exportPng);
}

function exportPng() {
  const clean = { ...state, selected: -1 };
  renderCover(ctx, canvas.width, canvas.height, clean);
  canvas.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vice-cover.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    draw();
  }, "image/png");
}

function bindStage() {
  let drag = null;
  const toCover = (e) => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
  };
  canvas.addEventListener("pointerdown", (e) => {
    const [x, y] = toCover(e);
    const hit = lastRects.findIndex(([fx, fy, fw, fh]) => x >= fx * canvas.width && x < (fx + fw) * canvas.width && y >= fy * canvas.height && y < (fy + fh) * canvas.height);
    if (hit >= 0) state.selected = hit;
    drag = { x, y };
    canvas.setPointerCapture(e.pointerId);
    draw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [x, y] = toCover(e);
    const p = state.panels[state.selected];
    const rect = lastRects[state.selected];
    if (p && rect) {
      p.px = Math.max(-1, Math.min(1, (p.px || 0) + (x - drag.x) / (rect[2] * canvas.width) * 2));
      p.py = Math.max(-1, Math.min(1, (p.py || 0) + (y - drag.y) / (rect[3] * canvas.height) * 2));
    }
    drag = { x, y };
    draw();
  });
  canvas.addEventListener("pointerup", () => { drag = null; });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const p = state.panels[state.selected];
    if (!p) return;
    p.zoom = Math.max(1, Math.min(3, (p.zoom || 1) * (e.deltaY < 0 ? 1.06 : 0.94)));
    draw();
  }, { passive: false });
}

// Demo scenes for screenshots and first-run delight: ?demo=editor shows
// the studio at work; ?demo=cover renders one cover full-frame so the
// maker's screenshots are the app's own drawings.
function applyDemoMode() {
  const demo = params.get("demo");
  if (!demo) return false;
  loadDemoScenes();
  if (params.get("layout") && LAYOUTS[params.get("layout")]) state.layout = params.get("layout");
  if (params.get("grade") && GRADES[params.get("grade")]) state.grade = params.get("grade");
  if (params.get("ink") && INKS[params.get("ink")]) state.caption.ink = params.get("ink");
  if (params.get("title")) {
    state.caption.title = params.get("title");
    document.getElementById("titleInput").value = state.caption.title;
  }
  if (params.get("sub")) {
    state.caption.sub = params.get("sub");
    document.getElementById("subInput").value = state.caption.sub;
  }
  if (params.get("heat")) state.heat = Number(params.get("heat"));
  if (params.get("size")) state.size = params.get("size").split("x").map(Number);
  markOn("layoutRow", "layout", state.layout);
  markOn("gradeRow", "grade", state.grade);
  markOn("inkRow", "ink", state.caption.ink);
  if (demo === "cover") {
    document.body.classList.add("shot");
    state.selected = -1;
    const shotW = Number(params.get("shotw") || 1280);
    canvas.style.width = `${shotW}px`;
  }
  draw();
  return true;
}

bindControls();
bindStage();
if (!applyDemoMode()) {
  loadDemoScenes();
}
document.title = "Vice Cover Studio — ready";
