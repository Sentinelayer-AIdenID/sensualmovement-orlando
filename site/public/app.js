/*
  Sensual Movement — Orlando 11th Anniversary · front door
  app.js — countdown, language, scroll-scrubbed footage, the pass ladder, the chat.
  Vanilla JS. GSAP ScrollTrigger from CDN for the scrub. No other dependencies.
*/
(() => {
  "use strict";
  const { FACTS, artists, PASSES, I18N, LANGS, CTA_URL } = window.SM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), I18N[lang]);

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
        $("#beat-ask").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
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

  // Loose intent match across all four languages, so free text still lands
  // on a scripted answer when it plainly means one of the five.
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
  const scroll = () => (log.scrollTop = log.scrollHeight);

  const answerCard = (key) => {
    const a = I18N[lang].chat.a[key];
    const body = a.body.replace("__ARTISTS__", artists().join(" · "));
    const c = el(
      "div",
      "card",
      `<h4>${a.title}</h4><p>${body}</p><a href="${CTA_URL[key]}" target="_blank" rel="noopener noreferrer">${a.cta}</a>`,
    );
    return c;
  };

  const ask = (key, text) => {
    const t = I18N[lang].chat;
    log.appendChild(el("div", "msg msg--me", text || t.q[key]));
    scroll();
    const typing = el("div", "typing", "<i></i><i></i><i></i>");
    log.appendChild(typing);
    scroll();
    const reply = () => {
      typing.remove();
      log.appendChild(key ? answerCard(key) : el("div", "msg msg--sm", t.fallback));
      scroll();
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
  /* Pointer veil — the dark lifts where your hand is                  */
  /* ================================================================ */
  $$(".film").forEach((film) => {
    const stage = film.closest(".stage");
    const move = (x, y) => {
      const r = stage.getBoundingClientRect();
      film.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
      film.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
    };
    stage.addEventListener("pointermove", (e) => move(e.clientX, e.clientY), { passive: true });
    stage.addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  });

  /* ================================================================ */
  /* Scroll — scrubbed footage, pinned beats, one reveal per beat      */
  /* ================================================================ */
  const revealNow = () => $$(".reveal").forEach((r) => ((r.style.opacity = 1), (r.style.transform = "none")));

  /*
    GSAP is loaded here, after first paint, rather than as a <script> in the
    document. The countdown is the page's LCP and it is JS-rendered; putting
    two cross-origin library fetches ahead of it moved LCP from ~1.7 s to
    3.9 s on simulated 4G. Now the digits paint first and the scroll wires
    itself the moment the library arrives.
  */
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
    if (reduce || !window.gsap || !window.ScrollTrigger) {
      // Posters and fades only. The CSS already hides the video and shows the poster.
      revealNow();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // iOS will not decode frames for a scrubbed video until it has been played
    // once inside a user gesture. Do that silently on the first touch.
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      $$("video").forEach((v) => {
        const p = v.play();
        if (p && p.then) p.then(() => v.pause()).catch(() => {});
      });
    };
    ["touchstart", "pointerdown", "wheel", "keydown"].forEach((ev) =>
      window.addEventListener(ev, unlock, { once: true, passive: true }),
    );

    // the gold thread
    gsap.to("#thread", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.4 },
    });

    $$(".beat--film").forEach((beat) => {
      const video = $("video", beat);
      const bars = $("[data-bars]", beat);
      const reveals = $$(".reveal", beat);
      let dur = 0;
      let last = -1;
      const onMeta = () => {
        dur = video.duration || 0;
        video.dataset.dur = dur.toFixed(2);
      };
      if (video.readyState >= 1) onMeta();
      else video.addEventListener("loadedmetadata", onMeta, { once: true });

      // The scrub: progress → currentTime. Throttled to frame steps so we are
      // not hammering the decoder with sub-frame seeks.
      ScrollTrigger.create({
        trigger: beat,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        onUpdate: (st) => {
          if (!dur) return;
          const t = st.progress * (dur - 0.05);
          if (Math.abs(t - last) < 1 / 30) return;
          last = t;
          try {
            video.currentTime = t;
          } catch {
            /* not seekable yet */
          }
        },
      });

      // the letterbox lifts on the arrival beat
      if (bars) {
        gsap.fromTo(
          bars,
          { "--bar": 1 },
          {
            "--bar": 0,
            ease: "power2.out",
            scrollTrigger: { trigger: beat, start: "top top", end: "+=45%", scrub: 0.5 },
          },
        );
      }

      // one reveal per beat, and it stays
      gsap.to(reveals, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: beat, start: "top 40%", once: true },
      });

      // Once the beat is done, the poster stays as the last frame — cheap, and
      // it means a fast scroll back up never shows a blank stage.
      ScrollTrigger.create({
        trigger: beat,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          video.style.opacity = 1;
          // Only now is it worth buffering the whole 6 s — before this point
          // the metadata alone was enough, and the bytes stayed off the LCP path.
          if (video.preload !== "auto") video.preload = "auto";
        },
        onEnterBack: () => (video.style.opacity = 1),
      });
    });

    // reveals in the non-film beats
    gsap.to("#beat-end .reveal", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.14,
      scrollTrigger: { trigger: "#beat-end", start: "top 60%", once: true },
    });
  };

  /* ================================================================ */
  /* boot                                                              */
  /* ================================================================ */
  buildLangGroups();
  applyLang();
  if (reduce) initScroll();
  else loadGsap().then(initScroll, revealNow);
})();
