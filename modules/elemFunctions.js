export const addClass = (...styles) => elem => { elem.classList.add(...styles); return elem; }
export const buttons = (onLeft, onRight) => elem => {
  elem.addEventListener('mousedown', e => {
    if (e.which === 1) onLeft();
    if (e.which === 3) onRight();
  });
  return elem;
}