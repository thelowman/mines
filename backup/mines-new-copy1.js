
const arrN = (l, fn) => new Array(l).fill(null).reduce((a, b, i) => a.concat(fn(b, i)), []);
const createGrid = (w, h, fn) => arrN(h, (c, i) => [arrN(w, fn(c, i))]);
const cell_i = (w, h, g) => i => i > -1 && i < w * h ? g[Math.floor(i / w)][i % w] : undefined;
const cell_xy = (w, h, g) => (x, y) => x >= 0 && x < w && y >= 0 && y < h ? g[y][x] : undefined;
const border_i = (w, h) => (x, y) => {
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

const createElem = (parent, onLClick, onRClick, ...classes) => {
  const elem = parent.appendChild(document.createElement('div'));
  elem.classList.add(...classes);
  if (onLClick || onRClick) {
    elem.addEventListener('mousedown', e => {
      if (e.which === 1 && onLClick) onLClick();
      if (e.which === 3 && onRClick) onRClick();
    });
  };
  return elem;
}

const generateMines = (w, h, d, x, y) => {
  const count = Math.ceil(h * w * d);
  const mines = [];
  const avoid = border_i(w, h)(x, y);
  avoid.push(x + y * w);
  while(mines.length < count) {
    let check = Math.floor(Math.random() * h * w);
    if (
      mines.indexOf(check) === -1 &&
      avoid.indexOf(check) === -1
    ) mines.push(check);
  }
  return mines;
}

let overlay;

const start = () => {
  overlay = document.createElement('div');
  overlay.classList.add('overlay');
  document.body.appendChild(overlay);
  const startGame = new DOMParser().parseFromString(startScreenHTML, 'text/html');
  overlay.innerHTML = startScreenHTML;
  // const startGame = document.createElement('div');
  // startGame.classList.add('start');
  // overlay.appendChild(startGame);
  // setTimeout(() => startGame.classList.add('shown'), 500);
}

const setup = (w, h) => {
  var mines;
  const baseElem = document.createElement('div');
  overlay.appendChild(baseElem);

  const reveal = (x, y) => {
    const cell = byCoord(x, y);
    if (!cell.elem.classList.contains('hidden') || 
      cell.elem.classList.contains('marked')) return;

    cell.elem.classList.remove('hidden');
    if (cell.value) {
      if (cell.value === 9) boom(cell.x, cell.y);
      else cell.elem.innerText = cell.value;
    }
    else {
      border(cell.x, cell.y).forEach(i => {
        var c = byIndex(i);
        reveal(c.x, c.y)
      });
    }
  }

  const mark = (x, y) => {
    const cell = byCoord(x, y);
    if (!cell.elem.classList.contains('marked')) cell.elem.classList.add('marked');
    else cell.elem.classList.remove('marked');
  }

  const boom = (x, y) => {
    const unmarked = mines.reduce((f, m) => {
      const cell = byIndex(m);
      if (!cell.elem.classList.contains('marked'))
        return f.concat({ cell, dist: Math.sqrt(Math.pow(cell.x - x, 2) + Math.pow(cell.y - y, 2)) })
      return f;
    }, []).sort((a, b) => a.dist > b.dist ? 1 : a.dist < b.dist ? -1 : 0).forEach((c, i) => {
      setTimeout(() => c.cell.elem.classList.add('boom'), i * 20)
    });
  }

  // first click places mines
  const click = (x, y) => {
    if (!mines) mines = generateMines(w, h, 0.16, x, y);
    for(let i = 0; i < w * h; i++) {
      let cell = byIndex(i);
      if (mines.indexOf(cell.index) > -1) cell.value = 9;
      else cell
        .value = border(cell.x, cell.y)
        .reduce((v, c) => mines.indexOf(c) > -1 ? v += 1 : v, 0);
    }
    reveal(x, y);
  }

  const grid = createGrid(w, h, (r, rI) => {
    const row = createElem(baseElem, null, null, 'row');
    return (c, cI) => ({
      y: rI,
      x: cI,
      index: rI * w + cI,
      value: 0,
      elem: createElem(row, () => click(cI, rI), () => mark(cI, rI), 'cell', 'hidden')
    });
  });

  const byIndex = cell_i(w, h, grid);
  const byCoord = cell_xy(w, h, grid);
  const border = border_i(w, h);

  window.oncontextmenu = e => false;
  const stop = () => window.oncontextmenu = e => true;
  return { stop }
};

const startScreenHTML = `  <div>
<button onclick="setup(10, 10)">10 x 10</button>
<button onclick="setup(20, 20)">20 x 20</button>
<button onclick="setup(30, 30)">30 x 30</button>
</div>
`;