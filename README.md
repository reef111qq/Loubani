# reefloubani.com

A five-page static site. No framework, no build step, no dependencies — the
files in this folder are exactly what gets served.

```
index.html      Home      hero, the gauges, links to the other pages
projects.html   Projects  four project cards
music.html      Music     the deck, BandLab embeds, listening list
about.html      About     interests
contact.html    Contact   Netlify form
thanks.html               where the form lands after a successful send
404.html                  not found
```

## Running it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. **You need a server** — opening the files
directly with `file://` will break the JavaScript, because browsers block ES
modules on that protocol.

## Where everything lives

| What you want to change | Where |
|---|---|
| Any colour, font, size or spacing | `styles/tokens.css` — change it once, it updates site-wide |
| The nav | All five HTML files (see the warning below) |
| Gauge numbers | `index.html`, the `data-value` / `data-max` attributes |
| Projects | `projects.html` |
| Your tracks | `music.html` playlist + files in `/audio` |
| Listening list | `music.html`, the `<ul class="spins">` block |
| BandLab embeds | `music.html`, the `data-embed` attributes |
| About copy | `about.html` |

Anything you need to fill in is marked with a `REPLACE` comment in the HTML.
Search the project for `REPLACE` to find all of them.

### Careful: the nav is in all five files

There's no templating here, so the `<header class="cluster">` block is copied
into each page. **If you change a nav link, change it in all five files.**

This is on purpose. The alternative — injecting the nav with JavaScript — means
search engines don't see your internal links in the page source, which works
against the whole point of the site ranking for your name. Five copies of a
twelve-line block is the cheaper trade.

The only difference between the copies is which link carries
`aria-current="page"`. That attribute is what lights the tab amber, so each
page marks its own.

## Adding a track

1. Export to mp3 or m4a, 128–192 kbps. Keep it under about 4 MB.
2. Drop it in `/audio`, named in lowercase with dashes instead of spaces.
3. Add it in **two** places — the deck list in `music.html` and the dock list in
   `index.html`. Copy an existing `<li>` in each and change the filename, title
   and duration.

`data-duration` is only what shows before the file loads; the player replaces it
with the real figure from the audio itself. To get it: `afinfo audio/yourfile.m4a`.

Audio is by far the largest thing in the repo — the nine tracks are about 27 MB
of the total. Worth pruning before adding many more.

**A note on m4a:** the tracks are AAC in an m4a container, which every current
browser plays. The one gap is Firefox on Linux without system codecs installed.
If that ever matters, convert to mp3 (`brew install ffmpeg`, then
`ffmpeg -i in.m4a -b:a 192k out.mp3`) and update the two lists.

## Deploying

Push to GitHub, then in Netlify: Add new site → Import an existing project.
There's no build command and the publish directory is the repo root —
`netlify.toml` already says so.

Two things to do in the Netlify dashboard once it's up:

1. **Forms → Form notifications** — add an email notification, or submissions
   sit in the dashboard unread.
2. **Domain management** — point `reefloubani.com` at the site.

The contact form only works on Netlify. Submitting it from a local server will
404, which is expected — Netlify reads the form out of the HTML at deploy time.

## Fonts

Fonts currently load from Google Fonts. That's one third-party connection on
every page load. To self-host them instead:

1. Download the Archivo, Inter and Roboto Mono variable `woff2` files into `/fonts`.
2. Replace the `<link>` to `fonts.googleapis.com` in all five pages with a
   `@font-face` block in `styles/base.css`.
3. Delete the two `https://fonts.*` entries from the CSP in `netlify.toml`.

Worth doing before launch, but the site works fine as-is.

## A note on the colours

`--red` (`#D8402F`) measures 4.23:1 against the background. That passes for
large display text and for borders and icons, but **fails for body-sized text**.
If you want red on something small, use `--red-lift`.

Same idea with amber: `--amber-text` is the dimmed amber that's safe for small
text. `--amber-dim` is darker and is for decoration only — unlit LEDs and hover
borders, never words.
