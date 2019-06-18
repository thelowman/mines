/*
 * Static Display Elements
 * gameBoard - The display area for the mine field.
 *
 * Dynamic Display Elements
 * gameGrid - The HTML minefield
 */

/**
* This is the data for the mine field.  It is
* a 2 dimensional array of gameSquare objects.
* The array is structured as an array of rows
* where each row is an array of grid squares.
* Rows run vertically downward so grid 0, 0 is
* at the top left of the display.
*/
var mineData;
/** The time the game started. */
var startedOn;
/** A reference to the interval so it can be cleared. */
var interval;
/** If true then the game is over! */
var gameOver;

function clear(){
  if(typeof(gameGrid) !== 'undefined')
    gameBoard.removeChild(gameGrid);
}


function startSmall(){ startGame(8, 8, .16) }
function startMedium(){ startGame(16, 16, .16); }
function startLarge(){ startGame(32, 32, .16); }

function startGame(width, height, mineRatio){
  clear();
  mineData = new minefield(width, height, mineRatio, squareExposed, win, loose);
  mineData.elem.id = 'gameGrid';
  mineData.elem.className = 'grid';
  gameBoard.appendChild(mineData.elem);
  gameOver = false;
  timer.innerText = '0:00';
}

/**
 * Called by the minefield when the user clicks
 * a square.  If the game hasn't started yet
 * this kicks off.
 */
function squareExposed(){
  if(!startedOn && !gameOver){
    startedOn = new Date();
    interval = setInterval(()=>{
      var d = new Date();
      var t = d.valueOf() - startedOn.valueOf();
      var m = Math.floor(t / (1000 * 60));
      t -= m * (1000 * 60);
      var s = Math.floor(t / 1000);

      var txt = '';
      if(m < 10) txt += '0';
      txt += m + ':';
      if(s < 10) txt += '0';
      txt += s;
      timer.innerText = txt;

      progress.innerText = mineData.markedMines + '/' + mineData.numMines;
    }, 500);
  }
}

/**
 * Send in numbers and get images.
 */
function img(val){

}

function win(){
  clearInterval(interval);
  startedOn = undefined;
  gameOver = true;
}
function loose(){
  clearInterval(interval);
  startedOn = undefined;
  gameOver = true;
}