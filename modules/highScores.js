/**
 * @typedef HighScore
 * @property {number} width The width of the grid.
 * @property {number} height The height of the grid.
 * @property {Score[]} scores An array of the best three times.
 * 
 * @typedef Score
 * @property {number} time The time taken to clear the mine field.
 * @property {object} date The date the score was recorded.
 */

/** The local storage key where high scores are kept. */
const storageKey = 'HighScores';
const numScoresToKeep = 3;

/**
 * Returns the high scores for the game grid size specified.
 * @param {number} w Width of the game grid.
 * @param {number} h Height of the game grid.
 * @returns {Score[]}
 */
export const getHighScores = (w, h) => {
  const scores = JSON.parse(localStorage.getItem(storageKey));
  if (scores) {
    /** @type HighScore */
    let forGame = scores.find(s => s.width === w && s.height === h);
    if (forGame) return forGame.scores;
    return []
  }
  return [];
}

/**
 * Saves the high score (if it truly is a high score) and returns
 * all the high scores for the grid size.
 * @param {number} w Width of the game grid.
 * @param {number} h Height of the game grid.
 * @param {number} time Time in seconds the game was completed.
 * @returns {Score[]}
 */
export const setHighScore = (w, h, time) => {
  let scores = JSON.parse(localStorage.getItem(storageKey));
  if (!scores) {
    scores = [];
  }
  let forGame = scores.find(s => s.width === w && s.height === h);
  if (!forGame) {
    forGame = {
      width: w,
      height: h,
      scores: []
    };
    scores.push(forGame);
  }
  forGame.scores.push({ time, date: new Date() });
  forGame.scores.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
  if (forGame.scores.length > numScoresToKeep)
    forGame.scores.splice(numScoresToKeep - 1, forGame.scores.length);
  localStorage.setItem(storageKey, JSON.stringify(scores));
  return forGame.scores;
}