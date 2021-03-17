/**
 * Constructs a new HTML element.  If the parent is specified in "params" the
 * new element will automatically be added to the parent's heirarcy.
 * > NOTE: onLClick and onRClick will be called in response to a
 * > mouse down event rather than an acutal click event.
 * @param {CreateElemParams} params 
 */
 const createElem = params => {
  const create = tag => document.createElement(tag ? tag : 'div');
  const { parent, elemType, onLClick, onRClick, classes } = params;
  const elem = parent ?
    parent.appendChild(create(elemType)) :
    create(elemType);
  if (classes) elem.classList.add(...classes);
  if (onLClick || onRClick) {
    elem.addEventListener('mousedown', e => {
      if (e.which === 1 && onLClick) onLClick(e);
      if (e.which === 3 && onRClick) onRClick(e);
    });
  };
  return elem;
}

export const create = (gameSizes, startFn, pauseFn) => {
  const overlay = createElem({
    onLClick: () => pauseFn(),
    classes: ['overlay']
  });

  const gameStart = createElem({
    onLClick: e => stopEvent(e),
    classes: ['gameStart'],
    children: [{
      classes: ['content'],
      children: [
        { classes: ['title'] },
        {
          classes: ['buttons'],
          children: Object.keys(gameSizes).map(key => ({
            elemType: 'button',
            onLClick: () => startFn(gameSizes[key].w, gameSizes[key].h)
          }))
        }
      ]
    }]
  })

  // const gameStart = createElem({
  //   onLClick: e => stopEvent(e),
  //   classes: ['gameStart']
  // });
  // const content = createElem({
  //   parent: gameStart,
  //   classes: ['content']
  // });
  // const title = createElem({
  //   parent: content,
  //   classes: ['title']
  // })
  // const buttons = createElem({
  //   parent: content,
  //   classes: ['buttons']
  // });
  // Object.keys(gameSizes).forEach(k => {
  //   createElem({
  //     parent: createElem({ parent: buttons, classes: ['startButton'] }),
  //     elemType: 'button',
  //     onLClick: () => startFn(gameSizes[k].w, gameSizes[k].h)
  //   }).innerText = k;
  // });

  const sb = createElem({
    classes: ['statusBoard'],
    children: [{ text: 'Time' }]
  });
  // const statusBoard = createElem({ classes: ['statusBoard'] });
  // createElem({ parent: statusBoard }).innerText = 'Time';
  const timeDisplay = createElem({ parent: statusBoard, classes: ['time'] });

  return { createElem, overlay, gameStart, statusBoard, timeDisplay }
}