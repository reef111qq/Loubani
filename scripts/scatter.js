/* ==========================================================================
   scatter.js — drifts the taped-up clippings as you scroll.

   Each clipping carries a data-speed. On scroll it gets a --drift value,
   which the CSS folds into the same transform as its rotation, so the two
   never fight each other.

   Everything here is decorative. If this file never runs, the clippings
   simply sit still at the positions the CSS already gave them.
   ========================================================================== */

export function init() {
  const clippings = Array.from(document.querySelectorAll('.clipping[data-speed]'));
  if (!clippings.length) return;

  // Reduced motion: leave them exactly where CSS put them.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // The scatter layer is display:none below 1150px, so there is nothing to
  // move and no reason to listen to scroll on a phone.
  const wide = window.matchMedia('(min-width: 1150px)');

  let ticking = false;
  let listening = false;

  const apply = () => {
    const y = window.scrollY;
    clippings.forEach((el) => {
      const speed = Number(el.dataset.speed) || 0;
      el.style.setProperty('--drift', `${(y * speed).toFixed(1)}px`);
    });
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  const sync = () => {
    if (wide.matches && !listening) {
      window.addEventListener('scroll', onScroll, { passive: true });
      listening = true;
      apply();
    } else if (!wide.matches && listening) {
      window.removeEventListener('scroll', onScroll);
      listening = false;
      clippings.forEach((el) => el.style.removeProperty('--drift'));
    }
  };

  sync();
  wide.addEventListener('change', sync);
}
