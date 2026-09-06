/*
  Sensual Movement — the world.
  globe.js — a planet of light on a 2D canvas: land as dots, every city they
  dance in as a pin that travels with the sphere and dims as it passes behind,
  the next festival pulsing, the one after it softer. Drag to spin, with
  inertia; it idles into a slow turn. Tap a pin and the globe turns and zooms to
  it. No library: orthographic projection, ~2 500 points a frame.
*/
window.SMGlobe = (() => {
  "use strict";
  const TAU = Math.PI * 2;
  const rad = (d) => (d * Math.PI) / 180;
  const COL = { white: "252,250,247", gold: "184,137,43", red: "196,30,58", night: "18,10,16" };

  const create = (o) => {
    const canvas = o.canvas;
    const ctx = canvas.getContext("2d");
    const coarse = !!o.coarse;
    const reduce = !!o.reduce;
    const land = o.land; // flat [lat*10, lon*10, ...]
    const places = o.places; // [{ id, lat, lon, kind, label, festival, count }]
    let W = 0, H = 0, dpr = 1;
    let running = false, raf = 0, last = 0, idleAt = 0;

    // Precompute unit vectors for the land dots.
    const stride = coarse ? 2 : 1; /* patch8 */
    const N = Math.floor(land.length / 2 / stride);
    const LX = new Float32Array(N), LY = new Float32Array(N), LZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const la = rad(land[i * 2 * stride] / 10), lo = rad(land[i * 2 * stride + 1] / 10);
      LX[i] = Math.cos(la) * Math.sin(lo);
      LY[i] = Math.sin(la);
      LZ[i] = Math.cos(la) * Math.cos(lo);
    }
    const P = places.map((p) => {
      const la = rad(p.lat), lo = rad(p.lon);
      return { ...p, vx: Math.cos(la) * Math.sin(lo), vy: Math.sin(la), vz: Math.cos(la) * Math.cos(lo), sx: 0, sy: 0, z: -1 };
    });

    // View state. yaw about Y, pitch about X. focus() tweens these.
    const S = { yaw: rad(42), pitch: rad(22), vyaw: 0, vpitch: 0, zoom: 1, shiftX: 0, shiftY: 0, dragging: false, focus: null, next: o.next || null, then: o.then || null, hover: null };
    const tweens = {}; // simple in-house tweens so this file needs nothing else
    const tween = (key, to, dur, ease) => {
      tweens[key] = { from: S[key], to, t: 0, dur, ease: ease || ((x) => 1 - Math.pow(1 - x, 3)) };
    };
    const stepTweens = (dt) => {
      for (const k of Object.keys(tweens)) {
        const tw = tweens[k];
        tw.t = Math.min(1, tw.t + dt / tw.dur);
        S[k] = tw.from + (tw.to - tw.from) * tw.ease(tw.t);
        if (tw.t >= 1) delete tweens[k];
      }
    };
    const shortest = (from, to) => {
      let d = (to - from) % TAU;
      if (d > Math.PI) d -= TAU;
      if (d < -Math.PI) d += TAU;
      return from + d;
    };

    const size = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const project = (x, y, z) => {
      // yaw about Y
      const cy = Math.cos(S.yaw), sy = Math.sin(S.yaw);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      // pitch about X
      const cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      return [x1, y2, z2];
    };

    const geometry = () => {
      const R = Math.min(W, H) * 0.42 * S.zoom;
      const cx = W / 2 + S.shiftX * W;
      const cy = H / 2 + S.shiftY * H;
      return { R, cx, cy };
    };

    const BUCKETS = 12;
    const BIN = Array.from({ length: BUCKETS }, () => []);
    const FILL = Array.from({ length: BUCKETS }, (_, b) => {
      const z = (b + 0.5) / BUCKETS;
      return `rgba(${COL.white},${(0.14 + 0.62 * z * z).toFixed(3)})`;
    });
    let pulseT = 0;
    const draw = (dt) => {
      pulseT += dt;
      const { R, cx, cy } = geometry();
      ctx.clearRect(0, 0, W, H);

      // pins on the far side, faint, seen through the sphere
      for (const p of P) {
        const [x, y, z] = project(p.vx, p.vy, p.vz);
        p.sx = cx + x * R;
        p.sy = cy - y * R;
        p.z = z;
        if (z < 0) {
          const a = 0.1 + 0.18 * (1 + z); // fades the deeper it goes
          ctx.fillStyle = `rgba(${p.festival ? COL.gold : COL.white},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 2.2, 0, TAU);
          ctx.fill();
        }
      }

      // the sphere: dark glass with a lit shoulder and a gold rim
      const g = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.45, R * 0.05, cx, cy, R * 1.02);
      g.addColorStop(0, "rgba(58,34,46,0.86)");
      g.addColorStop(0.55, "rgba(26,15,22,0.86)");
      g.addColorStop(1, "rgba(18,10,16,0.92)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(${COL.gold},${(0.32 - i * 0.1).toFixed(2)})`;
        ctx.lineWidth = 1 + i * 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, R + i * 1.2, 0, TAU);
        ctx.stroke();
      }

      // land — dots are binned by brightness so the fill style changes a
      // dozen times a frame, not once per dot (that was the lag).
      const cyaw = Math.cos(S.yaw), syaw = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
      const dot = Math.max(0.9, R / 260);
      for (let b = 0; b < BUCKETS; b++) BIN[b].length = 0;
      for (let i = 0; i < N; i++) {
        const x = LX[i], y = LY[i], z = LZ[i];
        const x1 = x * cyaw + z * syaw;
        const z1 = -x * syaw + z * cyaw;
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        if (z2 <= 0.02) continue;
        const b = Math.min(BUCKETS - 1, Math.floor(z2 * BUCKETS));
        BIN[b].push(cx + x1 * R, cy - y2 * R);
      }
      for (let b = 0; b < BUCKETS; b++) {
        const pts = BIN[b];
        if (!pts.length) continue;
        ctx.fillStyle = FILL[b];
        const s = dot * (0.7 + 0.8 * ((b + 0.5) / BUCKETS));
        const h = s / 2;
        for (let k = 0; k < pts.length; k += 2) ctx.fillRect(pts[k] - h, pts[k + 1] - h, s, s);
      }

      // front pins
      ctx.font = `500 ${Math.round(11 * Math.min(1.35, S.zoom))}px Oswald, "Arial Narrow", sans-serif`;
      ctx.textBaseline = "middle";
      for (const p of P) {
        if (p.z <= 0) continue;
        const depth = Math.min(1, p.z * 1.4);
        const isNext = p.id === S.next, isThen = p.id === S.then, isFocus = p.id === S.focus, isHover = p.id === S.hover;
        // pulse rings
        if (!reduce && (isNext || isThen)) {
          const rings = isNext ? 2 : 1;
          const period = isNext ? 2.4 : 3.4;
          const amp = isNext ? 1 : 0.55;
          for (let k = 0; k < rings; k++) {
            const ph = ((pulseT / period + k / rings) % 1);
            const rr = 6 + ph * 28 * amp * Math.min(1.4, S.zoom);
            ctx.strokeStyle = `rgba(${COL.gold},${((1 - ph) * 0.6 * amp * depth).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, rr, 0, TAU);
            ctx.stroke();
          }
        } else if (reduce && isNext) {
          ctx.strokeStyle = `rgba(${COL.gold},0.5)`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 12, 0, TAU);
          ctx.stroke();
        }
        const lift = isFocus || isHover ? 1.35 : 1;
        if (p.festival) {
          ctx.fillStyle = `rgba(${COL.gold},${(0.55 + 0.45 * depth).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 4.6 * lift, 0, TAU);
          ctx.fill();
          ctx.fillStyle = `rgba(${COL.night},0.9)`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 1.6 * lift, 0, TAU);
          ctx.fill();
          if (p.kind !== "festival") {
            // festival city that also has weekly life: a white ring outside
            ctx.strokeStyle = `rgba(${COL.white},${(0.5 * depth).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, 8 * lift, 0, TAU);
            ctx.stroke();
          }
        } else if (p.kind === "social") {
          ctx.strokeStyle = `rgba(${COL.white},${(0.5 + 0.5 * depth).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 4.4 * lift, 0, TAU);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${COL.white},${(0.5 + 0.5 * depth).toFixed(3)})`;
          const s = 5.5 * lift;
          ctx.fillRect(p.sx - s / 2, p.sy - s / 2, s, s);
        }
        // label — festival cities always, others when close to the front
        if (p.label && (p.festival || (p.z > 0.55 && (!coarse || S.zoom > 1.3)))) {
          ctx.fillStyle = `rgba(${COL.white},${(0.35 + 0.6 * depth).toFixed(3)})`;
          ctx.textAlign = "left";
          ctx.fillText(p.label.toUpperCase().split("").join(" "), p.sx + 11 * lift, p.sy + 0.5);
        }
      }
    };

    const loop = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;
      stepTweens(dt);
      if (!S.dragging) {
        S.yaw += S.vyaw * dt;
        S.pitch = Math.max(-1.25, Math.min(1.25, S.pitch + S.vpitch * dt));
        S.vyaw *= Math.pow(0.12, dt);
        S.vpitch *= Math.pow(0.12, dt);
        if (Math.abs(S.vyaw) < 0.01) S.vyaw = 0;
        if (Math.abs(S.vpitch) < 0.01) S.vpitch = 0;
        // idle: a slow turn, unless a city is in focus or motion is reduced
        if (!reduce && !S.focus && !tweens.yaw && now - idleAt > 2600 && !S.vyaw) S.yaw += 0.09 * dt;
      }
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* ---- pointer: drag to spin, tap a light ---- */
    let px = 0, py = 0, moved = 0, downAt = 0;
    const hist = [];
    const HIT = coarse ? 34 : 26;
    const nearest = (x, y) => {
      let best = null, bd = HIT * HIT;
      for (const p of P) {
        if (p.z <= 0.05) continue;
        // the pin itself…
        let d = (p.sx - x) ** 2 + (p.sy - y) ** 2;
        // …or its label, drawn to the right of it
        if (p.label && (p.festival || p.z > 0.55)) {
          const lw = p.label.length * 9 * Math.min(1.35, S.zoom) + 12;
          if (x > p.sx + 6 && x < p.sx + lw && Math.abs(y - p.sy) < 12) d = 0;
        }
        if (d < bd) (bd = d), (best = p);
      }
      return best;
    };
    const local = (e) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      [px, py] = local(e);
      moved = 0;
      downAt = performance.now();
      S.dragging = true;
      S.vyaw = S.vpitch = 0;
      hist.length = 0;
      idleAt = performance.now();
    });
    canvas.addEventListener("pointermove", (e) => {
      const [x, y] = local(e);
      if (S.dragging) {
        const dx = x - px, dy = y - py;
        moved += Math.abs(dx) + Math.abs(dy);
        const k = 0.0062 / Math.max(0.8, S.zoom);
        S.yaw += dx * k;
        if (!coarse) S.pitch = Math.max(-1.25, Math.min(1.25, S.pitch - dy * k));
        hist.push([performance.now(), dx, dy]);
        if (hist.length > 6) hist.shift();
        px = x;
        py = y;
        idleAt = performance.now();
        if (!running) draw(0);
      } else if (!coarse) {
        const n = nearest(x, y);
        S.hover = n ? n.id : null;
        canvas.style.cursor = n ? "pointer" : "grab";
      }
    });
    const up = (e) => {
      if (!S.dragging) return;
      S.dragging = false;
      idleAt = performance.now();
      if (moved < 6 && performance.now() - downAt < 600) {
        const [x, y] = local(e);
        const n = nearest(x, y);
        if (n) focus(n.id);
        else if (S.focus) blur();
        return;
      }
      // inertia from the last few moves
      if (hist.length >= 2) {
        const [t0] = hist[0];
        const [t1] = hist[hist.length - 1];
        const dtm = Math.max(16, t1 - t0) / 1000;
        let dx = 0, dy = 0;
        for (const [, a, b] of hist) (dx += a), (dy += b);
        const k = 0.0062 / Math.max(0.8, S.zoom);
        S.vyaw = (dx * k) / dtm;
        S.vpitch = coarse ? 0 : (-dy * k) / dtm;
        const cap = 4;
        S.vyaw = Math.max(-cap, Math.min(cap, S.vyaw));
        S.vpitch = Math.max(-cap, Math.min(cap, S.vpitch));
      }
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", () => {
      S.dragging = false;
      hist.length = 0;
      idleAt = performance.now();
    });
    canvas.addEventListener("pointerleave", () => {
      if (!S.dragging) (S.hover = null), (canvas.style.cursor = "grab");
    });

    /* ---- focus: turn, zoom, and tell the page ---- */
    const focus = (id) => {
      const p = P.find((q) => q.id === id);
      if (!p) return;
      S.focus = id;
      S.vyaw = S.vpitch = 0;
      tween("yaw", shortest(S.yaw, -rad(p.lon)), 1.1);
      tween("pitch", rad(p.lat), 1.1);
      tween("zoom", coarse ? 1.45 : 1.7, 1.1);
      tween("shiftX", coarse ? 0 : -0.16, 1.1);
      tween("shiftY", coarse ? -0.16 : 0, 1.1);
      idleAt = performance.now();
      o.onFocus && o.onFocus(id);
    };
    const blur = () => {
      if (!S.focus) return;
      S.focus = null;
      tween("zoom", 1, 0.9);
      tween("shiftX", 0, 0.9);
      tween("shiftY", 0, 0.9);
      idleAt = performance.now();
      o.onBlur && o.onBlur();
    };

    window.addEventListener("resize", size, { passive: true });
    size();
    canvas.style.cursor = "grab";
    return {
      start,
      stop,
      focus,
      blur,
      resize: size,
      isFocused: () => !!S.focus,
      focused: () => S.focus,
      pins: () => P.map((p) => ({ id: p.id, x: p.sx, y: p.sy, z: p.z })),
      view: () => ({ yaw: S.yaw, pitch: S.pitch, zoom: S.zoom }),
      setNext: (next, then) => ((S.next = next), (S.then = then)),
      setLabels: (map) => P.forEach((p) => (p.label = map[p.id] ?? p.label)),
    };
  };

  return { create };
})();
