/* Linoy Pappachan Malakkaran — portfolio interactions (no dependencies) */
(() => {
  'use strict';

  window.__siteReady = true;

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = () => motionQuery.matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
  const EMAIL = 'linoymalakkaran@gmail.com';

  /* ---------------------------------------------------------------- toast */
  const toastEl = $('#toast');
  let toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastEl.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>';
    toastEl.append(document.createTextNode(message));
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.append(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* clipboard unavailable */ }
      ta.remove();
    }
  }

  /* ---------------------------------------------------------------- theme */
  const themeBtn = $('#themeToggle');
  const themeMeta = $('meta[name="theme-color"]');
  const systemLight = window.matchMedia('(prefers-color-scheme: light)');
  const systemTheme = () => (systemLight.matches ? 'light' : 'dark');
  const storedTheme = () => {
    try {
      const t = localStorage.getItem('theme');
      return t === 'light' || t === 'dark' ? t : null;
    } catch {
      return null;
    }
  };

  function syncThemeUI(theme) {
    if (themeMeta) themeMeta.content = theme === 'light' ? '#f6f7fb' : '#05060b';
    themeBtn?.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  function applyTheme(theme, persist = true) {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch { /* private mode */ }
    }
    syncThemeUI(theme);
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  function useSystemTheme() {
    try { localStorage.removeItem('theme'); } catch { /* private mode */ }
    applyTheme(systemTheme(), false);
  }

  // Follow OS changes until the visitor makes an explicit choice.
  systemLight.addEventListener?.('change', () => {
    if (!storedTheme()) applyTheme(systemTheme(), false);
  });

  function toggleTheme(evt) {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    if (!document.startViewTransition || reducedMotion()) {
      applyTheme(next);
      return;
    }
    const rect = themeBtn?.getBoundingClientRect();
    const fromPointer = evt && evt.detail > 0 && evt.clientX;
    const x = fromPointer ? evt.clientX : rect ? rect.left + rect.width / 2 : innerWidth - 40;
    const y = fromPointer ? evt.clientY : rect ? rect.top + rect.height / 2 : 40;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  }

  themeBtn?.addEventListener('click', toggleTheme);
  syncThemeUI(root.dataset.theme);

  /* ------------------------------------------------- nav, progress, spy */
  const nav = $('#nav');
  const progressBar = $('.scroll-progress span');
  const timeline = $('.timeline');
  let scrollQueued = false;

  function updateTimeline() {
    if (!timeline) return;
    const r = timeline.getBoundingClientRect();
    const p = clamp((innerHeight * 0.62 - r.top) / r.height, 0, 1);
    timeline.style.setProperty('--tl', p.toFixed(4));
  }

  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const y = window.scrollY;
      nav?.classList.toggle('is-scrolled', y > 16);
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
      updateTimeline();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  function initScrollSpy() {
    const links = $$('.nav__links a');
    const sections = $$('main > section[id]');
    if (!links.length || !sections.length) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const hash = `#${entry.target.id}`;
        links.forEach((a) => {
          const on = a.hash === hash;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  function initMobileMenu() {
    const burger = $('.nav__burger');
    const menu = $('#mobileMenu');
    if (!burger || !menu) return;
    menu.hidden = false;
    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      burger.querySelector('use')?.setAttribute('href', open ? '#i-x' : '#i-menu');
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* --------------------------------------------------- reveal & counters */
  function formatCount(el, value) {
    const decimals = Number(el.dataset.decimals || 0);
    const num = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return `${el.dataset.prefix || ''}${num}${el.dataset.suffix || ''}`;
  }

  function startCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reducedMotion()) { el.textContent = formatCount(el, target); return; }
    const duration = 1800;
    const begin = performance.now() + (el.closest('.hero') ? 900 : 120);
    const tick = (now) => {
      const t = clamp((now - begin) / duration, 0, 1);
      el.textContent = formatCount(el, target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initReveal() {
    const items = $$('[data-reveal]');
    const counters = $$('[data-count]');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));

    if (!reducedMotion()) counters.forEach((el) => { el.textContent = formatCount(el, 0); });
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        startCount(entry.target);
        countIO.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  function markLoaded() {
    const done = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
    if (document.fonts?.ready) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(done);
    } else {
      done();
    }
  }

  /* -------------------------------------------------------- role scramble */
  function initScramble() {
    const el = $('.scramble');
    if (!el || reducedMotion()) return;
    let words;
    try { words = JSON.parse(el.dataset.words); } catch { return; }
    if (!Array.isArray(words) || words.length < 2) return;
    const glyphs = '/\\[]{}=+*^?#_-~01ΔΣλ';
    let index = 0;
    let frame = 0;
    let queue = [];
    let raf = 0;

    const render = () => {
      const frag = document.createDocumentFragment();
      let done = 0;
      for (const q of queue) {
        if (frame >= q.end) {
          done++;
          frag.append(q.to);
        } else if (frame >= q.start) {
          if (!q.ch || Math.random() < 0.28) q.ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          const span = document.createElement('span');
          span.className = 'scramble__glyph';
          span.textContent = q.ch;
          frag.append(span);
        } else {
          frag.append(q.from);
        }
      }
      el.replaceChildren(frag);
      if (done < queue.length) {
        frame++;
        raf = requestAnimationFrame(render);
      }
    };

    const scrambleTo = (word) => {
      const from = el.textContent;
      const len = Math.max(from.length, word.length);
      queue = Array.from({ length: len }, (_, i) => {
        const start = Math.floor(Math.random() * 14);
        return { from: from[i] || '', to: word[i] || '', start, end: start + 8 + Math.floor(Math.random() * 16), ch: '' };
      });
      frame = 0;
      cancelAnimationFrame(raf);
      render();
    };

    setInterval(() => {
      if (document.hidden) return;
      index = (index + 1) % words.length;
      scrambleTo(words[index]);
    }, 3400);
  }

  /* ------------------------------------------------------ hero agent mesh */
  function initMesh() {
    const canvas = $('#mesh');
    const hero = $('.hero');
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !hero || !ctx) return;

    const LINK = 150;
    const pointer = { x: 0, y: 0, active: false };
    let w = 0;
    let h = 0;
    let nodes = [];
    let pulses = [];
    let running = false;
    let visible = true;
    let raf = 0;
    let last = 0;
    let colors = readColors();

    function readColors() {
      const cs = getComputedStyle(root);
      return {
        node: cs.getPropertyValue('--mesh-node').trim() || '190, 198, 255',
        line: cs.getPropertyValue('--mesh-line').trim() || '139, 123, 255',
        pulse: cs.getPropertyValue('--mesh-pulse').trim() || '58, 214, 240',
      };
    }

    function build() {
      const rect = canvas.getBoundingClientRect();
      const prevW = w;
      const prevH = h;
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const minor = nodes.length && Math.abs(w - prevW) < 40 && Math.abs(h - prevH) < 140;
      if (minor) {
        nodes.forEach((n) => { n.x = clamp(n.x, 0, w); n.y = clamp(n.y, 0, h); });
      } else {
        const count = Math.round(clamp((w * h) / 15000, 28, 110));
        nodes = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.3 + 0.6,
          hub: Math.random() < 0.09,
        }));
        pulses = [];
      }
      draw();
    }

    function neighbour(i) {
      const a = nodes[i];
      const options = [];
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        const dx = a.x - nodes[j].x;
        const dy = a.y - nodes[j].y;
        if (dx * dx + dy * dy < LINK * LINK) options.push(j);
      }
      return options.length ? options[Math.floor(Math.random() * options.length)] : -1;
    }

    function spawnPulse() {
      const from = Math.floor(Math.random() * nodes.length);
      const to = neighbour(from);
      if (to >= 0) pulses.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.014, hops: 2 + Math.floor(Math.random() * 4) });
    }

    function step(dt) {
      const k = dt / 16.7;
      for (const n of nodes) {
        n.x += n.vx * k;
        n.y += n.vy * k;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 180 * 180) {
            n.x += dx * 0.0016 * k;
            n.y += dy * 0.0016 * k;
          }
        }
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed * k;
        if (p.t < 1) continue;
        if (p.hops-- > 0) {
          const next = neighbour(p.to);
          if (next >= 0) {
            p.from = p.to;
            p.to = next;
            p.t = 0;
            continue;
          }
        }
        pulses.splice(i, 1);
      }
      if (pulses.length < Math.min(14, nodes.length / 5) && Math.random() < 0.08 * k) spawnPulse();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const { node, line, pulse } = colors;
      const buckets = [[], [], [], []];
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const t = 1 - Math.sqrt(d2) / LINK;
            buckets[Math.min(3, Math.floor(t * 4))].push(a.x, a.y, b.x, b.y);
          }
        }
      }
      ctx.lineWidth = 1;
      buckets.forEach((segs, bi) => {
        if (!segs.length) return;
        ctx.strokeStyle = `rgba(${line}, ${(0.04 + bi * 0.07).toFixed(3)})`;
        ctx.beginPath();
        for (let s = 0; s < segs.length; s += 4) {
          ctx.moveTo(segs[s], segs[s + 1]);
          ctx.lineTo(segs[s + 2], segs[s + 3]);
        }
        ctx.stroke();
      });

      if (pointer.active) {
        ctx.strokeStyle = `rgba(${pulse}, 0.16)`;
        ctx.beginPath();
        for (const n of nodes) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          if (dx * dx + dy * dy < 170 * 170) {
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(n.x, n.y);
          }
        }
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(${node}, 0.7)`;
      ctx.beginPath();
      for (const n of nodes) {
        if (n.hub) continue;
        ctx.moveTo(n.x + n.r, n.y);
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx.fill();

      for (const n of nodes) {
        if (!n.hub) continue;
        ctx.fillStyle = `rgba(${pulse}, 0.12)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${pulse}, 0.9)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of pulses) {
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const tail = Math.max(0, p.t - 0.35);
        ctx.strokeStyle = `rgba(${pulse}, 0.5)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail);
        ctx.lineTo(x, y);
        ctx.stroke();
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, `rgba(${pulse}, 0.95)`);
        g.addColorStop(1, `rgba(${pulse}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      if (!running) return;
      const dt = last ? Math.min(48, now - last) : 16.7;
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reducedMotion() || !visible || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = e.pointerType === 'mouse';
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; });
    let resizeTimer = 0;
    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 120);
    }).observe(canvas);
    document.addEventListener('themechange', () => {
      colors = readColors();
      if (!running) draw();
    });
    motionQuery.addEventListener?.('change', () => (reducedMotion() ? stop() : start()));

    build();
    start();
  }

  /* ------------------------------------------- pointer-driven micro-motion */
  function initTilt() {
    if (!finePointer.matches || reducedMotion()) return;
    $$('[data-tilt]').forEach((el) => {
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--rx', `${(-py * 9).toFixed(2)}deg`);
          el.style.setProperty('--ry', `${(px * 11).toFixed(2)}deg`);
          el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
          el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
        });
      });
      el.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  function initMagnetic() {
    if (!finePointer.matches || reducedMotion()) return;
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx * 0.16).toFixed(1)}px, ${(dy * 0.26).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  function initSpotlight() {
    if (!finePointer.matches) return;
    document.addEventListener('pointermove', (e) => {
      const card = e.target instanceof Element ? e.target.closest('.spotlight') : null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
      card.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
    }, { passive: true });
  }

  /* -------------------------------------------------------- agent console */
  function initConsole() {
    const body = $('#console');
    if (!body || reducedMotion()) return;
    const lines = $$('.console__line', body);
    const snapshot = lines.map((l) => l.innerHTML);
    const spinner = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      lines.forEach((line, i) => {
        line.innerHTML = snapshot[i];
        line.style.visibility = 'hidden';
      });
    }

    function play() {
      reset();
      let t = 250;
      lines.forEach((line, i) => {
        const cmd = $('.c-cmd', line);
        if (i === 0 && cmd) {
          const full = cmd.textContent;
          later(() => { line.style.visibility = 'visible'; cmd.textContent = ''; }, t);
          for (let c = 1; c <= full.length; c++) later(() => { cmd.textContent = full.slice(0, c); }, t + 40 + c * 30);
          t += 40 + full.length * 30 + 380;
          return;
        }
        const val = $('.c-val', line);
        if (!val) {
          later(() => { line.style.visibility = 'visible'; }, t);
          return;
        }
        const text = val.textContent;
        const think = 300 + Math.random() * 260;
        later(() => {
          line.style.visibility = 'visible';
          val.classList.add('c-spin');
          val.textContent = spinner[0];
        }, t);
        for (let s = 1; s < 8; s++) later(() => { val.textContent = spinner[s % spinner.length]; }, t + (think / 8) * s);
        later(() => {
          val.classList.remove('c-spin');
          val.textContent = text;
        }, t + think);
        t += think + 140;
      });
    }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      play();
      io.disconnect();
    }, { threshold: 0.45 });
    io.observe(body);
    $('.console__replay')?.addEventListener('click', play);
  }

  /* ------------------------------------------- interactive platform map */
  function initArch() {
    const arch = $('#arch');
    if (!arch) return;
    const svg = $('.arch__wires', arch);
    const info = $('.arch__info', arch);
    const defaultInfo = info ? info.innerHTML : '';
    const EDGES = [
      ['copilot', 'mcp'], ['claude', 'mcp'], ['cursor', 'mcp'], ['workbench', 'mcp'],
      ['workbench', 'llm'],
      ['sdlc', 'copilot'], ['sdlc', 'claude'], ['sdlc', 'cursor'], ['sdlc', 'codex'], ['sdlc', 'windsurf'],
      ['mcp', 'ado'], ['mcp', 'jira'], ['mcp', 'k8s'], ['mcp', 'sonar'], ['mcp', 'checkmarx'], ['mcp', 'figma'],
      ['llm', 'aoai'], ['llm', 'foundry'], ['rag', 'pgvector'],
    ];
    const nodes = new Map($$('[data-node]', arch).map((n) => [n.dataset.node, n]));
    const adjacency = new Map();
    EDGES.forEach(([a, b]) => {
      if (!adjacency.has(a)) adjacency.set(a, new Set());
      if (!adjacency.has(b)) adjacency.set(b, new Set());
      adjacency.get(a).add(b);
      adjacency.get(b).add(a);
    });
    let active = null;
    let lastPointer = 'mouse';

    const rel = (el, base) => {
      const r = el.getBoundingClientRect();
      return {
        l: r.left - base.left, r: r.right - base.left, t: r.top - base.top, b: r.bottom - base.top,
        cx: r.left - base.left + r.width / 2, cy: r.top - base.top + r.height / 2,
      };
    };
    const f = (n) => n.toFixed(1);

    function build() {
      if (!svg) return;
      const base = arch.getBoundingClientRect();
      if (!base.width) return;
      svg.setAttribute('viewBox', `0 0 ${f(base.width)} ${f(base.height)}`);
      svg.replaceChildren();
      const stacked = getComputedStyle(arch).gridTemplateColumns.trim().split(/\s+/).length < 2;
      const motion = !reducedMotion();
      EDGES.forEach(([from, to], i) => {
        const A = nodes.get(from);
        const B = nodes.get(to);
        if (!A || !B || !A.offsetParent || !B.offsetParent) return;
        const a = rel(A, base);
        const b = rel(B, base);
        let d;
        if (!stacked) {
          const ltr = b.cx > a.cx;
          const x1 = ltr ? a.r : a.l;
          const x2 = ltr ? b.l : b.r;
          const dx = (x2 - x1) * 0.5;
          d = `M${f(x1)} ${f(a.cy)} C${f(x1 + dx)} ${f(a.cy)} ${f(x2 - dx)} ${f(b.cy)} ${f(x2)} ${f(b.cy)}`;
        } else {
          const down = b.cy > a.cy;
          const y1 = down ? a.b : a.t;
          const y2 = down ? b.t : b.b;
          const dy = (y2 - y1) * 0.5;
          d = `M${f(a.cx)} ${f(y1)} C${f(a.cx)} ${f(y1 + dy)} ${f(b.cx)} ${f(y2 - dy)} ${f(b.cx)} ${f(y2)}`;
        }
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('id', `wire-${i}`);
        path.setAttribute('class', 'wire');
        path.setAttribute('d', d);
        path.dataset.from = from;
        path.dataset.to = to;
        svg.append(path);
        if (!motion) return;
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', from === 'sdlc' ? 'packet packet--rev' : 'packet');
        g.dataset.from = from;
        g.dataset.to = to;
        const halo = document.createElementNS(SVG_NS, 'circle');
        halo.setAttribute('class', 'packet__halo');
        halo.setAttribute('r', '6');
        const core = document.createElementNS(SVG_NS, 'circle');
        core.setAttribute('class', 'packet__core');
        core.setAttribute('r', '2.4');
        const anim = document.createElementNS(SVG_NS, 'animateMotion');
        const dur = 2.4 + Math.random() * 1.8;
        anim.setAttribute('dur', `${dur.toFixed(2)}s`);
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('begin', `-${(Math.random() * dur).toFixed(2)}s`);
        const mpath = document.createElementNS(SVG_NS, 'mpath');
        mpath.setAttribute('href', `#wire-${i}`);
        mpath.setAttributeNS(XLINK_NS, 'xlink:href', `#wire-${i}`);
        anim.append(mpath);
        g.append(halo, core, anim);
        svg.append(g);
      });
      if (active) highlight(active);
    }

    function goToCap(capId) {
      const card = document.getElementById(capId);
      if (!card) return;
      card.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      card.classList.remove('is-flash');
      void card.offsetWidth;
      card.classList.add('is-flash');
    }

    function highlight(id) {
      active = id;
      const linked = id ? adjacency.get(id) || new Set() : new Set();
      arch.classList.toggle('is-focus', Boolean(id));
      nodes.forEach((el, key) => el.classList.toggle('is-hot', Boolean(id) && (key === id || linked.has(key))));
      svg?.querySelectorAll('.wire, .packet').forEach((el) => {
        el.classList.toggle('is-hot', Boolean(id) && (el.dataset.from === id || el.dataset.to === id));
      });
      const node = id ? nodes.get(id) : null;
      const capId = node?.dataset.cap;
      $$('.cap.is-linked').forEach((c) => c.classList.remove('is-linked'));
      if (capId) document.getElementById(capId)?.classList.add('is-linked');
      if (!info) return;
      if (!node) {
        info.innerHTML = defaultInfo;
        return;
      }
      const strong = document.createElement('strong');
      strong.textContent = node.dataset.title || node.textContent.trim();
      const desc = document.createElement('span');
      desc.textContent = node.dataset.desc || '';
      info.replaceChildren(strong, desc);
      if (capId) {
        const link = document.createElement('a');
        link.href = `#${capId}`;
        link.innerHTML = 'Details <svg class="icon" aria-hidden="true"><use href="#i-arrow-down"/></svg>';
        link.addEventListener('click', (e) => { e.preventDefault(); goToCap(capId); });
        info.append(link);
      }
    }

    arch.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType || 'mouse'; });
    document.addEventListener('pointerdown', (e) => {
      if (active && e.target instanceof Node && !arch.contains(e.target)) highlight(null);
    });
    nodes.forEach((el, id) => {
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') highlight(id); });
      el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') highlight(null); });
      el.addEventListener('focus', () => highlight(id));
      el.addEventListener('blur', () => { if (lastPointer === 'mouse') highlight(null); });
      el.addEventListener('click', (e) => {
        const keyboard = e.detail === 0;
        if (!keyboard && lastPointer !== 'mouse') {
          highlight(id);
          return;
        }
        if (el.dataset.cap) goToCap(el.dataset.cap);
      });
    });
    $$('.cap').forEach((card) => {
      const nodeEl = $(`[data-cap="${card.id}"]`, arch);
      if (!nodeEl) return;
      card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') highlight(nodeEl.dataset.node); });
      card.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') highlight(null); });
    });

    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(build, 80);
    };
    new ResizeObserver(schedule).observe(arch);
    document.fonts?.ready.then(schedule);
    build();
  }

  /* ------------------------------------------------- case-study visuals */
  function addMotion(target, pathId, { dur, reverse = false, cls = '' }) {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('r', '3');
    if (cls) c.setAttribute('class', cls);
    const anim = document.createElementNS(SVG_NS, 'animateMotion');
    anim.setAttribute('dur', `${dur.toFixed(2)}s`);
    anim.setAttribute('repeatCount', 'indefinite');
    anim.setAttribute('begin', `-${(Math.random() * dur).toFixed(2)}s`);
    if (reverse) {
      anim.setAttribute('keyPoints', '1;0');
      anim.setAttribute('keyTimes', '0;1');
      anim.setAttribute('calcMode', 'linear');
    }
    const mpath = document.createElementNS(SVG_NS, 'mpath');
    mpath.setAttribute('href', `#${pathId}`);
    mpath.setAttributeNS(XLINK_NS, 'xlink:href', `#${pathId}`);
    anim.append(mpath);
    c.append(anim);
    target.append(c);
  }

  function initHub() {
    const layer = $('#hub .hub__pulses');
    if (!layer || reducedMotion()) return;
    for (let i = 0; i < 8; i++) {
      addMotion(layer, `sp${i}`, { dur: 1.8 + Math.random() * 1.4, reverse: i % 2 === 1, cls: i >= 5 ? 'ext' : '' });
    }
  }

  function initOrbit() {
    const svg = $('#orbit');
    if (!svg) return;
    const rings = [
      { r: 56, n: 24, dur: 70 },
      { r: 88, n: 40, dur: 95, rev: true },
      { r: 120, n: 56, dur: 120 },
      { r: 152, n: 72, dur: 150, rev: true },
    ];
    let markup = '<defs><radialGradient id="orbitCore" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#6d5cff"/><stop offset="1" stop-color="#1b1f3a"/></radialGradient></defs>';
    rings.forEach((ring) => {
      markup += `<circle class="orbit__track" cx="200" cy="200" r="${ring.r}"/>`;
      markup += `<g class="orbit__ring${ring.rev ? ' orbit__ring--rev' : ''}" style="--dur:${ring.dur}s">`;
      for (let i = 0; i < ring.n; i++) {
        const angle = (i / ring.n) * Math.PI * 2 + ring.r;
        const x = 200 + Math.cos(angle) * ring.r;
        const y = 200 + Math.sin(angle) * ring.r;
        const hot = Math.random() < 0.12;
        markup += hot
          ? `<circle class="orbit__dot orbit__dot--hot" cx="${f1(x)}" cy="${f1(y)}" r="2.6" style="--tw:${(Math.random() * 3).toFixed(2)}s"/>`
          : `<circle class="orbit__dot" cx="${f1(x)}" cy="${f1(y)}" r="1.9"/>`;
      }
      markup += '</g>';
    });
    markup += '<circle class="hub__core-glow" cx="200" cy="200" r="44"/><circle class="orbit__core" cx="200" cy="200" r="34"/><text class="orbit__core-text" x="200" y="205">UAE</text>';
    svg.innerHTML = markup;
  }
  const f1 = (n) => n.toFixed(1);

  function initDecor() {
    $$('.uptime').forEach((el) => {
      el.style.setProperty('--bars', '40');
      el.innerHTML = '<i></i>'.repeat(40);
    });
    $$('.cells i').forEach((cell, i) => cell.style.setProperty('--n', String((i * 7) % 16)));
  }

  /* --------------------------------------------------- career & details */
  function initDurations() {
    const now = new Date();
    $$('.role__duration').forEach((el) => {
      const [sy, sm] = (el.dataset.start || '').split('-').map(Number);
      let ey;
      let em;
      if (el.dataset.end === 'present') {
        ey = now.getFullYear();
        em = now.getMonth() + 1;
      } else {
        [ey, em] = (el.dataset.end || '').split('-').map(Number);
      }
      const months = (ey - sy) * 12 + (em - sm) + 1;
      if (!Number.isFinite(months) || months <= 0) return;
      const years = Math.floor(months / 12);
      const rest = months % 12;
      const parts = [];
      if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
      if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
      el.textContent = parts.join(' ');
    });
  }

  function initSkillSearch() {
    const input = $('#skillSearch');
    const grid = $('#skillsGrid');
    const out = $('.skills-search__count');
    if (!input || !grid) return;
    const chips = $$('.chips li', grid);
    const cards = $$('.skill-card', grid);
    const run = () => {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const filtering = terms.length > 0;
      grid.classList.toggle('is-filtering', filtering);
      let count = 0;
      chips.forEach((chip) => {
        const text = chip.textContent.toLowerCase();
        const hit = filtering && terms.every((t) => text.includes(t));
        chip.classList.toggle('is-match', hit);
        if (hit) count++;
      });
      cards.forEach((card) => card.classList.toggle('has-match', filtering && Boolean(card.querySelector('.is-match'))));
      if (out) out.textContent = filtering ? `${count} match${count === 1 ? '' : 'es'}` : '';
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) {
        e.stopPropagation();
        input.value = '';
        run();
      }
    });
  }

  function initCopy() {
    $$('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await copyText(btn.dataset.copy);
        toast('Email copied to clipboard');
        const use = btn.querySelector('use');
        if (!use) return;
        use.setAttribute('href', '#i-check');
        setTimeout(() => use.setAttribute('href', '#i-copy'), 1800);
      });
    });
  }

  function initClock() {
    const el = $('#localTime');
    if (!el || !window.Intl) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    } catch {
      return;
    }
    const tick = () => {
      const now = new Date();
      el.textContent = `${fmt.format(now)} GST (UTC+4)`;
      el.dateTime = now.toISOString();
    };
    tick();
    setInterval(tick, 30000);
  }

  function initStatics() {
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
    $$('[data-kbd]').forEach((k) => { k.textContent = isMac ? '⌘K' : 'Ctrl K'; });
  }

  /* ------------------------------------------------------ command palette */
  function initCommandPalette() {
    const dialog = $('#cmdk');
    const input = $('#cmdkInput');
    const list = $('#cmdkList');
    if (!dialog || !input || !list) return;

    const goTo = (hash) => () => {
      const target = document.querySelector(hash);
      if (!target) return;
      target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', hash);
    };
    const openUrl = (url) => () => window.open(url, '_blank', 'noopener');
    const commands = [
      { group: 'Navigate', label: 'Profile', icon: 'i-users', hint: '01', keywords: 'about summary bio', run: goTo('#about') },
      { group: 'Navigate', label: 'Impact', icon: 'i-trending', hint: '02', keywords: 'achievements results roi outcomes', run: goTo('#impact') },
      { group: 'Navigate', label: 'Enterprise AI platform', icon: 'i-cpu', hint: '03', keywords: 'mcp llm rag gateway agents sdlc genai agentic', run: goTo('#platform') },
      { group: 'Navigate', label: 'Case studies', icon: 'i-layers', hint: '04', keywords: 'customs port emirates post work projects', run: goTo('#work') },
      { group: 'Navigate', label: 'Career timeline', icon: 'i-briefcase', hint: '05', keywords: 'experience jobs roles history ad ports', run: goTo('#experience') },
      { group: 'Navigate', label: 'Skills', icon: 'i-sparkles', hint: '06', keywords: 'stack technologies tools languages', run: goTo('#skills') },
      { group: 'Navigate', label: 'Credentials', icon: 'i-award', hint: '07', keywords: 'certifications azure togaf education award languages', run: goTo('#credentials') },
      { group: 'Navigate', label: 'Contact', icon: 'i-mail', hint: '08', keywords: 'email phone hire reach', run: goTo('#contact') },
      {
        group: 'Actions', label: 'Download résumé (PDF)', icon: 'i-download', keywords: 'cv resume pdf download',
        run: () => {
          const a = document.createElement('a');
          a.href = '/Linoy_Pappachan_Malakkaran_Resume.pdf';
          a.download = '';
          document.body.append(a);
          a.click();
          a.remove();
        },
      },
      { group: 'Actions', label: 'Copy email address', icon: 'i-copy', hint: EMAIL, keywords: 'mail clipboard', run: async () => { await copyText(EMAIL); toast('Email copied to clipboard'); } },
      { group: 'Actions', label: 'Send an email', icon: 'i-mail', keywords: 'contact write', run: () => { location.href = `mailto:${EMAIL}`; } },
      { group: 'Actions', label: 'Call +971 56 592 1499', icon: 'i-phone', keywords: 'phone mobile call', run: () => { location.href = 'tel:+971565921499'; } },
      { group: 'Actions', label: 'Book a call on Calendly', icon: 'i-calendar', keywords: 'meeting schedule calendly', run: openUrl('https://calendly.com/linoymalakkaran') },
      { group: 'Actions', label: 'Open LinkedIn', icon: 'i-linkedin', keywords: 'social profile linkedin', run: openUrl('https://www.linkedin.com/in/linoymalakkaran/') },
      { group: 'Actions', label: 'Open GitHub', icon: 'i-github', keywords: 'code repositories github', run: openUrl('https://github.com/linoymalakkaran') },
      { group: 'Preferences', label: 'Toggle light / dark theme', icon: 'i-sun', keywords: 'mode appearance theme', run: () => toggleTheme() },
      { group: 'Preferences', label: 'Match system theme', icon: 'i-moon', keywords: 'mode appearance theme auto os device default', run: () => useSystemTheme() },
      { group: 'Preferences', label: 'Print this page', icon: 'i-printer', keywords: 'print paper', run: () => window.print() },
    ];

    let filtered = commands;
    let selected = 0;
    let lastFocus = null;

    function updateSelection() {
      const items = $$('.cmdk__item', list);
      items.forEach((li, i) => li.setAttribute('aria-selected', String(i === selected)));
      const current = items[selected];
      if (current) {
        input.setAttribute('aria-activedescendant', current.id);
        current.scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function render() {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      filtered = commands.filter((c) => {
        const hay = `${c.label} ${c.keywords || ''} ${c.group}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
      list.replaceChildren();
      if (!filtered.length) {
        const empty = document.createElement('li');
        empty.className = 'cmdk__empty';
        empty.textContent = 'No matches — try “platform”, “résumé” or “email”.';
        list.append(empty);
        updateSelection();
        return;
      }
      selected = clamp(selected, 0, filtered.length - 1);
      let group = '';
      filtered.forEach((cmd, i) => {
        if (cmd.group !== group) {
          group = cmd.group;
          const heading = document.createElement('li');
          heading.className = 'cmdk__group';
          heading.setAttribute('role', 'presentation');
          heading.textContent = group;
          list.append(heading);
        }
        const li = document.createElement('li');
        li.className = 'cmdk__item';
        li.id = `cmdk-opt-${i}`;
        li.setAttribute('role', 'option');
        li.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${cmd.icon}"/></svg>`;
        const label = document.createElement('span');
        label.textContent = cmd.label;
        li.append(label);
        if (cmd.hint) {
          const hint = document.createElement('span');
          hint.className = 'cmdk__hint';
          hint.textContent = cmd.hint;
          li.append(hint);
        }
        li.addEventListener('pointermove', () => {
          if (selected === i) return;
          selected = i;
          updateSelection();
        });
        li.addEventListener('click', () => execute(i));
        list.append(li);
      });
      updateSelection();
    }

    function openPalette() {
      if (!dialog.hidden) return;
      lastFocus = document.activeElement;
      dialog.hidden = false;
      document.body.classList.add('cmdk-open');
      input.value = '';
      selected = 0;
      render();
      input.focus({ preventScroll: true });
    }

    function closePalette() {
      if (dialog.hidden) return;
      dialog.hidden = true;
      document.body.classList.remove('cmdk-open');
      if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
    }

    function execute(i) {
      const cmd = filtered[i];
      if (!cmd) return;
      closePalette();
      setTimeout(() => cmd.run(), 10);
    }

    input.addEventListener('input', () => {
      selected = 0;
      render();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }
      if (!filtered.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selected = (selected + 1) % filtered.length;
        updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selected = (selected - 1 + filtered.length) % filtered.length;
        updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(selected);
      }
    });
    dialog.addEventListener('click', (e) => { if (e.target instanceof Element && e.target.closest('[data-cmdk-close]')) closePalette(); });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });
    $$('[data-cmdk-open]').forEach((btn) => btn.addEventListener('click', openPalette));
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.hidden) openPalette(); else closePalette();
      } else if (e.key === '/' && !typing && dialog.hidden && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openPalette();
      }
    });
  }

  /* ----------------------------------------------------------------- boot */
  [
    initStatics, initDurations, initDecor, initReveal, initScrollSpy, initMobileMenu,
    initScramble, initMesh, initTilt, initMagnetic, initSpotlight, initConsole,
    initArch, initHub, initOrbit, initSkillSearch, initCopy, initClock, initCommandPalette,
  ].forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`[site] ${init.name} failed`, err);
    }
  });
  markLoaded();
  onScroll();
})();
