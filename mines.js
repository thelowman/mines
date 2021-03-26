import './modules/style.js';
import { createElements } from './modules/createElements.js';
import { gameTimer } from './modules/gameTimer.js';
import {
  createGrid,
  cell_i,
  cell_xy, 
  border_i,
  byDist,
  generateMines,
  remainingCells,
  remainingUnmarked
} from './modules/gridFunctions.js';
import {
  revealDelay,
  boomDelay,
  gameSizes,
  initCell,
  revealCell,
  explodeCell
} from './skin/settings.js';


const compose = (...fns) => arg => fns.reduce((a, fn) => fn(a), arg);

const needFuncName = (timer, overlay, gameGrid, gameStart) => {
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
    gameGrid.classList.remove('shown');
    setTimeout(() => {
      while(gameGrid.firstChild) gameGrid.removeChild(gameGrid.firstChild);
      overlay.removeChild(gameGrid);
      overlay.appendChild(gameStart);
      setTimeout(() => gameStart.classList.add('shown'), 100);
    }, 500);
  }
  return { pause, resume, reset }
}


const mines = () => {
  let gameStarted = false;
  let mines;

  const {
    overlay,
    gameStart,
    startButtons,
    statusBoard,
    timeDisplay,
    gameGrid,
    createRow,
    createCell
  } = createElements(gameSizes, initCell);

  overlay.addEventListener('click', () => pause());
  startButtons.forEach(btn => btn.addEventListener('start', e => start(e.detail.w, e.detail.h)));
  const timer = gameTimer(timeDisplay);

  const { pause, resume, reset } = needFuncName(timer, overlay, gameGrid, gameStart);

  const start = (w, h) => {
    if (gameStarted) return;
    gameStarted = true;
    timer.reset();
    gameGrid.appendChild(statusBoard);
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
        revealCell(cell);
        boom(cell.x, cell.y);
        return;
      }
      if (cell.value > 0) {
        cell.elem.classList.remove('hidden');
        revealCell(cell);
        cell.elem.innerText = cell.value;
      }
      else {
        let revealedCells = byDist(cell, adjacent([], cell));
        revealedCells.forEach((cells, i) => {
          setTimeout(() => {
            cells.forEach(c => {
              c.elem.classList.remove('hidden');
              revealCell(cell);
              if (c.value > 0) c.elem.innerText = c.value;
            });
          }, i * revealDelay);
        });
      }
      if (remainingCells(grid) === 0) win();
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
      reset();
      gameStarted = false;
      mines = null;
    }

    const boom = (x, y) => {
      timer.pause();

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
      
      setTimeout(() => {
        reset();
        gameStarted = false;
        mines = null;
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

// At the moment, there must be an element with an id of "play"
// to kick things off.
let game;
const playClick = () => {
  if (game) game.resume();
  else game = mines();
}
document.getElementById('play').addEventListener('click', playClick);