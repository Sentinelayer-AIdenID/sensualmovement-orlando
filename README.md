# Sensual Movement — Orlando 11th Anniversary · front door

A one-page interactive preview built to accompany the PlexAura proposal to
Sensual Movement USA (September 2026). Live at
**https://sensualmovementusa.aidenid.com**.

Seven scroll beats: a live countdown, four scroll-scrubbed footage beats, the
pass ladder as real text with a chat that answers five scripted questions, and
a working EN / ES / FR / PT toggle.

## Source-of-truth rules

These are enforced in `site/public/data.js`, which is the only file that
carries facts or copy.

- Only facts published on Sensual Movement's own pages
  ([event page](https://sensualmovementusa.com/sensual-movement-11th-anniversary/),
  [checkout](https://www.tickettailor.com/events/smdancecompany/2068265)).
- Artist names only as they appear on the 11th-anniversary page. Two of their
  own sources disagree; `ARTIST_SOURCE` in `data.js` picks which list renders.
- Prices are never shown. "See prices" goes to the live checkout.
- Footage is Sensual Movement's own (YouTube `@sensualmovement`), 6 s each,
  muted, 720p, under 12 MB total. Raw sources are not committed (`raw/`).
- No attendance figures, no review quotes, no claims not on their pages.

## Stack

Plain `index.html` + `styles.css` + `app.js` + `data.js`. GSAP ScrollTrigger
from cdnjs is the only dependency. Fonts are self-hosted. No build step.

```
site/public/        what gets deployed — open index.html on any static host
site/public/video/  the four 6-second clips
site/public/img/    poster frame per clip
raw/                source downloads (gitignored)
```

Preview locally: `cd site/public && python -m http.server 4195`.

Deploy: `CLOUDFLARE_ACCOUNT_ID=a2324d194def16dd3617d1f362c21893 npx wrangler pages deploy site/public --project-name sensualmovementusa --branch main`.

## Motion rules

Scroll-scrubbed video (`currentTime` driven by ScrollTrigger progress), sticky
beats, one reveal per beat. `prefers-reduced-motion` falls back to poster
frames and fades with no pin and no scrub. No parallax stacks, no gradient
blobs, no glassmorphism, no autoplay audio.

## Switches

- `data.js → ARTIST_SOURCE`: `"page"` (default) or `"checkout"`.
- `data.js → FACTS.kickoffISO`: the countdown target. Currently the checkout's
  published 9:30 PM ET on February 11, 2027.

## Security

Omar Gate runs on every push and pull request (`.github/workflows/omar-gate.yml`).
CSP, HSTS and the rest are set in `site/public/_headers`.
