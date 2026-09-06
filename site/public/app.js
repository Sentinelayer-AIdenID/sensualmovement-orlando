/*
  Sensual Movement — Orlando 11th Anniversary · front door
  app.js — the universe, the trailer scenes, the map, the language, the chat.
  Vanilla JS. GSAP ScrollTrigger from CDN drives the scroll; the canvas is ours.
*/
(() => {
  "use strict";
  const { artists, PASSES, FESTIVALS, PLACES, PATHS, I18N, LANGS, CTA_URL } = window.SM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrowMQ = window.matchMedia("(max-width: 760px)");

  /* ================================================================ */
  /* Language — one dict, every visible string, persisted, no auto-detect */
  /* ================================================================ */
  const KEY = "sm-lang";
  let lang = (() => {
    try {
      const v = localStorage.getItem(KEY);
      return LANGS.includes(v) ? v : "en";
    } catch {
      return "en";
    }
  })();
  const get = (path, l = lang) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), I18N[l]);

  const applyLang = () => {
    const t = I18N[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    $('meta[name="description"]')?.setAttribute("content", t.description);
    $$("[data-i18n]").forEach((el) => {
      const v = get(el.dataset.i18n);
      if (typeof v === "string") el.textContent = v;
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      const v = get(el.dataset.i18nPlaceholder);
      if (typeof v === "string") el.placeholder = v;
    });
    $$("[data-lang-group]").forEach((g) => {
      g.setAttribute("aria-label", t.langLabel);
      $$("button", g).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    });
    buildLadder();
    buildChips();
    localizeGlobe();
    localizeMenu();
    localizeDots();
    localizeRooms();
    localizeWalk();
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* private mode */
    }
  };

  const buildLangGroups = () => {
    $$("[data-lang-group]").forEach((g) => {
      g.innerHTML = "";
      LANGS.forEach((code) => {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.lang = code;
        b.textContent = code.toUpperCase();
        b.setAttribute("aria-label", I18N[code].lang);
        b.addEventListener("click", () => {
          if (lang === code) return;
          lang = code;
          applyLang();
        });
        g.appendChild(b);
      });
    });
  };

  /* ================================================================ */
  /* The universe — a depth field that flies with the scroll           */
  /* ================================================================ */
  // Scene-driven state. GSAP tweens these numbers; the painter reads them.
  const U = { swirl: 0, gather: 0, dim: 1, red: 0, anchors: [], anchorEls: null };

  const universe = (() => {
    const c = $("#universe");
    const ctx = c.getContext("2d", { alpha: false });
    const COL = [
      [252, 250, 247],
      [184, 137, 43],
      [196, 30, 58],
    ];
    let W = 0, H = 0, N = 0, pts = [];
    let mx = 0, my = 0, tx = 0, ty = 0;
    let lastY = window.scrollY, vel = 0, last = performance.now(), running = false;

    const spawn = (z) => {
      const r = Math.random();
      return {
        x: (Math.random() * 2 - 1) * 1.7,
        y: (Math.random() * 2 - 1) * 1.7,
        z,
        k: r < 0.07 ? 2 : r < 0.27 ? 1 : 0, // white, gold, red
        s: 0.6 + Math.random() * 1.5,
        g: Math.random() < 0.34, // takes part in the map gather
        n: Math.floor(Math.random() * 5),
        a: Math.random() * Math.PI * 2,
        j: 10 + Math.random() * 26,
      };
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = W + "px";
      c.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = coarse ? 520 : 1900;
      if (pts.length !== N) pts = Array.from({ length: N }, () => spawn(Math.random()));
      paint(true);
    };

    const paint = (still) => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;
      const y = window.scrollY;
      vel += ((y - lastY) / Math.max(1, dt * 1000) - vel) * 0.14; // px per ms, smoothed
      lastY = y;
      const warp = still ? 0 : Math.min(1, Math.abs(vel) / 2.4);
      const dir = vel < 0 ? -1 : 1;
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(18,10,16,${still ? 1 : 0.46 - warp * 0.3})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const f = Math.min(W, H) * 0.56;
      const cx = W / 2 + tx * 110;
      const cy = H / 2 + ty * 80;
      const speed = still ? 0 : (0.04 + warp * 1.1) * dir * dt;
      const sw = U.swirl * dt * 0.85;
      const gather = U.gather;
      const anchors = U.anchors;

      for (const p of pts) {
        if (!still) {
          p.z -= speed;
          if (p.z <= 0.03) Object.assign(p, spawn(1), { g: p.g, n: p.n });
          else if (p.z > 1) Object.assign(p, spawn(0.03), { g: p.g, n: p.n });
          if (sw) {
            const a = sw * (1.7 - p.z);
            const cs = Math.cos(a), sn = Math.sin(a);
            const x = p.x * cs - p.y * sn;
            p.y = p.x * sn + p.y * cs;
            p.x = x;
          }
        }
        let sx = cx + (p.x / p.z) * f;
        let sy = cy + (p.y / p.z) * f;
        let al = Math.min(1, (1 - p.z) * 1.5);
        if (gather > 0 && p.g && anchors.length) {
          const an = anchors[p.n % anchors.length];
          const ax = an.x * W + Math.cos(p.a + now * 0.0004) * p.j;
          const ay = an.y * H + Math.sin(p.a + now * 0.0004) * p.j;
          sx += (ax - sx) * gather;
          sy += (ay - sy) * gather;
          al = Math.max(al, gather * 0.9);
        }
        if (sx < -6 || sx > W + 6 || sy < -6 || sy > H + 6) continue;
        let r = Math.min(3.2, p.s * (1.05 / p.z) * (0.45 + 0.55 * (1 - p.z)));
        if (gather > 0 && p.g) r = Math.min(r, 1.9);
        const col = COL[p.k];
        const kA = p.k === 2 ? 0.5 + U.red * 0.5 : p.k === 1 ? 0.85 : 0.7;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${(al * kA * U.dim).toFixed(3)})`;
        if (warp > 0.1 && !coarse) {
          const dx = sx - cx, dy = sy - cy;
          const d = Math.hypot(dx, dy) || 1;
          const len = (warp * 34 * dir) / p.z * 0.45;
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = Math.max(0.8, r * 0.8);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - (dx / d) * len, sy - (dy / d) * len);
          ctx.stroke();
        } else if (r < 1.7) {
          ctx.fillRect(sx, sy, r, r);
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 0.7, 0, 6.2832);
          ctx.fill();
        }
      }
    };

    const loop = () => {
      if (!running) return;
      paint(false);
      requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    };
    const stop = () => (running = false);

    window.addEventListener("resize", size, { passive: true });
    size();
    if (!coarse) {
      window.addEventListener(
        "pointermove",
        (e) => {
          mx = e.clientX / W - 0.5;
          my = e.clientY / H - 0.5;
        },
        { passive: true },
      );
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return { start, stop };
  })();

  // The spotlight and the film veils follow the hand; one listener, one pair of vars.
  if (!coarse) {
    const root = document.documentElement;
    window.addEventListener(
      "pointermove",
      (e) => {
        root.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
        root.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
      },
      { passive: true },
    );
  }

  /* ================================================================ */
  /* Scene dots + HUD                                                  */
  /* ================================================================ */
  const scenes = $$(".scene[data-dot]");
  const dots = $("#dots");
  const dotFor = new Map();
  const buildDots = () => {
    dots.innerHTML = "";
    scenes.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.addEventListener("click", () => goTo(scenes.indexOf(s)));
      dots.appendChild(b);
      dotFor.set(s, b);
    });
  };
  const localizeDots = () => {
    scenes.forEach((s) => {
      const b = dotFor.get(s);
      if (!b) return;
      const v = get(s.dataset.dot);
      const label = typeof v === "string" ? v : s.id;
      b.setAttribute("aria-label", label);
      b.title = label;
    });
  };
  const watchDots = () => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          dotFor.forEach((b, s) => b.setAttribute("aria-current", String(s === en.target)));
          scenes.forEach((s) => s.classList.toggle("is-here", s === en.target));
          here = scenes.indexOf(en.target);
          localizeWalk();
        });
      },
      { threshold: 0.35 },
    );
    scenes.forEach((s) => io.observe(s));
  };

  /* ================================================================ */
  /* Rooms — a sign on every door; press play once you are inside      */
  /* ================================================================ */
  const films = $$(".scene--film");
  const roomUI = new Map();
  const buildRooms = () => {
    films.forEach((scene, i) => {
      const video = $("video", scene);
      const hasAudio = video.dataset.audio === "1";
      const room = document.createElement("div");
      room.className = "room";
      room.innerHTML =
        `<p class="room__sign"><span class="room__no">${String(i + 1).padStart(2, "0")} / ${String(films.length).padStart(2, "0")}</span>` +
        `<span class="room__name" data-name></span><span class="room__here" data-here></span></p>` +
        `<div class="room__ctl"><button type="button" class="room__play"><i></i><span data-play></span></button>` +
        (hasAudio ? `<button type="button" class="room__mute" data-mute></button>` : "") +
        `</div>`;
      scene.appendChild(room);
      const play = $(".room__play", room);
      const mute = $(".room__mute", room);
      // The scrub owns currentTime until you press play; then the clip is
      // yours, looping, with sound if the file has any. Leaving the room hands
      // it back to the scroll.
      video.loop = true;
      video.dataset.playing = "0";
      const setPlaying = (on) => {
        video.dataset.playing = on ? "1" : "0";
        scene.classList.toggle("is-playing", on);
        localizeRooms();
      };
      play.addEventListener("click", () => {
        if (video.dataset.playing === "1") return video.pause();
        video.muted = !hasAudio || video.dataset.unmuted !== "1";
        video.style.opacity = 1;
        const p = video.play();
        if (p && p.catch) p.catch(() => setPlaying(false));
      });
      video.addEventListener("play", () => {
        if (video.dataset.unlock === "1") return;
        setPlaying(true);
      });
      video.addEventListener("pause", () => {
        if (video.dataset.unlock === "1") return delete video.dataset.unlock;
        setPlaying(false);
      });
      mute?.addEventListener("click", () => {
        video.dataset.unmuted = video.muted ? "1" : "0";
        video.muted = !video.muted;
        localizeRooms();
      });
      roomUI.set(scene, { room, video, play, mute, kicker: scene.dataset.dot });
    });
  };
  const localizeRooms = () => {
    const t = I18N[lang];
    roomUI.forEach(({ room, video, mute, kicker }) => {
      $("[data-name]", room).textContent = get(kicker) || "";
      $("[data-here]", room).textContent = t.room.here;
      $("[data-play]", room).textContent = video.dataset.playing === "1" ? t.room.pause : t.room.play;
      if (mute) mute.textContent = video.muted ? t.room.unmute : t.room.mute;
    });
  };
  const leaveRoom = (scene) => {
    const r = roomUI.get(scene);
    if (r && r.video.dataset.playing === "1") r.video.pause();
  };

  /* The corridor — previous / next room, arrow keys, and the label of where you are. */
  const walk = $("#walk");
  const walkPrev = $("#walk-prev");
  const walkNext = $("#walk-next");
  const walkLabel = $("#walk-label");
  let here = 0;
  let walking = null;
  // Where a scene is "there": mid-room for footage (frame open, word centred),
  // partway through the words, the map once the thread is drawn.
  const LANDING = { "s-open": 0, "s-globe": 0.55 };
  const landingY = (s) => {
    const st = window.ScrollTrigger && ScrollTrigger.getAll().find((t) => t.pin && t.trigger === s);
    if (!st) return s.getBoundingClientRect().top + window.scrollY - (s.classList.contains("scene--flow") ? 0 : 0);
    const f = LANDING[s.id] ?? (s.classList.contains("scene--words") ? 0.42 : 0.5);
    return st.start + (st.end - st.start) * f;
  };
  const stopWalk = () => {
    if (walking) walking.kill();
    walking = null;
  };
  const goTo = (i) => {
    const s = scenes[Math.max(0, Math.min(scenes.length - 1, i))];
    if (!s) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) {
      s.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    stopWalk();
    const from = window.scrollY;
    const to = Math.max(0, Math.min(landingY(s), document.documentElement.scrollHeight - window.innerHeight));
    const dist = Math.abs(to - from);
    if (dist < 2) return;
    // Slow out of the room, fast down the corridor, slow into the next — the
    // same scrub the hand would produce, so the footage and the words play.
    const pos = { y: from };
    walking = gsap.to(pos, {
      y: to,
      duration: coarse ? Math.min(1.4, 0.5 + dist / 4200) : Math.min(3, 0.9 + dist / 2600),
      ease: "power2.inOut",
      onUpdate: () => window.scrollTo(0, pos.y),
      onComplete: () => (walking = null),
    });
  };
  // Your own scroll wins over the walk, immediately.
  ["wheel", "touchstart", "pointerdown"].forEach((ev) => window.addEventListener(ev, stopWalk, { passive: true }));
  const localizeWalk = () => {
    const t = I18N[lang];
    walkPrev.setAttribute("aria-label", t.room.prev);
    walkNext.setAttribute("aria-label", t.room.next);
    walkPrev.title = t.room.prev;
    walkNext.title = t.room.next;
    const v = get(scenes[here]?.dataset.dot);
    walkLabel.textContent = typeof v === "string" ? v : "";
    walkPrev.disabled = here === 0;
    walkNext.disabled = here === scenes.length - 1;
  };
  walkPrev.addEventListener("click", () => goTo(here - 1));
  walkNext.addEventListener("click", () => goTo(here + 1));
  window.addEventListener("keydown", (e) => {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") (e.preventDefault(), goTo(here + 1));
    else if (e.key === "ArrowLeft") (e.preventDefault(), goTo(here - 1));
    else stopWalk();
  });

  /* ================================================================ */
  /* The world — a globe of every city they dance in                   */
  /* ================================================================ */
  const fmtDates = (f) => {
    const opt = { month: "short", day: "numeric", timeZone: "UTC" };
    const a = new Date(f.start + "T00:00:00Z");
    const b = new Date(f.end + "T00:00:00Z");
    const y = new Intl.DateTimeFormat(lang, { year: "numeric", timeZone: "UTC" }).format(b);
    try {
      return `${new Intl.DateTimeFormat(lang, opt).formatRange(a, b)}, ${y}`;
    } catch {
      const df = new Intl.DateTimeFormat(lang, opt);
      return `${df.format(a)} – ${df.format(b)}, ${y}`;
    }
  };
  // The next festival by date, and the one after it. Computed, never typed.
  const upcoming = () => {
    const now = Date.now();
    return FESTIVALS.filter((f) => Date.parse(f.end + "T23:59:59Z") >= now).sort((x, y) => x.start.localeCompare(y.start));
  };
  const festivalById = (id) => FESTIVALS.find((f) => f.id === id);
  const placeById = (id) => PLACES.find((p) => p.id === id);
  const gcard = $("#gcard");
  let globe = null;
  let openPlace = null;

  const renderCard = (id) => {
    const p = placeById(id);
    if (!p) return;
    const t = I18N[lang];
    const up = upcoming();
    const rank = (fid) => (up[0] && up[0].id === fid ? "next" : up[1] && up[1].id === fid ? "then" : null);
    const items = p.items
      .map((it) => {
        if (it.kind === "festival") {
          const f = festivalById(it.ref);
          const r = rank(f.id);
          const badge = r ? `<span class="gcard__badge${r === "then" ? " gcard__badge--then" : ""}">${t.world[r]}</span>` : "";
          return `<li class="gitem gitem--festival${f.image ? " gitem--img" : ""}">${f.image ? `<img class="gitem__img" src="${f.image}" alt="" loading="lazy" decoding="async">` : ""}<span class="gitem__kind">${t.world.kinds.festival} ${badge}</span><p class="gitem__name">${f.name}</p><p class="gitem__meta">${fmtDates(f)} · ${f.venue}</p><ul class="gitem__links"><li><a href="${f.tickets}" target="_blank" rel="noopener noreferrer">${t.map.tickets}</a></li>${f.hotel ? `<li><a href="${f.hotel}" target="_blank" rel="noopener noreferrer">${t.map.hotel}</a></li>` : ""}<li><a href="${f.page}" target="_blank" rel="noopener noreferrer">${t.map.page}</a></li></ul></li>`;
        }
        const when = it.when ? it.when[lang] || it.when.en : "";
        const meta = [when, it.venue].filter(Boolean).join(" · ");
        return `<li class="gitem gitem--${it.kind}${it.image ? " gitem--img" : ""}">${it.image ? `<img class="gitem__img" src="${it.image}" alt="" loading="lazy" decoding="async">` : ""}<span class="gitem__kind">${t.world.kinds[it.kind] || it.kind}</span><p class="gitem__name">${it.name}</p>${meta ? `<p class="gitem__meta">${meta}</p>` : ""}<ul class="gitem__links"><li><a href="${it.url}" target="_blank" rel="noopener noreferrer">${t.map.page}</a></li></ul></li>`;
      })
      .join("");
    const fest = p.items.find((it) => it.kind === "festival");
    const r = fest ? rank(fest.ref) : null;
    gcard.innerHTML = `<button type="button" class="gcard__close" aria-label="${t.world.close}">&times;</button><p class="gcard__city">${t.cities[p.city]}${r ? `<span class="gcard__badge${r === "then" ? " gcard__badge--then" : ""}">${t.world[r]}</span>` : ""}</p><ul class="gcard__items">${items}</ul>`;
    $(".gcard__close", gcard).addEventListener("click", () => globe && globe.blur());
  };

  /* The list: the same cities and items as the globe, as cards, with the
     pictures from their pages. Default on phones; a toggle on desktop. */
  const VIEW_KEY = "sm-world-view";
  const worldScene = $("#s-globe");
  const worldList = $("#world-list");
  const viewBtns = $$("#world-view .view__btn");
  const itemHTML = (it, t, rank) => {
    if (it.kind === "festival") {
      const f = festivalById(it.ref);
      const r = rank(f.id);
      const badge = r ? `<span class="gcard__badge${r === "then" ? " gcard__badge--then" : ""}">${t.world[r]}</span>` : "";
      return `<li class="witem witem--festival${f.image ? "" : " witem--noimg"}">${f.image ? `<img class="witem__img" src="${f.image}" alt="" loading="lazy" decoding="async">` : ""}<div><span class="gitem__kind">${t.world.kinds.festival} ${badge}</span><p class="gitem__name">${f.name}</p><p class="gitem__meta">${fmtDates(f)} · ${f.venue}</p><ul class="gitem__links"><li><a href="${f.tickets}" target="_blank" rel="noopener noreferrer">${t.map.tickets}</a></li>${f.hotel ? `<li><a href="${f.hotel}" target="_blank" rel="noopener noreferrer">${t.map.hotel}</a></li>` : ""}<li><a href="${f.page}" target="_blank" rel="noopener noreferrer">${t.map.page}</a></li></ul></div></li>`;
    }
    const when = it.when ? it.when[lang] || it.when.en : "";
    const meta = [when, it.venue].filter(Boolean).join(" · ");
    return `<li class="witem witem--${it.kind}${it.image ? "" : " witem--noimg"}">${it.image ? `<img class="witem__img" src="${it.image}" alt="" loading="lazy" decoding="async">` : ""}<div><span class="gitem__kind">${t.world.kinds[it.kind] || it.kind}</span><p class="gitem__name">${it.name}</p>${meta ? `<p class="gitem__meta">${meta}</p>` : ""}<ul class="gitem__links"><li><a href="${it.url}" target="_blank" rel="noopener noreferrer">${t.map.page}</a></li></ul></div></li>`;
  };
  const buildWorldList = () => {
    const t = I18N[lang];
    const up = upcoming();
    const rank = (fid) => (up[0] && up[0].id === fid ? "next" : up[1] && up[1].id === fid ? "then" : null);
    // cities in the order of their next thing: festivals by date first, then the rest
    const order = [...PLACES].sort((x, y) => {
      const fx = x.items.find((i) => i.kind === "festival"), fy = y.items.find((i) => i.kind === "festival");
      const dx = fx ? festivalById(fx.ref).start : "9999", dy = fy ? festivalById(fy.ref).start : "9999";
      return dx.localeCompare(dy);
    });
    worldList.innerHTML = order
      .map((p) => {
        const fest = p.items.find((it) => it.kind === "festival");
        const r = fest ? rank(fest.ref) : null;
        return `<li class="wcity" data-place="${p.id}"><p class="wcity__head">${t.cities[p.city]}${r ? `<span class="gcard__badge${r === "then" ? " gcard__badge--then" : ""}">${t.world[r]}</span>` : ""}</p><ul class="wcity__items">${p.items.map((it) => itemHTML(it, t, rank)).join("")}</ul></li>`;
      })
      .join("");
  };
  let worldView = (() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "globe" || v === "list") return v;
    } catch {}
    return narrowMQ.matches ? "list" : "globe";
  })();
  const setWorldView = (v, persist) => {
    worldView = v;
    worldScene.dataset.view = v;
    worldList.hidden = v !== "list";
    viewBtns.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === v)));
    if (v === "list" && globe) globe.blur();
    if (globe) v === "globe" ? globe.start() : globe.stop();
    if (persist) {
      try {
        localStorage.setItem(VIEW_KEY, v);
      } catch {}
    }
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  viewBtns.forEach((b) => b.addEventListener("click", () => setWorldView(b.dataset.view, true)));

  const initGlobe = () => {
    const canvas = $("#globe");
    if (!canvas || !window.SMGlobe || !window.SM_LAND) return;
    const up = upcoming();
    const rankOf = (kind) => {
      const f = up[kind === "next" ? 0 : 1];
      return f ? f.city : null;
    };
    const places = PLACES.map((p) => {
      const kinds = p.items.map((i) => i.kind);
      return {
        id: p.id,
        lat: p.lat,
        lon: p.lon,
        festival: kinds.includes("festival"),
        kind: kinds.includes("festival") ? (kinds.length > 1 ? "mixed" : "festival") : kinds.includes("social") ? "social" : "classes",
        label: I18N[lang].cities[p.city],
      };
    });
    globe = SMGlobe.create({
      canvas,
      land: window.SM_LAND,
      places,
      next: rankOf("next"),
      then: rankOf("then"),
      coarse,
      reduce,
      onFocus: (id) => {
        openPlace = id;
        renderCard(id);
        gcard.hidden = false;
        requestAnimationFrame(() => gcard.classList.add("on"));
      },
      onBlur: () => {
        openPlace = null;
        gcard.classList.remove("on");
        setTimeout(() => {
          if (!openPlace) gcard.hidden = true;
        }, 450);
      },
    });
    window.SM.globe = globe; // reachable for verification
    // paths in
    const paths = $("#paths");
    paths.innerHTML = PATHS.map((p) => `<a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.name}</a>`).join("");
    // run only while the world is on screen
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && worldView === "globe" ? globe.start() : globe.stop())), { threshold: 0.05 });
    io.observe($("#s-globe"));
    buildWorldList();
    setWorldView(worldView, false);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && globe.isFocused()) globe.blur();
    });
  };
  const localizeGlobe = () => {
    if (worldList) buildWorldList();
    if (!globe) return;
    const map = {};
    PLACES.forEach((p) => (map[p.id] = I18N[lang].cities[p.city]));
    globe.setLabels(map);
    if (openPlace) renderCard(openPlace);
  };

  /* ================================================================ */
  /* The menu — a quick visit, the links, the account, the language    */
  /* ================================================================ */
  const menu = $("#menu");
  const menuOpen = $("#menu-open");
  const menuScenes = $("#menu-scenes");
  const setMenu = (on) => {
    menu.hidden = !on;
    menuOpen.setAttribute("aria-expanded", String(on));
    document.documentElement.style.overflow = on ? "hidden" : "";
    if (on) $("#menu-close").focus();
    else menuOpen.focus();
  };
  const buildMenu = () => {
    menuOpen.addEventListener("click", () => setMenu(menu.hidden));
    $$("[data-menu-close]").forEach((el) => el.addEventListener("click", () => setMenu(false)));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) setMenu(false);
    });
    menuScenes.innerHTML = "";
    scenes.forEach((s, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.scene = s.id;
      b.innerHTML = `<span class="n">${String(i + 1).padStart(2, "0")}</span><span data-label></span>`;
      // a quick visit: straight there, no walk
      b.addEventListener("click", () => {
        setMenu(false);
        stopWalk();
        window.scrollTo({ top: Math.max(0, landingY(s)), behavior: "auto" });
      });
      li.appendChild(b);
      menuScenes.appendChild(li);
    });
  };
  const localizeMenu = () => {
    const t = I18N[lang];
    menuOpen.setAttribute("aria-label", t.menu.open);
    menuOpen.title = t.menu.open;
    const c = $("#menu-close");
    if (c) c.setAttribute("aria-label", t.menu.close);
    $$("#menu-scenes button").forEach((b) => {
      const v = get(document.getElementById(b.dataset.scene)?.dataset.dot || "");
      $("[data-label]", b).textContent = typeof v === "string" ? v : b.dataset.scene;
    });
  };

  /* ================================================================ */
  /* The pass ladder — real text, tap a rung to ask about it           */
  /* ================================================================ */
  const ladder = $("#ladder");
  const buildLadder = () => {
    const t = I18N[lang].passes;
    ladder.innerHTML = "";
    PASSES.forEach((p) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "rung";
      b.setAttribute("aria-label", `${p.name} — ${t.ask}`);
      const inc = p.tier === "full" ? t.fullIncludes : t.masterIncludes;
      const when = p.when ? `<span class="when"> · ${p.when}</span>` : "";
      b.innerHTML = `<span><span class="name">${p.name}</span>${when}<p class="inc">${inc}</p></span><span class="go">${t.ask}</span>`;
      b.addEventListener("click", () => {
        $("#s-ask").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        ask("pass", p.name);
      });
      li.appendChild(b);
      ladder.appendChild(li);
    });
  };

  /* ================================================================ */
  /* The chat — five scripted answers, honest about what it is         */
  /* ================================================================ */
  const log = $("#chat-log");
  const chips = $("#chips");
  const form = $("#chat-form");
  const input = $("#chat-input");
  const QS = ["pass", "stay", "transfer", "schedule", "teach"];
  const HINTS = {
    pass: ["pass", "pase", "which", "qué pase", "quel", "qual", "need", "necesito", "preciso", "full"],
    stay: ["stay", "hotel", "hyatt", "room", "quedo", "loger", "hospedo", "habitaci", "chambre", "quarto", "sleep"],
    transfer: ["transfer", "refund", "reembols", "rembours", "name change", "cambio de nombre", "transfér", "devolu"],
    schedule: ["schedule", "horario", "programme", "programa", "time", "when", "cuándo", "quand", "quando", "hora", "heure"],
    teach: ["teach", "who", "artist", "enseñ", "enseign", "aula", "lineup", "quién", "qui ", "quem", "instructor", "profe"],
  };
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const scrollLog = () => (log.scrollTop = log.scrollHeight);
  const answerCard = (key) => {
    const a = I18N[lang].chat.a[key];
    const body = a.body.replace("__ARTISTS__", artists().join(" · "));
    return el("div", "card", `<h4>${a.title}</h4><p>${body}</p><a href="${CTA_URL[key]}" target="_blank" rel="noopener noreferrer">${a.cta}</a>`);
  };
  const ask = (key, text) => {
    const t = I18N[lang].chat;
    log.appendChild(el("div", "msg msg--me", text || t.q[key]));
    scrollLog();
    const typing = el("div", "typing", "<i></i><i></i><i></i>");
    log.appendChild(typing);
    scrollLog();
    const reply = () => {
      typing.remove();
      log.appendChild(key ? answerCard(key) : el("div", "msg msg--sm", t.fallback));
      scrollLog();
    };
    reduce ? reply() : setTimeout(reply, 520);
  };
  const buildChips = () => {
    const t = I18N[lang].chat;
    chips.innerHTML = "";
    QS.forEach((k) => {
      const b = el("button", "chip", t.q[k]);
      b.type = "button";
      b.addEventListener("click", () => ask(k));
      chips.appendChild(b);
    });
  };
  const intent = (text) => {
    const s = text.toLowerCase();
    for (const k of QS) if (HINTS[k].some((h) => s.includes(h))) return k;
    return null;
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    ask(intent(v), v);
  });

  /* ================================================================ */
  /* Scroll — the trailer                                              */
  /* ================================================================ */
  const goStatic = () => {
    document.documentElement.classList.add("static");
    $("#hud").classList.add("on");
    dots.classList.add("on");
    walk.classList.add("on");
  };

  const loadGsap = () =>
    new Promise((resolve, reject) => {
      if (window.gsap && window.ScrollTrigger) return resolve();
      const add = (src) =>
        new Promise((ok, no) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = ok;
          s.onerror = no;
          document.head.appendChild(s);
        });
      add("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
        .then(() => add("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"))
        .then(resolve, reject);
    });

  const initScroll = () => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return goStatic();
    gsap.registerPlugin(ScrollTrigger);
    universe.start();

    // iOS decodes frames for a scrubbed video only after one play() inside a gesture.
    let unlocked = false;
    const unlock = (e) => {
      if (unlocked) return;
      unlocked = true;
      const target = e && e.target && e.target.closest ? e.target.closest(".scene--film")?.querySelector("video") : null;
      $$("video").forEach((v) => {
        if (v === target) return;
        v.dataset.unlock = "1";
        const p = v.play();
        const done = () => v.pause();
        if (p && p.then) p.then(done).catch(() => delete v.dataset.unlock);
        else done();
      });
    };
    if (!coarse) ["touchstart", "pointerdown", "wheel", "keydown"].forEach((ev) => window.addEventListener(ev, unlock, { once: true, passive: true }));

    // HUD + dots appear once the opening has been left behind.
    ScrollTrigger.create({
      start: "top -35%",
      onEnter: () => (dots.classList.add("on"), walk.classList.add("on")),
      onLeaveBack: () => (dots.classList.remove("on"), walk.classList.remove("on")),
    });

    const pin = (trigger, end, extra = {}) => ({ trigger, start: "top top", end, pin: true, scrub: 0.65, anticipatePin: 1, ...extra });

    // 0 · open — the digits recede as the HUD takes over the count.
    gsap
      .timeline({ scrollTrigger: pin("#s-open", "+=110%") })
      .to("#s-open .cue", { opacity: 0, duration: 0.15 }, 0)
      .to("#s-open .kicker, #s-open .line, #s-open .until", { opacity: 0, y: -40, duration: 0.5, stagger: 0.05 }, 0.05)
      .to("#digits", { scale: 0.5, y: -140, opacity: 0, filter: "blur(10px)", duration: 0.8, ease: "power2.in" }, 0.2);

    // Pins are refreshed in creation order, so the timelines are built in DOM
    // order — words, film, words, film… — never grouped by type. Grouping put
    // the second words scene on top of the first room.
    const wordsScene = (scene) => {
      const lines = $$(".big", scene);
      const tl = gsap.timeline({ scrollTrigger: pin(scene, "+=" + (lines.length * 90 + 60) + "%") });
      lines.forEach((l, i) => {
        const at = i * 1;
        if (coarse) {
          tl.fromTo(l, { opacity: 0, scale: 1.8, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" }, at);
        } else {
          tl.fromTo(l, { opacity: 0, scale: 2.6, filter: "blur(22px)", y: 40 }, { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 0.55, ease: "power3.out" }, at);
        }
        if (i < lines.length - 1) tl.to(l, coarse ? { opacity: 0, scale: 0.6, y: -140, duration: 0.45, ease: "power2.in" } : { opacity: 0, scale: 0.55, y: -160, filter: "blur(10px)", duration: 0.45, ease: "power2.in" }, at + 0.7);
        else tl.to(l, { opacity: 0, scale: 0.8, y: -120, duration: 0.4, ease: "power2.in" }, at + 0.85);
      });
      tl.fromTo(U, { swirl: 0 }, { swirl: 0.5, duration: lines.length * 0.6, ease: "sine.inOut" }, 0).to(U, { swirl: 0, duration: 0.5 }, ">");
    };

    // film scenes — a different reveal each, the word crossing the frame,
    // the clip scrubbed through the middle of the scene, stills fanning in.
    const filmScene = (scene) => {
      const kind = scene.dataset.frame;
      const frame = $(".frame", scene);
      const video = $("video", scene);
      const word = $(".big--cross", scene);
      const subs = $$(".sub", scene);
      const pics = $$(".pic", scene);
      let dur = 0, lastT = -1;
      const onMeta = () => (dur = video.duration || 0);
      if (video.readyState >= 1) onMeta();
      else video.addEventListener("loadedmetadata", onMeta, { once: true });

      const tl = gsap.timeline({
        scrollTrigger: pin(scene, "+=300%", {
          onUpdate: (st) => {
            if (!dur || video.dataset.playing === "1") return;
            const p = Math.min(1, Math.max(0, (st.progress - 0.12) / 0.72));
            const t = p * (dur - 0.05);
            if (Math.abs(t - lastT) < 1 / 30) return;
            lastT = t;
            try {
              video.currentTime = t;
            } catch {
              /* not seekable yet */
            }
          },
          onEnter: () => {
            video.style.opacity = 1;
            if (video.preload !== "auto") video.preload = "auto";
          },
          onRefresh: () => {
            if (!coarse || video.dataset.unlocked) return;
            // one viewport ahead of the room, muted, once
            ScrollTrigger.create({
              trigger: scene,
              start: "top bottom",
              once: true,
              onEnter: () => {
                if (video.dataset.unlocked) return;
                video.dataset.unlocked = "1";
                video.preload = "auto";
                if (video.dataset.playing === "1") return;
                video.dataset.unlock = "1";
                const p = video.play();
                if (p && p.then) p.then(() => video.pause()).catch(() => delete video.dataset.unlock);
              },
            });
          },
          onEnterBack: () => (video.style.opacity = 1),
          onLeave: () => leaveRoom(scene),
          onLeaveBack: () => leaveRoom(scene),
        }),
      });

      if (kind === "iris") tl.fromTo(frame, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(78% at 50% 50%)", duration: 0.42, ease: "power2.inOut" }, 0);
      if (kind === "bars") tl.fromTo(frame, { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.42, ease: "power3.inOut" }, 0);
      if (kind === "disc") tl.fromTo(frame, { xPercent: -50, yPercent: 24, scale: 0.32 }, { xPercent: -50, yPercent: -50, scale: 1, duration: 0.6, ease: "power2.inOut" }, 0);
      if (kind === "slide") tl.fromTo(frame, { xPercent: 4, scale: 1.14, opacity: 0 }, { xPercent: -4, scale: 1.02, opacity: 1, duration: 1, ease: "none" }, 0);
      tl.to(frame, { opacity: 0, duration: 0.14, ease: "power2.in" }, 0.86);

      if (coarse) tl.fromTo(word, { xPercent: 26, opacity: 0 }, { xPercent: -26, opacity: 1, duration: 0.9, ease: "none" }, 0.05).to(word, { opacity: 0, duration: 0.12 }, 0.86);
      else tl.fromTo(word, { xPercent: 26, opacity: 0, filter: "blur(8px)" }, { xPercent: -26, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "none" }, 0.05).to(word, { opacity: 0, duration: 0.12 }, 0.86);
      tl.fromTo(subs, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.05, ease: "power3.out" }, 0.3).to(subs, { opacity: 0, y: -20, duration: 0.12 }, 0.84);
      if (pics.length) {
        tl.fromTo(
          pics,
          { opacity: 0, y: 120, rotateZ: (i) => (i % 2 ? 6 : -6), scale: 0.8 },
          { opacity: 1, y: 0, rotateZ: (i) => (i % 2 ? 3 : -3), scale: 1, duration: 0.25, stagger: 0.07, ease: "power3.out" },
          0.38,
        ).to(pics, { opacity: 0, y: -80, duration: 0.12, stagger: 0.03 }, 0.82);
      }
      // the field recedes behind footage, reddens for the dance floor
      tl.to(U, { dim: 0.28, duration: 0.3 }, 0).to(U, { dim: 1, duration: 0.14 }, 0.86);
      if (kind === "disc") tl.to(U, { red: 1, swirl: 1.2, duration: 0.5 }, 0.05).to(U, { red: 0, swirl: 0, duration: 0.2 }, 0.8);
    };

    // 7 · the world — the head arrives, the globe rises, the field recedes.
    // On narrow screens the scene is not pinned: the list scrolls in flow.
    const globeScene = () => {
      if (narrowMQ.matches) {
        ScrollTrigger.create({ trigger: "#s-globe", start: "top 80%", end: "bottom 20%", onEnter: () => universe.stop(), onLeave: () => universe.start(), onEnterBack: () => universe.stop(), onLeaveBack: () => universe.start() });
        return;
      }
      gsap
        .timeline({ scrollTrigger: pin("#s-globe", "+=150%", { onEnter: () => universe.stop(), onLeave: () => universe.start(), onEnterBack: () => universe.stop(), onLeaveBack: () => universe.start() }) })
        .fromTo("#s-globe .big--map", coarse ? { opacity: 0, scale: 1.5 } : { opacity: 0, scale: 1.9, filter: "blur(14px)" }, coarse ? { opacity: 1, scale: 1, duration: 0.18, ease: "power3.out" } : { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.18, ease: "power3.out" }, 0)
        .fromTo("#s-globe .globe__head .sub", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, 0.08)
        .fromTo("#globe-stage", { opacity: 0, scale: 0.86, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power3.out" }, 0.1)
        .to(U, { dim: 0, swirl: 0.35, duration: 0.25 }, 0)
        .to({}, { duration: 0.5 }) // the hold — spin it, tap a light, open a card
        .to(U, { dim: 1, swirl: 0, duration: 0.1 }, 0.9);
    };

    $$(".scene").forEach((scene) => {
      if (scene.classList.contains("scene--words")) wordsScene(scene);
      else if (scene.classList.contains("scene--film")) filmScene(scene);
      else if (scene.id === "s-globe") globeScene();
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    // 8 · 9 · 10 · flow scenes — one reveal each, and it stays.
    ["#s-passes", "#s-ask", "#s-end"].forEach((sel) => {
      gsap.to(`${sel} .reveal`, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sel, start: "top 62%", once: true },
      });
    });

    // Tilt cards follow the hand in the compete scene.
    if (!coarse) {
      const tiltPics = $$(".pics--tilt .pic");
      window.addEventListener(
        "pointermove",
        (e) => {
          const rx = (e.clientY / window.innerHeight - 0.5) * -14;
          const ry = (e.clientX / window.innerWidth - 0.5) * 18;
          tiltPics.forEach((p, i) => (p.style.transform = `${p.style.transform.replace(/rotateX\([^)]*\)\s?rotateY\([^)]*\)\s?/, "")} rotateX(${rx + i}deg) rotateY(${ry - i * 2}deg)`));
        },
        { passive: true },
      );
    }
  };

  /* ================================================================ */
  /* boot                                                              */
  /* ================================================================ */
  $("#hud").classList.add("on"); // the header is sticky from the first frame
  buildLangGroups();
  buildDots();
  buildRooms();
  buildMenu();
  initGlobe();
  applyLang();
  watchDots();
  if (reduce) initScroll();
  else loadGsap().then(initScroll, goStatic);
})();
