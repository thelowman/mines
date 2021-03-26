/**
 * Creates a timer for the game.
 * @param {HTMLElement} elem 
 * @returns 
 */
export const gameTimer = elem => {
  let elapsed = 0;
  let started;
  let interval;
  const tick = () => {
    elapsed += new Date().valueOf() - started;
    started = new Date();
    elem.innerText = (elapsed / 1000).toFixed(1);
  }
  const start = () => {
    started = new Date();
    interval = setInterval(tick, 100);
  }
  const pause = () => {
    clearInterval(interval);
    tick();
  }
  const reset = () => {
    if (interval) pause();
    elapsed = 0;
    elem.innerText = (0).toFixed(1);
  }
  reset();
  return { start, pause, reset, get time() { return (elapsed / 1000).toFixed(1); } }
}
