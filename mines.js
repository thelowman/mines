import './modules/style.js';
import { createElements } from './modules/createElements.js';
import { gameTimer } from './modules/gameTimer.js';
import { gameSizes, initCell } from './skin/settings.js';
import { startGame } from './modules/game.js';

const mines = () => {
  let gameStarted = false;

  const {
    overlay,
    gameStart,
    result,
    startButtons,
    statusBoard,
    timeDisplay,
    gameGrid,
    createRow,
    createCell
  } = createElements(gameSizes, initCell);

  gameGrid.appendChild(statusBoard); // move to create element
  overlay.addEventListener('click', () => pause());
  startButtons.forEach(btn => btn.addEventListener('start', e => start(e.detail.w, e.detail.h)));
  const timer = gameTimer(timeDisplay);



  const start = (w, h) => {
    if (!gameStarted) {
      gameStarted = true;
      gameStart.classList.remove('shown');
      startGame(timer, gameGrid, createRow, createCell, won, lost, w, h);
      setTimeout(() => {
        overlay.removeChild(gameStart);
        overlay.appendChild(gameGrid);
        setTimeout(() => gameGrid.classList.add('shown'), 100)
      }, 250);
    }
    else console.warn('A game is already in progress.');
  }
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
      overlay.removeChild(gameGrid);
      overlay.appendChild(gameStart);
      while(gameGrid.firstChild) gameGrid.removeChild(gameGrid.firstChild);
      gameGrid.appendChild(statusBoard); // put the status board back
      setTimeout(() => gameStart.classList.add('shown'), 100);
      gameStarted = false;      
    }, 500);
  }
  const won = () => {
    result.innerText = `You Won!  Total time: ${timer.time} seconds.`;
    reset();
  }
  const lost = () => {
    result.innerText = 'Oops!';
    reset();
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