const flag = {
  none: 0,
  marked: 1,
  question: 2
}

function square(x, y, size, minePlacement, onExpose, onIslandFound, onMark, onExplode){

  var _nearbyMines = 0;
  var _mine = false;
  var _marker = flag.none;
  var _exposed = false;
  var _gameOver = false;
  var _islandFound = onIslandFound;
  var _explode = onExplode;

  // Definition of a "square".
  var s = {
    x: x,
    y: y,
    htmlElem: createElement(),
    mark: mark,
    expose: expose,
    endGame: endGame
  }

  init(minePlacement);



  /**
   * Creates the HTML element for the square and connects
   * handlers for the left and right click events.
   */
  function createElement(){
    var elem = document.createElement('div');
    elem.className = 'square hidden';
    elem.style.width = (size - 2) + 'px';  // allow for border
    elem.style.height = (size - 2) + 'px'; // allow for border
    elem.onclick = (e)=>{
      e.preventDefault();
      s.expose();
    }
    elem.oncontextmenu = (e)=>{
      e.preventDefault();
      s.mark();
    }
    return elem;
  }

  /**
   * Initialize either the presense of a mine or the number of
   * mines adjacent to this square.
   *
   * @param mineArray An array of locations with mines.
   */
  function init(mineArray){
    var adjacentMines = 0;
    for(var i = 0; i < mineArray.length; i++){
      if(mineArray[i].x == s.x && mineArray[i].y == s.y){
        _mine = true;
        return;
      }
      if(
        mineArray[i].x > s.x - 2 &&
        mineArray[i].x < s.x + 2 &&
        mineArray[i].y > s.y - 2 &&
        mineArray[i].y < s.y + 2){
          adjacentMines++;
        }
    }
    _nearbyMines = adjacentMines;
  }

  /**
   * Exposes the contents of the square.
   */
  function expose(){
    if(_gameOver) return;
    if(!_marker == flag.none) return; // protect flagged squares
    if(_exposed) return; // the suqre has already been exposed

    if(_mine){
      s.htmlElem.className = 'square mine';
      if(typeof(_explode) === 'function') _explode();
    }
    else{
      s.htmlElem.className = 'square';
      if(_nearbyMines > 0)
        s.htmlElem.style['background-image'] = 'url("img/' + _nearbyMines + '.png")';
      s.htmlElem.style['background-size'] = 'contain';
    }
    _exposed = true;
    onExpose();
    if(!_mine && _nearbyMines == 0 && typeof(_islandFound) === 'function') _islandFound(this);
  }

  /**
   * Toggles the status of a flag on the square.
   * Flags have 3 states: none, flag, and flag-question
   */
  function mark(){
    if(_gameOver) return;
    if(_exposed) return; // can't mark it after exposing it
    switch(_marker){
      case flag.none:
        _marker = flag.marked;
        s.htmlElem.style['background-image'] = 'url("img/flag.png")';
        break;
      case flag.marked:
        _marker = flag.question;
        s.htmlElem.style['background-image'] = 'url("img/question.png")';
        break;
      default:
        _marker = flag.none;
        s.htmlElem.style['background-image'] = 'unset';
        break;
    }
    onMark(_marker);
  }

  function endGame(){
    _gameOver = true;
    if(_mine && _marker == flag.none) //s.htmlElem.className = 'square mine';
      s.htmlElem.style['background-image'] = 'url("img/unfound-mine.png")'
    else{
      if(_marker > flag.none && !_mine){
        // bad marker
        s.htmlElem.className = 'square mine';
      }
    }
  }

  return s;
}