import {
  createGrid,
  cell_i,
  cell_xy, 
  border_i,
  byDist,
  generateMines,
  remainingCells,
  remainingUnmarked
} from './gridFunctions.js';
import {
  revealDelay,
  boomDelay,
  revealCell,
  explodeCell
} from '../skin/settings.js';


export const startGame = (timer, gameGrid, createRow, createCell, won, lost, w, h) => {
  let mines;

  timer.reset();
  const grid = createGrid(w, h, (rI) => {
    const row = createRow(gameGrid);
    return (cI) => ({
      y: rI,
      x: cI,
      index: rI * w + cI,
      value: 0,
      elem: createCell(row, () => click(cI, rI), () => mark(cI, rI))
    });
  });

  const byIndex = cell_i(w, h, grid);
  const byCoord = cell_xy(w, h, grid);
  const border = border_i(w, h);

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
      // Hit a mine
      cell.elem.classList.remove('hidden');
      revealCell(cell);
      boom(cell.x, cell.y);
      return;
    }
    if (cell.value > 0) {
      // Hit a cell near a mine
      cell.elem.classList.remove('hidden');
      cell.elem.classList.add('revealed');
      revealCell(cell);
      cell.elem.innerText = cell.value;
      if (remainingCells(grid) === 0) win();
    }
    else {
      // Hit a cell away from any mines
      let revealedCells = byDist(cell, adjacent([], cell));
      revealedCells.forEach((cells, i) => {
        setTimeout(() => {
          cells.forEach(c => {
            if (c.elem.classList.contains('hidden')) {
              c.elem.classList.remove('hidden');
              c.elem.classList.add('revealed', 'multiple');
              if (c.value > 0) c.elem.innerText = c.value;
              revealCell(c);
            }
          });
        }, i * revealDelay);
      });
      setTimeout(() => {
        if(remainingCells(grid) === 0) win();
      }, revealedCells.length * revealDelay);
    }
  }

  const mark = (x, y) => {
    if (!mines) return;
    const cell = byCoord(x, y);
    if (!cell.elem.classList.contains('hidden')) return;
    if (!cell.elem.classList.contains('marked')) cell.elem.classList.add('marked');
    else cell.elem.classList.remove('marked');
    if (remainingUnmarked(grid) === 0) win();
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
    timer.pause();
    mines = null;
    won(w, h);
  }

  const boom = (x, y) => {
    timer.pause();
    
    gameGrid.classList.add('boom');
    grid.forEach(r => 
      r.forEach(c => { 
        if (c.elem.classList.contains('marked') && c.value < 9)
          c.elem.classList.add('wrong');
      }));

    const unmarked = byDist(byCoord(x, y), mines.reduce((f, m) => {
      const cell = byIndex(m);
      if (!cell.elem.classList.contains('marked')) f.push(cell);
      return f;
    }, []));
    unmarked.forEach((um, i) => {
      setTimeout(() => um.forEach(c => {
        c.elem.classList.add('boom');
        explodeCell(c);
      }), i * boomDelay);
    });
    setTimeout(() => gameGrid.classList.remove('boom'), unmarked.length * boomDelay);
    
    setTimeout(() => {
      mines = null;
      lost(w, h);
    }, unmarked.length * 50 + 1000);
  }
}