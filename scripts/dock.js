/* ==========================================================================
   dock.js — the floating player in the bottom-left corner.

   All the audio behaviour comes from player.js; this file owns only the
   open/closed state, the animation between them, and remembering the choice.

   The panel is animated with a grid-template-rows 0fr -> 1fr transition,
   which is the one reliable way to animate to a height the browser works
   out for itself. `hidden` can't be used for the collapsed state because a
   hidden element can't transition, so the wrapper is marked `inert` instead
   — that keeps its buttons out of the tab order while it is closed.
   ========================================================================== */

import { createPlayer } from './player.js';

const STORAGE_KEY = 'dock-open';

export function init() {
  const dock = document.querySelector('[data-dock]');
  if (!dock) return;

  createPlayer(dock);

  const toggle = dock.querySelector('[data-dock-toggle]');
  const panel = dock.querySelector('[data-dock-panel]');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    dock.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Collapse player' : 'Expand player');
    panel.inert = !open;
  };

  // A remembered preference, nothing more. Storage can throw in a private
  // window or with site data blocked, in which case the dock just opens closed.
  let open = false;
  try {
    open = localStorage.getItem(STORAGE_KEY) === '1';
  } catch { /* no storage available */ }

  setOpen(open);

  // Let the first paint happen in the closed state before transitions are
  // allowed, so a dock restored as "open" doesn't animate open on load.
  requestAnimationFrame(() => dock.classList.add('is-ready'));

  toggle.addEventListener('click', () => {
    open = !open;
    setOpen(open);
    try {
      localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
    } catch { /* no storage available */ }
  });

  // Pressing play on a collapsed dock opens it, so you can see what started.
  dock.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (open) return;
      open = true;
      setOpen(true);
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    });
  });
}
