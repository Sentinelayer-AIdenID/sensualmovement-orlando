# Sensual Movement — Orlando 11th Anniversary · front door

An interactive preview built to accompany the PlexAura proposal to
Sensual Movement USA (September 2026). Live at
**https://sensualmovementusa.aidenid.com**.

The page is a walk through the venue. An infinite field of light sits under
everything and flies forward as you scroll; giant words arrive from depth;
four **rooms** (Arrive, Learn, Dance, Compete) each hold one of Sensual
Movement's own clips, scrubbed by the scroll as you walk in and playable —
with sound — once you are inside; then **the world**: a globe of light you
can spin, with every city they dance in as a pin (festivals, weekly socials,
classes, privates, training), the next festival pulsing, a card for each city;
then the pass ladder, a scripted chat, and the close. A sticky header carries
the countdown, Tickets, the languages and a menu (quick visit, links, log in /
log out); scene dots and a previous/next-room bar walk you through the scenes
with the same scroll the hand would produce.

## Source-of-truth rules

Enforced in `site/public/data.js`, the only file that carries facts or copy.

- Only facts published on Sensual Movement's own pages: the
  [event page](https://sensualmovementusa.com/sensual-movement-11th-anniversary/),
  the [checkout](https://www.tickettailor.com/events/smdancecompany/2068265),
  each festival's page, the socials / classes / privates / training pages
  (`PLACES`, verified 2026-09-06). A listed item whose page is a 404 is left
  out (Sensual Fridays Miami, as of that date).
- Artist names only as they appear on the 11th-anniversary page. Two of their
  own sources disagree; `ARTIST_SOURCE` in `data.js` picks which list renders.
- Prices are never shown. "See prices" / "Tickets" go to the live checkouts.
- Footage is Sensual Movement's own (YouTube `@sensualmovement`), 16 s per
  room, 720p, with their audio, 11 MB total. Raw sources are not committed.
- No attendance figures, no review quotes, no claims not on their pages. The
  big words are all facts from those pages. "Next" on the globe is computed
  from today's date, never typed.

## Readable without running it

`index.html` carries a JSON-LD `ItemList` of every festival as a `DanceEvent`,
and `/llms.txt` lists the festivals, socials, classes, privates, training and
the Orlando facts as plain text. Both are generated from `data.js` at
assembly, so they cannot drift from the page.

## Stack

Plain `index.html` + `styles.css` + `app.js` + `data.js` + `globe.js` +
`globe-land.js`. GSAP ScrollTrigger from cdnjs is the only dependency. The
field of light and the globe are 2D canvas, no library; the globe's land is
Natural Earth 1:110m (public domain) rasterized to ~2 500 dots at build
time. Fonts are self-hosted. No build step to run the site.

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
order (pins are refreshed in creation order). Scroll-scrubbed video until Play
is pressed in a room; leaving the room hands it back to the scroll. Touch
devices get the same walk without the layers a phone GPU chokes on (no blur
filters, no grain/spotlight layers, fewer points, clips unlocked as their room
approaches) — everything behind `(pointer: coarse)`, so desktop is unchanged.
`prefers-reduced-motion` (or the library failing to load) falls back to a
static page: every scene stacked, poster frames, no pin, no canvas loop; Play
and the globe still work (the globe just does not idle-spin).

## Switches

- `data.js → ARTIST_SOURCE`: `"page"` (default) or `"checkout"`.
- `data.js → FACTS.kickoffISO` / `index.html → #digits[data-kickoff]`: the
  countdown target. Currently the checkout's published 9:30 PM ET on
  February 11, 2027.
- `data.js → FESTIVALS`, `PLACES`, `PATHS`: the world. Add a city with its
  lat/lon and items; the globe, the cards, the JSON-LD and `llms.txt` follow.

## Security

Omar Gate runs on pull requests (`.github/workflows/omar-gate.yml`). CSP, HSTS
and the rest are set in `site/public/_headers`. The inline countdown is
allowed by its SHA-256 hash; regenerate it (command in `_headers`) if that
script changes.
