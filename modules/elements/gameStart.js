import * as el from '../elemFunctions.js';

const html = `
<div class="content">
  <div class="result"></div>
  <div class="highScores"></div>
  <div class="title">Pick a Game Size</div>
  <div class="buttons">
    <div class="startButton">
      <button class="small">Small</button>
    </div>
    <div class="startButton">
      <button class="medium">Medium</button>
    </div>
    <div class="startButton">
      <button class="large">Large</button>
    </div>
  </div>
</div>
`;

export const gameStart = el.compose(el.create('div'), el.addClass('gameStart'), el.innerHTML(html))();
const result = gameStart.querySelector('.result');
const highScores = gameStart.querySelector('.highScores');

gameStart.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
});

// Start game function (to be replaced by the consumer).
let onStart = (w, h) => {};
gameStart.querySelector('.startButton>.small').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  onStart(10, 10);
});
gameStart.querySelector('.startButton>.medium').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  onStart(20, 20);
});
gameStart.querySelector('.startButton>.large').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  onStart(30, 20);
});

export const gsWin = message => {
  gameStart.classList.remove('lost');
  gameStart.classList.add('won');
  result.innerText = message;
}

export const gsLoose = message => {
  gameStart.classList.remove('won');
  gameStart.classList.add('lost');
  result.innerText = message;
}

export const gsHighScores = scores => {
  if (!scores || scores.length === 0) {
    highScores.innerHTML = '';
  }
  else {
    highScores.innerHTML = scores.reduce((html, score) => {
      html += `<div class="score">`;
      html += `<div>${(score.time / 1000).toFixed(1)}</div>`;
      html += `<div>${new Date(score.date).toLocaleDateString()}</div>`;
      html += `</div>`;
      return html;
    }, `<div class="highScoreTitle">High Scores</div>`);
  }
}

export const setStartFn = onStartFn => onStart = onStartFn;

// Undecided if we'll use the const exports or this default one.
// export default {
//   element: gameStart,
//   won: congrats => {
//     gameStart.classList.remove('lost');
//     gameStart.classList.add('won');
//     result.innerText = congrats;
//   },
//   lost: consolation => {
//     gameStart.classList.remove('won');
//     gameStart.classList.add('lost');
//     result.innerText = consolation;
//   },
//   set onStart(fn) { onStart = fn },
//   set highScores (scores) {
//     if (!scores || scores.length === 0) {
//       highScores.innerHTML = '';
//     }
//     else {
//       highScores.innerHTML = scores.reduce((html, score) => {
//         html += `<div class="score">`;
//         html += `<div>${(score.time / 1000).toFixed(1)}</div>`;
//         html += `<div>${new Date(score.date).toLocaleDateString()}</div>`;
//         html += `</div>`;
//         return html;
//       }, `<div class="highScoreTitle">High Scores</div>`);
//     }
//   }
// }