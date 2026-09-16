/* ==========================================================================
   player.js — the tape deck.

   Progressive enhancement: the playlist in the HTML is a list of ordinary
   <a href="audio/track.mp3"> links. With JS off they are working download
   links. This file upgrades them into an in-page playlist.
   ========================================================================== */

export function init() {
  const root = document.querySelector('[data-player]');
  if (!root) return;

  const audio     = root.querySelector('[data-audio]');
  const tracks    = Array.from(root.querySelectorAll('[data-track]'));
  const nowEl     = root.querySelector('[data-now]');
  const elapsedEl = root.querySelector('[data-elapsed]');
  const durationEl= root.querySelector('[data-duration]');
  const scrub     = root.querySelector('[data-scrub]');
  const volume    = root.querySelector('[data-vol]');
  const playBtn   = root.querySelector('[data-toggle]');
  const prevBtn   = root.querySelector('[data-prev]');
  const nextBtn   = root.querySelector('[data-next]');
  const emptyEl   = root.querySelector('[data-empty]');

  // No tracks in /audio yet — say so plainly and disable the transport.
  if (!tracks.length) {
    [playBtn, prevBtn, nextBtn, scrub].forEach((el) => el && (el.disabled = true));
    if (emptyEl) emptyEl.hidden = false;
    if (nowEl) nowEl.textContent = 'No tracks loaded';
    return;
  }

  let index = -1;

  tracks.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (i === index) return toggle();
      select(i, true);
    });
  });

  playBtn?.addEventListener('click', toggle);
  prevBtn?.addEventListener('click', () => select(index - 1, !audio.paused));
  nextBtn?.addEventListener('click', () => select(index + 1, !audio.paused));

  audio.addEventListener('loadedmetadata', () => {
    if (durationEl) durationEl.textContent = clock(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    if (elapsedEl) elapsedEl.textContent = clock(audio.currentTime);
    if (scrub && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      scrub.value = String(pct);
      fill(scrub, pct);
    }
  });
  audio.addEventListener('play',  () => setPlayIcon(true));
  audio.addEventListener('pause', () => setPlayIcon(false));
  audio.addEventListener('ended', () => select(index + 1, true));
  audio.addEventListener('error', () => {
    if (nowEl) nowEl.textContent = 'Track unavailable';
  });

  scrub?.addEventListener('input', () => {
    fill(scrub, Number(scrub.value));
    if (audio.duration) audio.currentTime = (Number(scrub.value) / 100) * audio.duration;
  });

  if (volume) {
    audio.volume = Number(volume.value);
    fill(volume, Number(volume.value) * 100);
    volume.addEventListener('input', () => {
      audio.volume = Number(volume.value);
      fill(volume, Number(volume.value) * 100);
    });
  }

  // Load the first track's details without downloading it (preload="none").
  select(0, false);

  function select(i, shouldPlay) {
    index = (i + tracks.length) % tracks.length;
    const link = tracks[index];

    audio.src = link.getAttribute('href');
    if (nowEl) nowEl.textContent = link.dataset.title || link.textContent.trim();
    if (elapsedEl) elapsedEl.textContent = '0:00';
    if (durationEl) durationEl.textContent = link.dataset.duration || '0:00';
    if (scrub) { scrub.value = '0'; fill(scrub, 0); }

    tracks.forEach((el, n) => el.setAttribute('aria-current', n === index ? 'true' : 'false'));

    if (shouldPlay) audio.play().catch(() => setPlayIcon(false));
  }

  function toggle() {
    if (audio.paused) audio.play().catch(() => setPlayIcon(false));
    else audio.pause();
  }

  function setPlayIcon(isPlaying) {
    if (!playBtn) return;
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    playBtn.classList.toggle('is-playing', isPlaying);
  }
}

/* Paints the filled portion of a range input (WebKit needs this; Firefox
   handles it natively with ::-moz-range-progress). */
function fill(input, percent) {
  input.style.setProperty('--fill', `${Math.min(100, Math.max(0, percent))}%`);
}

function clock(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
