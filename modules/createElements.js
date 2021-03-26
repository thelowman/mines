import {
  compose,
  passthrough,
  createElement,
  addClass,
  setText,
  mouseButtons,
  handle,
} from './elemFunctions.js';

const stopEvent = e => {
  e.preventDefault();
  e.stopPropagation();
}

const createOverlay = compose(createElement('div'), addClass('overlay'));

const createGameStart = compose(
  compose(createElement('div'), addClass('gameStart'), handle('click', stopEvent)),  
  passthrough(compose(
    compose(createElement('div'), addClass('content')),
    passthrough(
      compose(createElement('div'), addClass('title'), setText('Pick a game size')),
      compose(createElement('div'), addClass('buttons'))
    )
  ))
)

const startClick = size => elem => 
  handle('click', () => elem.dispatchEvent(
    new CustomEvent('start', {
      detail: {
        w: size.w,
        h: size.h 
      }
    })))(elem);

const createStartButton = size => compose(
  createElement('button'),
  setText(size.name),
  addClass(size.class),
  startClick(size))();
  
const createStatusBoard = compose(
  compose(createElement('div'), addClass('statusBoard')),
  passthrough(
    compose(createElement('div'), setText('Time')),
    compose(createElement('div'), addClass('time'), setText('0'))));

// Game grid elements
const createGameGrid = compose(
  createElement('div'), 
  addClass('gameGrid'), 
  handle('click', stopEvent));
const createRow = compose(createElement('div'), addClass('row'));
const createCell = (init) => (p, l, r) => 
  mouseButtons(compose(
    createElement('div'),
    addClass('cell', 'hidden'),
    init)(p))(l, r);
  







export const createElements = (gameSizes, initCell) => {
  const overlay = createOverlay();
  const gameStart = createGameStart();

  const startButtons = gameSizes.map(size => createStartButton(size));
  const btnDiv = gameStart.querySelector('.buttons')
  startButtons.forEach(btn => {
    compose(createElement('div'), addClass('startButton'))(btnDiv).appendChild(btn);
  });

  const statusBoard = createStatusBoard();
  const gameGrid = createGameGrid();

  return {
    overlay,
    gameStart,
    startButtons,
    statusBoard,
    timeDisplay:statusBoard.querySelector('.time'),
    gameGrid,
    createRow,
    createCell: createCell(initCell)
  }
}