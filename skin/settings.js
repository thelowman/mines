export const revealDelay = 60;
export const boomDelay = 50;

export const gameSizes = [
  { name: 'Small',  class: 'small',  w: 10, h: 10 },
  { name: 'Medium', class: 'medium', w: 20, h: 20 },
  { name: 'Large',  class: 'large',  w: 30, h: 20 }
];

export const initCell = cell => cell;
export const revealCell = cell => {};
export const explodeCell = cell => {};