/* ==========================================================================
   dock.js — the persistent player in the bottom-left corner.

   All the audio behaviour comes from player.js; this file only adds the
   dock's own concern, which is opening and closing the panel and
   remembering that choice for the next visit.
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
    panel.hidden = !open;
  };

  // A remembered preference, nothing more. Storage can throw in a private
  // window or with site data blocked, so a failure here is not worth caring
  // about — the dock just opens closed.
  let open = false;
  try {
    open = localStorage.getItem(STORAGE_KEY) === '1';
  } catch { /* no storage available */ }

  setOpen(open);

  toggle.addEventListener('click', () => {
    open = !open;
    setOpen(open);
    try {
      localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
    } catch { /* no storage available */ }
  });

  // Pressing play on a collapsed dock should show what started playing.
  dock.querySelector('[data-toggle]')?.addEventListener('click', () => {
    if (!open) {
      open = true;
      setOpen(true);
    }
  });
}
