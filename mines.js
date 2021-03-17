// Settings
const revealDelay = 30;
const boomDelay = 50;

const gameSizes = {
  [`Small`]:  { w: 10,  h: 10 },
  [`Medium`]: { w: 20,  h: 20 }, 
  [`Large`]:  { w: 30,  h: 20 }
};

/** Loads a stylesheet immediately. */
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
(function() { loadStyle(`./skin/default.css`) })();




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
const byDist = (from, targets) => targets.reduce((f, cell) => {
  const d = Math.floor(Math.sqrt(Math.pow(cell.x - from.x, 2) + Math.pow(cell.y - from.y, 2)));
  if (!f[d]) f[d] = [];
  f[d].push(cell);
  return f;
}, []);


/**
 * @typedef CreateElemParams
 * Parameters used to control how each child element is created.
 * @property {*=} parent The HTML parent element.
 * @property {string=} elemType Tag for the element to create (div by default).
 * @property {(e:Event) => void=} onLClick Handler for a left click event.
 * @property {(e:Event) => void=} onRClick Handler for a right click event.
 * @property {string[]=} classes CSS classes to add to the new element.
 */


/**
 * Constructs a new HTML element.  If the parent is specified in "params" the
 * new element will automatically be added to the parent's heirarcy.
 * > NOTE: onLClick and onRClick will be called in response to a
 * > mouse down event rather than an acutal click event.
 * @param {CreateElemParams} params 
 */
const createElem = params => {
  const create = tag => document.createElement(tag ? tag : 'div');
  const { parent, elemType, onLClick, onRClick, classes } = params;
  const elem = parent ?
    parent.appendChild(create(elemType)) :
    create(elemType);
  if (classes) elem.classList.add(...classes);
  if (onLClick || onRClick) {
    elem.addEventListener('mousedown', e => {
      if (e.which === 1 && onLClick) onLClick(e);
      if (e.which === 3 && onRClick) onRClick(e);
    });
  };
  return elem;
}

/**
 * No mines until the first cell is clicked.
 * @param {number} w Width of the grid.
 * @param {number} h Height of the grid.
 * @param {number} d Density of mines (0 - 1).
 * @param {number} x X coordinate of the first click (no mines allowed here).
 * @param {number} y Y coordinate of the first click (no mines allowed here).
 */
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

/** Stops the current event propagation. */
const stopEvent = e => {
  e.preventDefault();
  e.stopPropagation();
}

const gameTimer = elem => {
  let elapsed = 0;
  let started;
  let interval;
  const tick = () => {
    elapsed += new Date() - started;
    started = new Date();
    elem.innerText = Math.floor(elapsed / 1000);
  }
  const start = () => {
    started = new Date();
    interval = setInterval(tick, 100);
  }
  const pause = () => {
    clearInterval(interval);
    tick();
  }
  const reset = () => {
    if (interval) pause();
    elapsed = 0;
    elem.innerText = 0;
  }
  reset();
  return { start, pause, reset }
}


const mines = () => {
  let gameStarted = false;
  let mines;
  // --------------------------------
  const overlay = createElem({
    onLClick: () => pause(),
    classes: ['overlay']
  });
  // --------------------------------
  const gameStart = createElem({
    onLClick: e => stopEvent(e),
    classes: ['gameStart']
  });
  const content = createElem({
    parent: gameStart,
    classes: ['content']
  });
  const title = createElem({
    parent: content,
    classes: ['title']
  })
  const buttons = createElem({
    parent: content,
    classes: ['buttons']
  });
  Object.keys(gameSizes).forEach(k => {
    createElem({
      parent: createElem({ parent: buttons, classes: ['startButton'] }),
      elemType: 'button',
      onLClick: () => start(gameSizes[k].w, gameSizes[k].h)
    }).innerText = k;
  });
  // --------------------------------
  const statusBoard = createElem({ classes: ['statusBoard'] });
  createElem({ parent: statusBoard }).innerText = 'Time';
  const timeDisplay = createElem({ parent: statusBoard, classes: ['time'] });
  const timer = gameTimer(timeDisplay);
  // --------------------------------

  const gameGrid = createElem({
    onLClick: e => stopEvent(e),
    classes: ['gameGrid']
  });

  const pause = () => {
    timer.pause();
    window.oncontextmenu = e => true;
    overlay.classList.remove('shown');
    setTimeout(() => document.body.removeChild(overlay), 500);
  }

  const resume = () => {
    timer.start();
    window.oncontextmenu = e => false;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('shown'), 100);
  }

  const reset = () => {
    gameStarted = false;
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
    if (gameStarted) return;
    gameStarted = true;
    timer.reset();
    gameGrid.appendChild(statusBoard);
    const grid = createGrid(w, h, (r, rI) => {
      const row = createElem({
        parent: gameGrid,
        classes: ['row']
      });
      return (c, cI) => ({
        y: rI,
        x: cI,
        index: rI * w + cI,
        value: 0,
        elem: createElem({
          parent: row, 
          onLClick: () => click(cI, rI), 
          onRClick: () => mark(cI, rI), 
          classes: ['cell', 'hidden']
        })
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
    }, 250);

    const reveal = (x, y) => {
      const adjacent = (accrued, cell) => {
        if (accrued.indexOf(cell) == -1) {
          accrued.push(cell);
          if (cell.value === 0) {
            const bdr = border(cell.x, cell.y).map(i => byIndex(i));
            for(let i = 0; i < bdr.length; i++)
              if (accrued.indexOf(bdr[i]) == -1) adjacent(accrued, bdr[i]);
          }
        }
        return accrued;
      }

      const cell = byCoord(x, y);
      if (!cell.elem.classList.contains('hidden') || 
        cell.elem.classList.contains('marked')) return;
      if (cell.value === 9) {
        cell.elem.classList.remove('hidden');
        boom(cell.x, cell.y);
        return;
      }
      if (cell.value > 0) {
        cell.elem.classList.remove('hidden');
        cell.elem.innerText = cell.value;
      }
      else {
        revealedCells = byDist(cell, adjacent([], cell));
        revealedCells.forEach((cells, i) => {
          setTimeout(() => {
            cells.forEach(c => {
              c.elem.classList.remove('hidden');
              if (c.value > 0) c.elem.innerText = c.value;
            });
          }, i * revealDelay);
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
      if (!mines) return;
      const cell = byCoord(x, y);
      if (!cell.elem.classList.contains('hidden')) return;
      if (!cell.elem.classList.contains('marked')) cell.elem.classList.add('marked');
      else cell.elem.classList.remove('marked');
      if (remainingUnmarked() === 0) win();
    }

    // first click places mines
    const click = (x, y) => {
      if (!mines) {
        mines = generateMines(w, h, 0.16, x, y);
        timer.start();
      }
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
      timer.pause();

      const unmarked = byDist(byCoord(x, y), mines.reduce((f, m) => {
        const cell = byIndex(m);
        if (!cell.elem.classList.contains('marked')) f.push(cell);
        return f;
      }, []));
      unmarked.forEach((um, i) => {
        setTimeout(() => um.forEach(c => c.elem.classList.add('boom')), i * boomDelay);
      });
      
      setTimeout(() => {
        reset();
      }, unmarked.length * 50 + 1000);
    }
  }

  window.oncontextmenu = e => false;
  document.body.appendChild(overlay);
  overlay.appendChild(gameStart);
  setTimeout(() => {
    overlay.classList.add('shown');
    setTimeout(() => gameStart.classList.add('shown'), 500);
  }, 100);

  return { pause, resume }
};