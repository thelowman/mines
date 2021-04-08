import * as el from './elemFunctions.js';

const stopEvent = e => {
  e.preventDefault();
  e.stopPropagation();
}

const createOverlay = el.compose(el.create('div'), el.addClass('overlay'));

const createGameStart = el.compose(
  el.compose(el.create('div'), el.addClass('gameStart'), el.handle('click', stopEvent)),  
  el.passthrough(el.compose(
    el.compose(el.create('div'), el.addClass('content')),
    el.passthrough(
      el.compose(el.create('div'), el.addClass('result')),
      el.compose(el.create('div'), el.addClass('title'), el.setText('Pick a game size')),
      el.compose(el.create('div'), el.addClass('buttons'))
    )
  ))
)

const startClick = size => element => 
  el.handle('click', () => element.dispatchEvent(
    new CustomEvent('start', {
      detail: {
        w: size.w,
        h: size.h 
      }
    })))(element);

const createStartButton = size => el.compose(
  el.create('button'),
  el.setText(size.name),
  el.addClass(size.class),
  startClick(size))();
  
const createStatusBoard = el.compose(
  el.compose(el.create('div'), el.addClass('statusBoard')),
  el.passthrough(
    el.compose(el.create('div'), el.setText('Time')),
    el.compose(el.create('div'), el.addClass('time'), el.setText('0'))));

// Game grid elements
const createGameGrid = el.compose(
  el.create('div'), 
  el.addClass('gameGrid'), 
  el.handle('click', stopEvent));
const createRow = el.compose(el.create('div'), el.addClass('row'));
const createCell = (init) => (p, l, r) => 
  el.mouseButtons(el.compose(
    el.create('div'),
    el.addClass('cell', 'hidden', `c${(Math.random() * 10).toFixed(0)}`),
    init)(p))(l, r);
  







export const createElements = (gameSizes, initCell) => {
  const overlay = createOverlay();
  const gameStart = createGameStart();

  const startButtons = gameSizes.map(size => createStartButton(size));
  const btnDiv = gameStart.querySelector('.buttons')
  startButtons.forEach(btn => {
    el.compose(el.create('div'), el.addClass('startButton'))(btnDiv).appendChild(btn);
  });

  const statusBoard = createStatusBoard();
  const gameGrid = createGameGrid();

  return {
    overlay,
    gameStart,
    result:gameStart.querySelector('.result'),
    startButtons,
    statusBoard,
    timeDisplay:statusBoard.querySelector('.time'),
    gameGrid,
    createRow,
    createCell: createCell(initCell)
  }
}