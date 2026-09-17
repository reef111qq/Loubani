/* ==========================================================================
   gauges.js — sweeps the needle and counts the readout up from zero.

   Geometry matches components.css:
     240 degree dial, drawn on a circle of r=76 (circumference 477.522),
     so the visible arc is 318.348 units long.
     Needle rotation: 240deg is zero on the dial, 480deg is full scale.

   Accessibility: the real number is already in the HTML before this file
   runs. This only animates from zero up to the value it finds there, so
   with JS off the numbers are still correct and readable.
   ========================================================================== */

const ARC = 318.348;
const ZERO_ANGLE = 240;
const SWEEP_DEGREES = 240;
const COUNT_MS = 1100;

export function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-gauge]').forEach((el) => setup(el, reduceMotion));
}

function setup(el, reduceMotion) {
  const readout = el.querySelector('[data-readout]');
  const arc = el.querySelector('.gauge__value');
  const needle = el.querySelector('.gauge__needle');
  const dial = el.querySelector('svg');
  if (!readout || !arc || !needle) return;

  // The age gauge works out its own value, so it never goes stale.
  const value = el.dataset.birthdate
    ? yearsSince(el.dataset.birthdate)
    : Number(el.dataset.value || 0);

  const max = Number(el.dataset.max) || Math.max(value, 1);
  const suffix = el.dataset.suffix || '';
  const label = el.dataset.label || '';
  // Big numbers read better as "7.4M" than "7,400,000" inside a dial.
  const compact = el.hasAttribute('data-compact');
  const percent = Math.min(1, Math.max(0, value / max));

  // Correct the DOM first, then animate. Important for the age gauge, whose
  // hardcoded HTML value is only a fallback.
  readout.textContent = formatNumber(value, compact) + suffix;
  if (dial) dial.setAttribute('aria-label', `${label}: ${value}${suffix}`);

  const paint = () => {
    arc.style.strokeDashoffset = String(ARC * (1 - percent));
    needle.style.setProperty('--angle', `${ZERO_ANGLE + SWEEP_DEGREES * percent}deg`);
  };

  // Reduced motion, or no observer support: land on the final value at once.
  if (reduceMotion || !('IntersectionObserver' in window)) {
    paint();
    return;
  }

  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      self.disconnect();
      paint();
      countUp(readout, value, suffix, compact);
    });
  }, { threshold: 0.35 });

  observer.observe(el);
}

function countUp(node, target, suffix, compact) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / COUNT_MS);
    const eased = 1 - Math.pow(1 - t, 3);            // matches the needle's ease-out
    node.textContent = formatNumber(Math.round(target * eased), compact) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  node.textContent = formatNumber(0, compact) + suffix;
  requestAnimationFrame(tick);
}

function yearsSince(isoDate) {
  const born = new Date(isoDate);
  if (Number.isNaN(born.getTime())) return 0;
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) years -= 1;
  return years;
}

function formatNumber(n, compact) {
  if (compact) {
    return n.toLocaleString('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
  }
  return n.toLocaleString('en-US');
}
