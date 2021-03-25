const compose = (...fns) => arg => fns.reduce((a, fn) => fn(a), arg);
/** Compose, with all functions receiving the same input. */
const passthrough = (...fns) => arg => fns.reduce((val, fn) => { fn(val); return val; }, arg);
import {
  createElement,
  addClass,
  setText,
  handle,
} from './elemFunctions.js';

const createOverlay = compose(createElement('div'), addClass('overlay'));

const createGameStart = compose(
  compose(createElement('div'), addClass('gameStart')),  
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

export const createElements = (gameSizes) => {
  const overlay = createOverlay();
  const gameStart = createGameStart();
  const startButtons = gameSizes.map(size => createStartButton(size));

  const btnDiv = gameStart.querySelector('.buttons')
  startButtons.forEach(btn => {
    compose(createElement('div'), addClass('startButton'))(btnDiv).appendChild(btn);
  });

  const statusBoard = createStatusBoard();

  return { overlay, gameStart, startButtons, statusBoard, timeDisplay:statusBoard.querySelector('.time') }
}