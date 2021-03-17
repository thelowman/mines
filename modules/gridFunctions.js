const arrN = (l, fn) => new Array(l).fill(null).reduce((a, b, i) => a.concat(fn(b, i)), []);
export const createGrid = (w, h, fn) => arrN(h, (c, i) => [arrN(w, fn(c, i))]);
export const cell_i = (w, h, g) => i => i > -1 && i < w * h ? g[Math.floor(i / w)][i % w] : undefined;
export const cell_xy = (w, h, g) => (x, y) => x >= 0 && x < w && y >= 0 && y < h ? g[y][x] : undefined;
export const border_i = (w, h) => (x, y) => {
  const startPt = x + y * w;
  const b = [];
  if (x > 0 && y > 0) b.push(startPt - w - 1);
  if (y > 0) b.push(startPt - w);
  if (y > 0 && x < (w - 1)) b.push(startPt - w + 1);
  if (x > 0) b.push(startPt - 1);
  if (x < (w - 1)) b.push(startPt + 1);
  if (x > 0 && y < (h - 1)) b.push(startPt + w - 1);
  if (y < (h - 1)) b.push(startPt + w);
  if (x < (w - 1) && y < (h - 1)) b.push(startPt + w + 1);
  return b;
}
export const byDist = (from, targets) => targets.reduce((f, cell) => {
  const d = Math.floor(Math.sqrt(Math.pow(cell.x - from.x, 2) + Math.pow(cell.y - from.y, 2)));
  if (!f[d]) f[d] = [];
  f[d].push(cell);
  return f;
}, []);