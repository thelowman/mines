
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

const loadStyle = url => {
  fetch(url).then(r => r.text()).then(t => {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(t));
    return document.head.appendChild(style);
  })
  .catch(error => {
    console.warn(`Failed to load ${url}`, error.message);
  });
}
(function() { loadStyle(`/skin/default.css`) })();

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

// Console warnings for template issues.
const TE_NOSTARTWIDTH = 'No data-width specified in the template.'
const TE_NOSTARTHEIGHT = 'No data-height specified in the template.'


const mines = () => {
  let mines;
  const overlay = document.createElement('div');
  const gameStart = document.createElement('div');
  const statusBoard = document.createElement('div');
  const gameGrid = document.createElement('div');

  overlay.classList.add('overlay');
  gameStart.classList.add('gameStart');
  gameGrid.classList.add('gameGrid');

  overlay.addEventListener('click', e => pause());
  gameStart.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
  gameGrid.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });

  const applySkin = name => {
    const skin = name ? name : basic;
    gameStart.innerHTML = skin.startScreenHTML;
    gameStart.querySelectorAll(`[data-action="start"]`).forEach(elem => {
      let w = 10;
      let h = 10;
      if (isNaN(elem.dataset.width)) console.warn(TE_NOSTARTWIDTH);
      else w = parseInt(elem.dataset.width);
      if (isNaN(elem.dataset.height)) console.warn(TE_NOSTARTHEIGHT);
      else h = parseInt(elem.dataset.height);
      elem.addEventListener('click', e => start(w, h));
    });
    statusBoard.innerHTML = skin.statusBoardHTML;
  }

  const pause = () => {
    window.oncontextmenu = e => true;
    overlay.classList.remove('shown');
    setTimeout(() => document.body.removeChild(overlay), 500);
  }

  const resume = () => {
    window.oncontextmenu = e => false;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('shown'), 100);
  }

  const reset = () => {
    gameGrid.classList.remove('shown');
    setTimeout(() => {
      while(gameGrid.firstChild) gameGrid.removeChild(gameGrid.firstChild);
      mines = null;
      overlay.removeChild(gameGrid);
      overlay.appendChild(gameStart);
      setTimeout(() => gameStart.classList.add('shown'), 100);
    }, 500);
  }

  const start = (w, h) => {
    gameGrid.appendChild(statusBoard);
    const grid = createGrid(w, h, (r, rI) => {
      const row = createElem(gameGrid, null, null, 'row');
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

    gameStart.classList.remove('shown');
    setTimeout(() => {
      overlay.removeChild(gameStart);
      overlay.appendChild(gameGrid);
      setTimeout(() => gameGrid.classList.add('shown'), 100)
    }, 500);

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
      if (remainingCells() === 0) win();
    }

    const remainingCells = () => grid.reduce((t, row) => t += row.reduce((t2, cell) => 
      cell.elem.classList.contains('hidden') && cell.value < 9 ?
        t2 += 1 : t2
      , 0), 0);

    const marked = () => grid.reduce((t, row) => t += row.reduce((t2, cell) => 
      cell.elem.classList.contains('marked') ?
        t2 += 1 : t2
      , 0), 0);

    const remainingUnmarked = () => grid.reduce((t, row) => t += row.reduce((t2, cell) => 
      cell.value === 9 && !cell.elem.classList.contains('marked') ?
        t2 += 1 : t2
      , 0), 0);

    const mark = (x, y) => {
      const cell = byCoord(x, y);
      if (!cell.elem.classList.contains('hidden')) return;
      if (!cell.elem.classList.contains('marked')) cell.elem.classList.add('marked');
      else cell.elem.classList.remove('marked');
      if (remainingUnmarked() === 0) win();
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

    const win = () => {
      reset();
    }

    const boom = (x, y) => {
      const unmarked = mines.reduce((f, m) => {
        const cell = byIndex(m);
        if (!cell.elem.classList.contains('marked'))
          return f.concat({ cell, dist: Math.sqrt(Math.pow(cell.x - x, 2) + Math.pow(cell.y - y, 2)) })
        return f;
      }, []).sort((a, b) => a.dist > b.dist ? 1 : a.dist < b.dist ? -1 : 0)
      unmarked.forEach((c, i) => {
        setTimeout(() => c.cell.elem.classList.add('boom'), i * 20);
      });
      setTimeout(() => {
        reset();
      }, unmarked.length * 20 + 1000);
    }
  }

  applySkin();
  window.oncontextmenu = e => false;
  document.body.appendChild(overlay);
  overlay.appendChild(gameStart);
  setTimeout(() => {
    overlay.classList.add('shown');
    setTimeout(() => gameStart.classList.add('shown'), 500);
  }, 100);

  return { pause, resume }
};


const basic = {
  startScreenHTML: `
    <div>
      <div>
        <button class="startButton"
          data-action="start"
          data-width="10"
          data-height="10">
          10 x 10
        </button>
        <button class="startButton"
          data-action="start"
          data-width="20"
          data-height="20">
          20 x 20
        </button>
        <button class="startButton"
          data-action="start"
          data-width="30"
          data-height="30">
          30 x 30
        </button>
      </div>
    </div>
    `,
  statusBoardHTML: `
    <div class="statusBoard">
      <div data-value="time">Time</div>
      <div data-value="marked">Marked</div>
      <div data-value="total">Total</div>
    </div>
  `
};
