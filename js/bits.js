const canvas = document.getElementById('bits');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FONT_SIZE = 14;
const LINE_HEIGHT = 24;
const OPACITY = 0.38;
const GAP = '   ';
const FLIPS_PER_PIXEL = 20;
const MAX_FLIPS = 2500;

let grid = [];
let offsetX = 0;
let lastY = window.scrollY;
let pending = false;

function octet() {
  let bits = '';
  for (let i = 0; i < 8; i++) {
    bits += Math.random() < 0.5 ? '0' : '1';
  }
  return bits;
}

function address() {
  return [octet(), octet(), octet(), octet()].join('.');
}

function setup() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.font = `${FONT_SIZE}px ui-monospace, Menlo, monospace`;
  const charWidth = ctx.measureText('0').width;

  // Build rows from whole addresses, one extra so the row overflows both edges
  const blockWidth = (address().length + GAP.length) * charWidth;
  const blocks = Math.ceil(window.innerWidth / blockWidth) + 1;
  const rows = Math.ceil(window.innerHeight / LINE_HEIGHT);

  grid = [];
  for (let r = 0; r < rows; r++) {
    const parts = [];
    for (let b = 0; b < blocks; b++) {
      parts.push(address());
    }
    grid.push(parts.join(GAP).split(''));
  }

  // Center the pattern so both edges are cut off evenly
  const lineWidth = grid[0].length * charWidth;
  offsetX = (window.innerWidth - lineWidth) / 2;

  draw();
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.font = `${FONT_SIZE}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.globalAlpha = OPACITY;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

  grid.forEach((row, r) => {
    ctx.fillText(row.join(''), offsetX, r * LINE_HEIGHT);
  });
}

function flipBits(count) {
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * grid.length);
    const c = Math.floor(Math.random() * grid[r].length);
    if (grid[r][c] === '0') grid[r][c] = '1';
    else if (grid[r][c] === '1') grid[r][c] = '0';
  }
}

window.addEventListener('scroll', () => {
  if (reduceMotion || pending) return;
  pending = true;
  requestAnimationFrame(() => {
    const distance = Math.abs(window.scrollY - lastY);
    lastY = window.scrollY;
    flipBits(Math.min(Math.ceil(distance * FLIPS_PER_PIXEL), MAX_FLIPS));
    draw();
    pending = false;
  });
}, { passive: true });

window.addEventListener('resize', setup);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);

setup();