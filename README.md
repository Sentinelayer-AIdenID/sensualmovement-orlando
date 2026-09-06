# Sensual Movement — Orlando 11th Anniversary · front door

An interactive preview built to accompany the PlexAura proposal to
Sensual Movement USA (September 2026). Live at
**https://sensualmovementusa.aidenid.com**.

The page is a walk through the venue. An infinite field of light sits under
everything and flies forward as you scroll; giant words arrive from depth;
four **rooms** (Arrive, Learn, Dance, Compete) each hold one of Sensual
Movement's own clips, scrubbed by the scroll as you walk in and playable —
with sound — once you are inside; a **map** of the whole festival family
(five cities, real dates and venues) draws itself; then the pass ladder, a
scripted chat, and the close. A HUD with the countdown, Tickets and the
language toggle, scene dots, and a previous/next-room bar are clickable at
every scroll position (arrow keys work too).

## Source-of-truth rules

Enforced in `site/public/data.js`, the only file that carries facts or copy.

- Only facts published on Sensual Movement's own pages
  ([event page](https://sensualmovementusa.com/sensual-movement-11th-anniversary/),
  [checkout](https://www.tickettailor.com/events/smdancecompany/2068265),
  and each festival's page for the map).
- Artist names only as they appear on the 11th-anniversary page. Two of their
  own sources disagree; `ARTIST_SOURCE` in `data.js` picks which list renders.
- Prices are never shown. "See prices" / "Tickets" go to the live checkouts.
- Footage is Sensual Movement's own (YouTube `@sensualmovement`), 16 s per
  room, 720p, with their audio, 11 MB total. Raw sources are not committed
  (`raw/`).
- No attendance figures, no review quotes, no claims not on their pages. The
  big words are all facts from those pages.

## Stack

Plain `index.html` + `styles.css` + `app.js` + `data.js`. GSAP ScrollTrigger
from cdnjs is the only dependency. The universe is a 2D canvas, no library.
Fonts are self-hosted. No build step.

```
site/public/        what gets deployed — open index.html on any static host
site/public/video/  the four 16-second clips (scrubbed by scroll, playable)
site/public/img/    poster per clip, stills, the official 11th artwork
raw/                source downloads (gitignored)
```

Preview locally with a server that supports byte ranges (Python's
`http.server` does not, and the scrub will look broken):
`npx http-server site/public -p 4195`.

Deploy: `CLOUDFLARE_ACCOUNT_ID=a2324d194def16dd3617d1f362c21893 npx wrangler pages deploy site/public --project-name sensualmovementusa --branch main`.

## Motion rules

Pinned scenes, scrubbed by ScrollTrigger; the timelines are created in DOM
order (pins are refreshed in creation order — grouping them by type put one
scene on top of another). Scroll-scrubbed video (`currentTime` from progress)
until Play is pressed in a room; leaving the room hands it back to the scroll.
`prefers-reduced-motion` (or the library failing to load) falls back to a
static page: every scene stacked, poster frames, no pin, no canvas loop, and
Play still works.

## Switches

- `data.js → ARTIST_SOURCE`: `"page"` (default) or `"checkout"`.
- `data.js → FACTS.kickoffISO` / `index.html → #digits[data-kickoff]`: the
  countdown target. Currently the checkout's published 9:30 PM ET on
  February 11, 2027.
- `data.js → FESTIVALS`: the map. Positions (`pos` desktop, `mpos` mobile)
  and card side per city.

## Security

Omar Gate runs on every push and pull request (`.github/workflows/omar-gate.yml`).
CSP, HSTS and the rest are set in `site/public/_headers`. The inline countdown
is allowed by its SHA-256 hash; regenerate it (command in `_headers`) if that
script changes.

<!-- gate check: 2026-09-06T04:23Z -->
