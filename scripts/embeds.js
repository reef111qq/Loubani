/* ==========================================================================
   embeds.js — click-to-load facades for BandLab.

   A third-party iframe is the heaviest thing that can land on a page, and it
   runs their code for every visitor whether or not anyone presses play. So
   each embed starts as a static card; the real iframe is only built once
   somebody actually asks for it.
   ========================================================================== */

export function init() {
  document.querySelectorAll('[data-facade]').forEach((button) => {
    button.addEventListener('click', () => swap(button), { once: true });
  });
}

function swap(button) {
  const src = button.dataset.embed;
  if (!src) return;

  const frame = document.createElement('div');
  frame.className = 'embed-frame';

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = button.dataset.title || 'Embedded track';
  iframe.loading = 'lazy';
  iframe.allow = 'autoplay; encrypted-media; fullscreen';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';

  frame.appendChild(iframe);
  button.replaceWith(frame);
  iframe.focus();
}
