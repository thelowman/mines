/**
 * Constructs an array of the specified length and runs the provided function
 * in each cell.
 * @param {number} l Length of the array to create.
 * @param {(index:number) => *} fn Return what the cell should contain.
 * @returns {*[]}
 */
const arrN = (l, fn) => new Array(l).fill(null).reduce((a, b, i) => a.concat(fn(i)), []);

/**
 * Constructs a 2d array the specified width and height/depth and runs the
 * provided function in each cell.
 * @param {number} w The width of the 2d array.
 * @param {number} h The height (or depth) of the 2d array.
 * @param {(index:number) => *} fn Return what the cell should contain.
 * @returns {*[]}
 */
export const createGrid = (w, h, fn) => arrN(h, i => [arrN(w, fn(i))]);

/**
 * Constructs a function that returns the cell at a given index.
 * @param {number} w The width of the grid.
 * @param {number} h The height of the grid.
 * @param {*[][]} g The grid of game cells. 
 * @returns {(i:number) => object|undefined} A function to find a cell by index.
 */
export const cell_i = (w, h, g) => i => i > -1 && i < w * h ? g[Math.floor(i / w)][i % w] : undefined;

/**
 * Constructs a function that returns a game cell at the specified xy coordinates.
 * @param {number} w The width of the grid.
 * @param {number} h The height of the grid.
 * @param {*[][]} g The grid of game cells. 
 * @returns {(x:number, y:number) => object|undefined} A function to find a cell by xy coordinates.
 */
export const cell_xy = (w, h, g) => (x, y) => x >= 0 && x < w && y >= 0 && y < h ? g[y][x] : undefined;

/**
 * Constructs a function that returns an array of indexes for cells
 * that border a pair of xy coordinates.
 * @param {number} w The width of the grid.
 * @param {number} h The height of the grid.
 * @returns {(x:number, y:number) => number[]} A function to get cells that border an xy coordinate.
 */
export const border_i = (w, h) => (x, y) => {
  const startPt = x + y * w;
  const b = [];
  if (x > 0 && y > 0) b.push(startPt - w - 1);
  if (y > 0) b.push(startPt - w);
  if (y > 0 && x < (w - 1)) b.push(startPt - w + 1);
  if (x > 0) b.push(startPt - 1);
  if (x < (w - 1)) b.push(startPt + 1);
  if (x > 0 && y < (h - 1)) b.push(startPt + w - 1);
  if (y < (h - 1)) b.push(startPt + w);
  if (x < (w - 1) && y < (h - 1)) b.push(startPt + w + 1);
  return b;
}

/**
 * Arranges cells according to their distance from the starting cell.  The
 * result is an array of arrays where each element of the outer array
 * represents cells that are the same distance.
 * @param {*} from The cell at the center.
 * @param {*} targets Array of cells to arrange.
 * @returns {*[][]} An array of array of cells arranged by distance.
 */
export const byDist = (from, targets) => targets.reduce((f, cell) => {
  const d = Math.floor(Math.sqrt(Math.pow(cell.x - from.x, 2) + Math.pow(cell.y - from.y, 2)));
  if (!f[d]) f[d] = [];
  f[d].push(cell);
  return f;
}, []);

/**
 * Generates a random dispersement of mines, avoiding the cell that was clicked.
 * @param {number} w Width of the grid.
 * @param {number} h Height of the grid.
 * @param {number} d Density of mines (0 - 1).
 * @param {number} x X coordinate of the first click (no mines allowed here).
 * @param {number} y Y coordinate of the first click (no mines allowed here).
 * @returns {number[]} Indexes of mines.
 */
 export const generateMines = (w, h, d, x, y) => {
  const count = Math.ceil(h * w * d);
  const mines = [];
  const avoid = border_i(w, h)(x, y);
  avoid.push(x + y * w);
  while(mines.length < count) {
    let check = Math.floor(Math.random() * h * w);
    if (
      mines.indexOf(check) === -1 &&
      avoid.indexOf(check) === -1
    ) mines.push(check);
  }
  return mines;
}

/** @returns {number} Function to count the number of marked cells. */
export const marked = grid => grid.reduce((t, row) => t += row.reduce((t2, cell) => 
  cell.elem.classList.contains('marked') ?
    t2 += 1 : t2
  , 0), 0);

/** @returns {number} Function to count the number of unmarked cells without mines. */
export const remainingCells = grid => grid.reduce((t, row) => t += row.reduce((t2, cell) => 
  cell.elem.classList.contains('hidden') && cell.value < 9 ?
    t2 += 1 : t2
    , 0), 0);

/** @returns {number} Function to count the number of mines not yet marked. */
export const remainingUnmarked = grid => grid.reduce((t, row) => t += row.reduce((t2, cell) => 
  cell.value === 9 && !cell.elem.classList.contains('marked') ?
    t2 += 1 : t2
    , 0), 0);
