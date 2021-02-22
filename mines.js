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

/** No mines until the first cell is clicked. */
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

const stopEvent = e => {
  e.preventDefault();
  e.stopPropagation();
}


const mines = () => {
  let mines;
  const overlay = createElem({
    onLClick: () => pause(),
    classes: ['overlay']
  });
  const gameStart = createElem({
    onLClick: e => stopEvent(e),
    classes: ['gameStart']
  });
  Object.keys(gameSizes).forEach(k => {
    createElem({
      parent: createElem({ parent: gameStart, classes: ['startButton'] }),
      elemType: 'button',
      onLClick: () => start(gameSizes[k].w, gameSizes[k].h)
    }).innerText = k;
  });
  const statusBoard = createElem({ classes: ['statusBoard'] });
  createElem({ parent: statusBoard, classes: ['time'] });
  createElem({ parent: statusBoard, classes: ['flagged'] });
  createElem({ parent: statusBoard, classes: ['total'] });

  const gameGrid = createElem({
    onLClick: e => stopEvent(e),
    classes: ['gameGrid']
  });

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

  window.oncontextmenu = e => false;
  document.body.appendChild(overlay);
  overlay.appendChild(gameStart);
  setTimeout(() => {
    overlay.classList.add('shown');
    setTimeout(() => gameStart.classList.add('shown'), 500);
  }, 100);

  return { pause, resume }
};