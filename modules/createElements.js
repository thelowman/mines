export const createElements = (gameSizes) => {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  const gameStart = document.createElement('div');
  gameStart.classList.add('gameStart');
  gameStart.innerHTML = `
  <div class="content">
    <div class="title">Pick a game size</div>
    <div class="buttons"></div>
  </div>`;
  const startButtons = gameSizes.map(size => {
    const btn = document.createElement('button');
    btn.innerText = size.name;
    btn.classList.add(size.class);
    btn.addEventListener('click', 
      () => btn.dispatchEvent(new CustomEvent('start', {
        detail: {
          w: size.w,
          h: size.h 
        }
      })));
    return btn;
  });
  startButtons.forEach(btn => {
    const btnDiv = gameStart.querySelector('.buttons').appendChild(document.createElement('div'));
    btnDiv.classList.add('startButton');
    btnDiv.appendChild(btn);
  });

  const statusBoard = document.createElement('div');
  statusBoard.classList.add('statusBoard');
  statusBoard.innerHTML = `
  <div>Time</div>
  <div class="time">0</div>`;

  return { overlay, gameStart, startButtons, statusBoard, timeDisplay:statusBoard.querySelector('.time') }
}