/** Creates an array of len, calls fn with the index on every cell.  */
const arrN = (len, fn) => new Array(len).fill(null).reduce((a,b,i) => a.concat([fn(i)]), []);
/** Gets a cell from a zero based index. */
const cell_i = (w, h, f) => i => i > 0 && i < w * h ? f[Math.floor(i / w)][i % w] : undefined;
/** Gets a cell from corrdinates, across then down. */
const cell_xy = (w, h, f) => (x, y) => x > 0 && x <= w && y > 0 && y <= h ? f[y - 1][x - 1] : undefined;

/** Creates HTML for the grid. */
// const gridHtml = field => field.reduce((h, r) => `${h}<div class="row">${cell(r)}</div>`, '');
/** Creates a cell's HTML. */
// const cell = row => row.reduce((h, c) => 
//   c.marked ?
//   `${h}<div class="cell marked">${c.value}</div>` : 
//   c.shown ?
//   `${h}<div class="cell shown">${c.value}</div>` : 
//   `${h}<div class="cell">${c.value}</div>`
//   , '');

const doi = (len, fn) => new Array(len).fill(null).reduce((a, b) => a.concat([fn(b)]))

const init = (elem, w, h) => {
  const mineField = arrN(h, rowIndex => {
    const e = document.createElement('div');
    e.classList.add('row');
    return arrN(w, colIndex => {
      const e = document.createElement('div');
      e.classList.add('cell');
      return {e}
    })
  })
  console.log(mineField);
  const field = arrN(h, r => arrN(w, c => ({
    shown: false,
    marked: false,
    value: 0
  })));
  // elem.innerHTML = gridHtml(field);
  return {
    index: cell_i(w, h, field),
    xy: cell_xy(w, h, field)
    // update: () => { elem.innerHTML = gridHtml(field) }
  }
}




const dsfsd = (h, w, d, x, y) => {
  const count = Math.ceil(h * w * d);
  const mines = [];
  const startPt = x + y * w;
  const avoid = [
    startPt - w - 1,
    startPt - w,
    startPt - w + 1,
    startPt - 1,
    startPt,
    startPt + 1,
    startPt + w -1,
    startPt + w,
    startPt + w + 1
  ]
  let placed = 0;
  while(placed < count) {
    let check = Math.floor(Math.random() * h * w);
    if (
      mines.indexOf(check) === -1 &&
      avoid.indexOf(check) === -1
    ) {
      mines.push(check);
      placed++;
    }
  }
  return mines;
}




/**
 * Places mines.  Avoiding areas around the provided x, y location.
 * @param {number} h Height of the grid 
 * @param {number} w Width of the grid
 * @param {number} d Density of mines (> 0, < 1)
 * @param {number} x X position
 * @param {number} y Y position
 */
const generateMines = (h, w, d, x, y) => {
  const count = Math.ceil(h * w * d);
  const mines = [];
  const startPt = x + y * w;
  const avoid = [
    startPt - w - 1,
    startPt - w,
    startPt - w + 1,
    startPt - 1,
    startPt,
    startPt + 1,
    startPt + w -1,
    startPt + w,
    startPt + w + 1
  ]
  let placed = 0;
  while(placed < count) {
    let check = Math.floor(Math.random() * h * w);
    if (
      mines.indexOf(check) === -1 &&
      avoid.indexOf(check) === -1
    ) {
      mines.push(check);
      placed++;
    }
  }
  return mines;
}


/** Starts a game. */
// const start = (elem, w, h) => {
//   const field = arrN(h, r => arrN(w, c => ({
//     shown: false,
//     marked: false,
//     value: 0
//   })));
//   elem.innerHTML = gridHtml(field);

//   // Each returns
//   const isLeftEdge = i => i % w !== 0;
//   const isRightEdge = i => i % w !== w - 1;
//   const isTopEdge = i => i > w;
//   const isBottomEdge = i => i < w * (h - 1);

//   /** Returns a cell going across, then down. */
//   const xy = (x, y) => x > 0 && x <= w && y > 0 && y <= h ? field[y - 1][x - 1] : undefined;
//   const byIndex = i => i > 0 && i < w * h ? field[Math.floor(i / w)][i % w] : undefined;
//   let mines;

//   return {
//     reveal: (x, y) => {
//       if (xy(x, y)) {
//         if (!mines) mines = generateMines(h, w, 0.16, x, y);
//         mines.forEach(m => byIndex(m).value = 9);
//         xy(x, y).shown = true;
//         // mines.reduce()
//         elem.innerHTML = gridHtml(field);
//       }
//       else console.warn('Out of bounds.');

//       // xy(x, y) && !xy(x, y).marked ? xy(x, y).shown = true: console.warn('Out of bounds.');
//       // elem.innerHTML = gridHtml(field);
//     },
//     r2: i => { // just for testing
//       if (byIndex(i)) {
//         byIndex(i).shown = true;
//         elem.innerHTML = gridHtml(field);
//       }
//       else console.warn('Out of bounds')
//     },
//     mark: (x, y) => {
//       xy(x, y) && !xy(x, y).shown ? xy(x, y).marked = true: console.warn('Out of bounds.');
//       elem.innerHTML = gridHtml(field);
//     }
//   }
// }