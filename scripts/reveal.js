/* ==========================================================================
   reveal.js — fades sections in as they scroll into view.

   Elements opt in with class="reveal" in the markup. If JS never runs,
   base.css has a `@media (scripting: none)` rule that shows them anyway,
   so nothing is ever left invisible.
   ========================================================================== */

export function init() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // Reduced motion, or no observer: show everything immediately.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      self.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach((el) => observer.observe(el));
}
