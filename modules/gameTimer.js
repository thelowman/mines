export const gameTimer = elem => {
  let elapsed = 0;
  let started;
  let interval;
  const tick = () => {
    elapsed += new Date() - started;
    started = new Date();
    elem.innerText = Math.floor(elapsed / 1000);
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
    elem.innerText = 0;
  }
  reset();
  return { start, pause, reset }
}
