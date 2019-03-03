/**
 * Represents a minefield.
 *
 * @property width The width of the minefield.
 * @property height The height of the minefield.
 * @property numMines The number of mines the minefield contains.
 * @property grid An array of rows, then cells that represent the minefield.
 * @property elem An HTML DIV element for displaying the minefield.
 */
function minefield(width, height, mineDensity, onSquareExposed, onWin, onLoose){

  // Definition of a minefield
  var m = {
    width: width,
    height: height,
    numMines: 0,
    markedMines: 0,
    exposedSquares: 0,
    grid: [],
    elem: null,
    getSquare: getSquare
  }

  buildGrid(plantMines(mineDensity));
  buildGridHTML();

  /**
   * Called by squares that are exposed without
   * setting off a mine.
   */
  function squareExposed(){
    m.exposedSquares++;
    if(typeof(onSquareExposed) === 'function') onSquareExposed();
    if(m.exposedSquares + m.numMines == m.width * m.height){
      onWin();
    }
  }

  function mineMarked(val){
    if(val == flag.none)
      m.markedMines--;
    else
      m.markedMines++;
  }

  /**
   * Expose all squares that border the empty one.
   */
  function islandFound(square){
    function expose(s){ if(s) s.expose(); }

    expose(getSquare(square.x-1, square.y-1));
    expose(getSquare(square.x, square.y-1));
    expose(getSquare(square.x+1, square.y-1));
    expose(getSquare(square.x-1, square.y));
    expose(getSquare(square.x+1, square.y));
    expose(getSquare(square.x-1, square.y+1));
    expose(getSquare(square.x, square.y+1));
    expose(getSquare(square.x+1, square.y+1));
  }

  /**
   * Called when a mine is exposed.  This ends the game.
   */
  function explode(){
    for(var y = 0; y < m.grid.length; y++){
      for(var x = 0; x < m.grid[y].length; x++){
        m.grid[y][x].endGame();
      }
    }
    onLoose();
  }

  /**
   * Returns the "square" at the given coordinates.
   */
  function getSquare(x, y){
    if(y >= 0 && y < m.width){
      if(x >= 0 && x < m.height){
        return m.grid[y][x];
      }
    }
  }

  /**
   * Creates the grid, passing the mine locations to each
   * for use in initialization.
   *
   * @param minePlacement The array of mine locations.
   */
  function buildGrid(minePlacement){
    // squares need to know this
    var cellSize = gameBoard.clientWidth / m.width;
    // rows
    for(var y = 0; y < m.height; y++){
      var row = [];
      m.grid.push(row);

      // columns
      for(var x = 0; x < m.width; x++){
        var cell = new square(x, y, cellSize, minePlacement, squareExposed, islandFound, mineMarked, explode);
        row.push(cell);
      }
    }
  }

  /**
   * Adds the HTML elements to the minefield.
   *
   * Each "square" generates its own HTML.  Here we just
   * need to create the rows and add the htmlElem property
   * from each square to it.
   */
  function buildGridHTML(){
    m.elem = document.createElement('div');

    for(var y = 0; y < m.grid.length; y++){
      var row = document.createElement('div');
      row.className = 'row';
      m.elem.appendChild(row);

      for(var x = 0; x < m.grid[y].length; x++){
        row.appendChild(m.grid[y][x].htmlElem);
      }
    }
  }

  /**
   * Creates a random dispersion of mines for the grid.
   *
   * @param m The minefield.
   * @param mineDensity The ratio of mines total squares. A mine density of 1 is all mines.
   * @returns An array of x,y coordinates for the mines.
   */
  function plantMines(mineDensity){
    m.numMines = Math.ceil(m.width * m.height * mineDensity);

    // the list of mine locations
    var mArray = [];

    // generates a random spot for a mine
    function addMine(){
      var mineX = Math.floor(Math.random() * m.width);
      var mineY = Math.floor(Math.random() * m.height);
      return {
        x: mineX,
        y: mineY
      }
    }

    // generate mines until enough mines exist
    // and no square will have two
    for(var i = 0; i < m.numMines; i++){
      var mine;
      var isAvailable = false;
      while(!mine || !isAvailable){
        mine = addMine();
        isAvailable = true;
        for(var a = 0; a < mArray.length; a++){
          if(mArray[a].x == mine.x && mArray[a].y == mine.y){
            isAvailable = false;
          }
        }
      }
      mArray.push(mine);
    }
    return mArray;
  }


  return m;
}