/* ==========================================================================
   main.js — the single entry point on every page.
   It looks at what the page actually contains and loads only that module.
   Home pulls gauges. Music pulls the player and the embed facades.
   Nothing else ships to a page that doesn't need it.
   ========================================================================== */

const present = (selector) => document.querySelector(selector) !== null;

const load = (condition, path) => {
  if (!condition) return;
  import(path)
    .then((module) => module.init())
    .catch((error) => console.error(`Could not start ${path}`, error));
};

load(present('[data-gauge]'),  './gauges.js');
load(present('[data-player]'), './player.js');
load(present('.reveal'),       './reveal.js');
load(present('.clipping'),     './scatter.js');
load(present('[data-dock]'),   './dock.js');
