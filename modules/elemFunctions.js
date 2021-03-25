export const createElement = tag => parent => parent ?
  parent.appendChild(document.createElement(tag)) :
  document.createElement(tag);

export const setText = text => elem => { elem.innerText = text; return elem; }
export const addClass = (...styles) => elem => { elem.classList.add(...styles); return elem; }

export const mouseButtons = elem => (onLeft, onRight) => {
  elem.addEventListener('mousedown', e => {
    if (e.which === 1) onLeft();
    if (e.which === 3) onRight();
  });
  return elem;
}

export const handle = (eventName, action) => elem => {
  elem.addEventListener(eventName, action);
  return elem;
}