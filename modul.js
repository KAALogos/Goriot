/* Moduły opracowania (zakładki). Dane: opracowanie.js (window.OPRAC); cytaty: window.GORIOT z atlas.js. */
(() => {
  'use strict';
  const O = window.OPRAC, Gx = window.GORIOT;
  if (!O || !Gx) return;
  const btn = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.onclick = fn; return b; };
  const SRC = new Map(O.sources.map(s => [s.id, s]));
  const CH = new Map(O.characters.map(c => [c.id, c]));
  const TH = new Map(O.theses.map(t => [t.id, t]));
  const TYP = { fakt: 'fakt', interpretacja: 'interpretacja', kontekst: 'kontekst' };
  const STATUS = {
    'tekst': ['zweryfikowano w tekście', 'ok'],
    'źródło': ['źródło odczytane', 'ok'],
    'źródło-fragment': ['odczytano część źródła', 'part'],
    'autorska': ['interpretacja autorska, bez źródła naukowego', 'own']
  };
  const srcShort = s => {
    const m = { 'S-BORT': 'Bortnowska 1881', 'S-BOY': 'Boy-Żeleński 1938', 'S-BOY-BALZAK': 'Boy-Żeleński, Balzak (1934), rozdz. 8', 'S-HZ2019': 'Hanotte-Zawiślak 2019', 'S-HZ2018': 'Hanotte-Zawiślak 2018', 'S-VINC': 'Vinciguerra 1970', 'S-PAISSE': 'Paisse 1968' };
    return m[s] || (SRC.get(s) || {}).title || s;
  };

  /* odsyłacz do cytatu: przycisk rozwija cytat w bieżącym przekładzie */
  function refList(refs) {
    const ids = (refs || []).filter(r => /^[GP]\d\d$/.test(r));
    if (!ids.length) return null;
    const wrap = el('div', 'refs'), chips = el('div', 'qchips'), slot = el('div');
    for (const id of ids) {
      const c = Gx.chip(id, () => {
        const openBox = slot.querySelector(`.qbox[data-q="${id}"]`);
        chips.querySelectorAll('.qchip').forEach(x => x.setAttribute('aria-expanded', 'false'));
        slot.replaceChildren();
        if (openBox) return;
        const h = el('p', 'qtitle', Gx.item(id).title);
        slot.append(h, Gx.quoteBox(id)); c.setAttribute('aria-expanded', 'true');
      });
      c.setAttribute('aria-expanded', 'false');
      chips.append(c);
    }
    wrap.append(chips, slot);
    return wrap;
  }
  function sourceLine(s) {
    if (!s) return null;
    const p = el('p', 'srcline');
    p.append(el('span', 'k', 'Źródło: '), document.createTextNode(`${srcShort(s.id)}, ${s.loc}`));
    if (s.quote) { const q = el('q', 'crit', s.quote); p.append(document.createTextNode(' — '), q); }
    return p;
  }
  function thesis(t, opts = {}) {
    const a = el('article', 'thesis'), head = el('div', 'thead');
    if (!opts.noTags) a.id = 'teza-' + t.id;
    const st = STATUS[t.status];
    head.append(el('span', 'tid', t.id), el('span', 'typ typ-' + t.typ, TYP[t.typ]), el('span', 'st st-' + st[1], st[0]));
    a.append(head, el('p', 'ttext', t.text));
    if (t.note) a.append(el('p', 'tnote', t.note));
    const s = sourceLine(t.source); if (s) a.append(s);
    const r = refList(t.refs); if (r) a.append(r);
    const tags = el('div', 'tags');
    for (const c of t.chars || []) tags.append(btn('', CH.get(c).name, () => { tab('bohaterowie'); focusChar(c); }));
    for (const [ar, row] of t.rows || []) tags.append(btn('', `${pad(ar)} · ${D.areas.find(x => x.id === ar).rows[row][0]}`, () => Gx.goRow(ar, row, null)));
    for (const [x, y] of t.links || []) tags.append(btn('', `${A.get(x).short} ↔ ${A.get(y).short}`, () => { tab('atlas'); select(x); $('map').scrollIntoView(); }));
    for (const ref of (t.refs || []).filter(x => TH.has(x))) tags.append(btn('', 'zob. ' + ref, () => showThesis(ref)));
    if (tags.children.length && !opts.noTags) a.append(tags);
    return a;
  }
  function showThesis(id) {
    tab(TH.get(id).mod);
    const n = document.getElementById('teza-' + id);
    if (n) { n.scrollIntoView({ behavior: 'instant', block: 'start' }); n.classList.add('flash'); setTimeout(() => n.classList.remove('flash'), 2000); }
  }
  const section = (title, sub, ...kids) => { const s = el('section', 'msec'), h = el('div', 'sectionhead'), d = el('div'); d.append(el('h2', '', title)); if (sub) d.append(el('p', '', sub)); h.append(d); s.append(h, ...kids.filter(Boolean)); return s; };
  const theses = mod => { const w = el('div', 'tlist'); O.theses.filter(t => t.mod === mod).forEach(t => w.append(thesis(t))); return w; };
  const areaButtons = ids => { const w = el('div', 'tags'); ids.forEach(a => w.append(btn('', `${pad(a)} · ${A.get(a).title}`, () => { tab('atlas'); jump(a); }))); return w; };

  /* ---------- moduły ---------- */
  const M = {};
  M.kontekst = () => {
    const tl = el('div', 'timelines');
    for (const [k, title] of [['world', 'Chronologia świata przedstawionego'], ['publication', 'Chronologia powstania i przekładów']]) {
      const col = el('div', 'tline'), ol = el('ol');
      col.append(el('h3', '', title));
      for (const e of O.timeline[k]) {
        const li = el('li'); li.append(el('strong', '', e.date), el('span', '', e.text));
        if (e.ref) { const r = refList([e.ref]); r && li.append(r); }
        if (e.source) li.append(el('span', 'srcline', `Źródło: ${srcShort(e.source.id)}, ${e.source.loc}`));
        ol.append(li);
      }
      col.append(ol); tl.append(col);
    }
    return [section('Kontekst historycznoliteracki', 'Restauracja, powstanie powieści, „Komedia ludzka” i powracające postacie.', tl), section('Tezy', null, theses('kontekst'))];
  };
  function pension() {
    const P = O.pension, wrap = el('div', 'pens'), house = el('div', 'house'), side = el('aside', 'pdetail');
    side.setAttribute('aria-live', 'polite');
    house.append(el('div', 'roof'));
    const buttons = [];
    function show(r, f, b) {
      buttons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const m = P.rooms[r.id];
      const head = el('div', 'mhead');
      head.append(el('span', 'eyebrow', f.name), el('h3', '', r.name)); if (f.note) head.append(el('p', 'pnote', f.note)); head.append(el('p', 'msynth', m.synth));
      const kids = [head, plan(m.plan, r.name)];
      const block = (title, id) => { const s = el('section', 'mblock'); s.append(el('h4', '', title)); if (id) s.append(el('p', 'qtitle', Gx.item(id).title), Gx.quoteBox(id)); return s; };
      if (m.char) kids.push(block(r.id === 'couture' ? 'Postać w tekście: Wiktoryna i pani Couture' : 'Postać w tekście', m.char));
      if (m.desc) kids.push(block('Pomieszczenie w tekście', m.desc));
      else { const s = block('Pomieszczenie w tekście'); s.append(el('p', 'nodesc', m.nodesc)); kids.push(s); }
      for (const id of m.extra || []) kids.push(block('Zob. też', id));
      if (r.char) kids.push(btn('read', 'Karta postaci →', () => { tab('bohaterowie'); focusChar(r.char); }));
      side.replaceChildren(...kids);
    }
    /* rzut z góry: SVG z elementów planu; „t” = przedmiot wymieniony w tekście, „r” = rekonstrukcja */
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (tag, at) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); return n; };
    let planId = 0;
    /* materiały: [wypełnienie główne, detal]; nazwy bez # to wzory z DEFS */
    const MAT = {
      default: ['#efe4cf', '#f8f1e3'], rosewood: ['#8b4a3c', '#a35b4a'], walnut: ['#6f4b34', '#86603f'], wood: ['#a77b52', '#bb8f63'],
      'check-red': ['check'], wicker: ['wicker', '#d9bb84'], 'poor-linen': ['#d8ccb6', '#eee6d6'], 'wood-jug': ['#a07a52', '#f4f1ea'],
      'cold-stone': ['#cfc6b8', '#8f877c'], leather: ['#4a3428', '#5d4436'], marble: ['marble', '#ffffff'], horsehair: ['horsehair', 'horsehair'],
      'marble-fire': ['#bdb8b2', '#8f8a84'], oilcloth: ['#a89470', '#bba886'], green: ['#5f8a5a', '#78a170'], straw: ['straw'],
      plush: ['#a5737a', '#b98a90'], paper: ['#fffdf8'], 'wax-wood': ['#b88a55', '#c99c66']
    };
    const DEFS = `<defs>
      <filter id="shadow-UID" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale=".28" result="d"/><feDropShadow in="d" dx=".7" dy=".9" stdDeviation=".55" flood-color="#3b2a1a" flood-opacity=".38"/></filter>
      <pattern id="fl-boards-UID" width="40" height="5" patternUnits="userSpaceOnUse"><rect width="40" height="5" fill="#d8b98a"/><path d="M0 4.8H40M12 0V4.8M31 0V4.8" stroke="#b99062" stroke-width=".35"/><path d="M2 1.6H9M17 3H27M33 1.4H38" stroke="#caa678" stroke-width=".25"/></pattern>
      <pattern id="fl-dusty-UID" width="40" height="5" patternUnits="userSpaceOnUse"><rect width="40" height="5" fill="#b9ab94"/><path d="M0 4.8H40M14 0V4.8M33 0V4.8" stroke="#958670" stroke-width=".35"/><circle cx="6" cy="2" r=".35" fill="#8a7d6a"/><circle cx="24" cy="3.2" r=".3" fill="#8a7d6a"/><circle cx="36" cy="1.2" r=".25" fill="#a1937e"/></pattern>
      <pattern id="fl-red-UID" width="40" height="5" patternUnits="userSpaceOnUse"><rect width="40" height="5" fill="#b0553f"/><path d="M0 4.8H40M10 0V4.8M29 0V4.8" stroke="#8f3f2e" stroke-width=".35"/><ellipse cx="20" cy="2.4" rx="3" ry=".8" fill="#9c4a37" opacity=".7"/></pattern>
      <pattern id="fl-stone-UID" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#cfc7b8"/><path d="M0 11.8H12M11.8 0V12" stroke="#a89f90" stroke-width=".4"/></pattern>
      <pattern id="fl-attic-UID" width="50" height="7" patternUnits="userSpaceOnUse"><rect width="50" height="7" fill="#c9a97c"/><path d="M0 6.8H50M20 0V6.8" stroke="#a9875b" stroke-width=".4"/></pattern>
      <pattern id="grain-UID" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="2" r=".18" fill="#5b4630" opacity=".25"/><circle cx="6.2" cy="6.8" r=".14" fill="#5b4630" opacity=".2"/><circle cx="4" cy="4.4" r=".1" fill="#fff" opacity=".4"/></pattern>
      <pattern id="w-wood-UID" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#7a5537"/><path d="M0 1.5H3" stroke="#946a47" stroke-width=".5"/></pattern>
      <pattern id="w-paper-UID" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#9fb59e"/><circle cx="2" cy="2" r=".7" fill="#d8c48e"/></pattern>
      <pattern id="w-peel-UID" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#bdb29c"/><path d="M1 1l1.5 1.2M4 4l1 .8" stroke="#8e826d" stroke-width=".4"/></pattern>
      <pattern id="check-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#fff"/><rect width="1" height="1" fill="#b23a3a"/><rect x="1" y="1" width="1" height="1" fill="#b23a3a"/></pattern>
      <pattern id="horsehair-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#2f2b28"/><rect width=".9" height="2" fill="#57514b"/></pattern>
      <pattern id="marble-UID" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#e9e5dd"/><path d="M0 7C3 5 5 8 10 4M2 0C3 3 6 2 7 5" stroke="#b9b2a6" stroke-width=".3" fill="none"/></pattern>
      <pattern id="wicker-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#c9a36a"/><path d="M0 0L2 2M2 0L0 2" stroke="#a9834e" stroke-width=".3"/></pattern>
      <pattern id="straw-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#d9c27a"/><path d="M0 1H2" stroke="#b9a05a" stroke-width=".35"/></pattern>
    </defs>`;
    function plan(p, name) {
      const fig = el('figure', 'plan'), W = p.w, H = p.h, pad = 7;
      const svg = sv('svg', { viewBox: `${-pad} ${-pad} ${W + 2 * pad} ${H + 2 * pad}`, role: 'img', 'aria-label': `Rzut z góry: ${name}` });
      const uid = 'p' + (++planId), U = id => `url(#${id}-${uid})`;
      svg.insertAdjacentHTML('afterbegin', DEFS.replace(/-UID/g, '-' + uid));
      const gt = sv('g', { filter: U('shadow') }), gr = sv('g', { class: 'grec' }), go = sv('g', {}), marks = sv('g', {});
      const fl = p.floor || { type: 'boards', src: 'r' };
      svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: U('fl-' + fl.type) }));
      if (fl.src === 'r') svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: '#fbf7ef', opacity: .45 }));
      if (p.walls) svg.append(sv('rect', { x: 1.6, y: 1.6, width: W - 3.2, height: H - 3.2, fill: 'none', 'stroke-width': 2.4, stroke: U(p.walls === 'wood' ? 'w-wood' : p.walls === 'paper' ? 'w-paper' : 'w-peel') }));
      svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: U('grain'), opacity: .5 }));
      const legend = [];
      let n = 0;
      const cls = it => it.src === 't' ? 'pt' : 'pr';
      for (const it of p.items) {
        const c = cls(it), x = it.x, y = it.y, w = it.w || 0, h = it.h || 0;
        const g = ['window', 'glassdoor', 'door', 'wall', 'paper', 'label'].includes(it.k) ? go : it.src === 't' ? gt : gr;
        const before = g.childNodes.length;
        const R = (a) => g.append(sv('rect', Object.assign({ class: c }, a)));
        switch (it.k) {
          case 'bed': R({ x, y, width: w, height: h, rx: 1 }); g.append(sv('rect', { x: x + 2, y: y + 2, width: w - 4, height: Math.min(7, h / 4), rx: 1.5, class: c })); break;
          case 'rtable': g.append(sv('ellipse', { cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2, class: c })); break;
          case 'table': case 'desk': case 'nightstand': case 'commode': case 'box': R({ x, y, width: w, height: h }); if (it.k === 'commode') g.append(sv('line', { x1: x, y1: y + h / 2, x2: x + w, y2: y + h / 2, class: c })); break;
          case 'chair': R({ x, y, width: w, height: h, rx: .8 }); g.append(sv('line', { x1: x, y1: y + 1.2, x2: x + w, y2: y + 1.2, class: c + ' thick' })); break;
          case 'armchair': R({ x, y, width: w, height: h, rx: 2.5 }); g.append(sv('rect', { x: x + 2, y: y + 2, width: w - 4, height: h - 4, rx: 1.5, class: c })); break;
          case 'stool': g.append(sv('circle', { cx: x + w / 2, cy: y + h / 2, r: w / 2, class: c })); g.append(sv('circle', { cx: x + w / 2, cy: y + h / 2, r: w / 4, class: c })); break;
          case 'shoes': g.append(sv('ellipse', { cx: x + w * .3, cy: y + h / 2, rx: w * .2, ry: h / 2, class: c })); g.append(sv('ellipse', { cx: x + w * .72, cy: y + h / 2, rx: w * .2, ry: h / 2, class: c })); break;
          case 'fireplace': R({ x, y, width: w, height: h }); g.append(sv('rect', { x: x + 2, y: y + 4, width: w - 4, height: h - 8, class: c + ' hearth' })); break;
          case 'stove': R({ x, y, width: w, height: h, rx: 2 }); g.append(sv('circle', { cx: x + w / 2, cy: y + h / 2, r: Math.min(w, h) / 4, class: c })); break;
          case 'shelf': R({ x, y, width: w, height: h, class: c + ' hatch' }); break;
          case 'stairs': R({ x, y, width: w, height: h }); for (let s = y + 4; s < y + h; s += 4) g.append(sv('line', { x1: x, y1: s, x2: x + w, y2: s, class: c })); break;
          case 'mat': R({ x, y, width: w, height: h, class: c + ' dots' }); break;
          case 'mess': for (let i = 0; i < 6; i++) g.append(sv('rect', { x: x + (i * 4.3) % w, y: y + (i % 3) * 3, width: 5, height: 3.4, transform: `rotate(${(i * 37) % 50 - 25} ${x + (i * 4.3) % w} ${y})`, class: c })); break;
          case 'curtain': g.append(sv('line', { x1: x, y1: y, x2: x + w, y2: y, class: c + ' curtain' })); break;
          case 'line': g.append(sv('line', { x1: x, y1: y, x2: x + w, y2: y, class: c + ' cord' })); break;
          case 'picture': if (it.h) g.append(sv('line', { x1: x, y1: y, x2: x, y2: y + it.h, class: c + ' thick' })); else g.append(sv('line', { x1: x, y1: y, x2: x + w, y2: y, class: c + ' thick' })); break;
          case 'lamp': g.append(sv('circle', { cx: x, cy: y, r: 2.4, class: c })); g.append(sv('path', { d: `M${x - 2.4} ${y}H${x + 2.4}M${x} ${y - 2.4}V${y + 2.4}`, class: c })); break;
          case 'clock': g.append(sv('circle', { cx: x, cy: y, r: 2.6, class: c })); g.append(sv('path', { d: `M${x} ${y}V${y - 1.8}M${x} ${y}H${x + 1.4}`, class: c })); break;
          case 'wall': g.append(sv('line', { x1: x, y1: y, x2: x, y2: y + (it.h || H), class: 'pwall inner ' + c })); break;
          case 'window': case 'glassdoor': {
            const vert = it.vertical, wy = y;
            g.append(sv('rect', { x: vert ? x - 1.4 : x, y: vert ? wy : wy - 1.4, width: vert ? 2.8 : w, height: vert ? w : 2.8, class: 'gap' }));
            g.append(sv('path', { d: vert ? `M${x - .7} ${wy}v${w}M${x + .7} ${wy}v${w}` : `M${x} ${wy - .7}h${w}M${x} ${wy + .7}h${w}`, class: c + (it.k === 'glassdoor' ? ' glass' : ' win') }));
            break; }
          case 'door': {
            const vert = it.vertical, s = w;
            if (vert) { const inward = x === 0 ? 1 : -1; g.append(sv('rect', { x: x - 1.4, y, width: 2.8, height: s, class: 'gap' })); g.append(sv('path', { d: `M${x} ${y}l${inward * s} 0A${s} ${s} 0 0 ${inward > 0 ? 1 : 0} ${x} ${y + s}`, class: c + ' door' })); }
            else { const inward = y === 0 ? 1 : -1; g.append(sv('rect', { x, y: y - 1.4, width: s, height: 2.8, class: 'gap' })); g.append(sv('path', { d: `M${x} ${y}l0 ${inward * s}A${s} ${s} 0 0 ${inward > 0 ? 0 : 1} ${x + s} ${y}`, class: c + ' door' })); }
            break; }
          case 'paper': break;
          case 'label': g.append(Object.assign(sv('text', { x, y, class: 'plabel', 'text-anchor': 'middle' }), { textContent: it.label })); break;
        }
        if (it.src === 't' && !['window', 'glassdoor', 'door', 'wall', 'paper', 'label', 'curtain', 'line', 'picture'].includes(it.k)) {
          const f = MAT[it.m] || MAT.default;
          [...g.childNodes].slice(before).forEach((n2, i) => { const fill = i === 0 ? f[0] : (f[1] || f[0]); n2.style.fill = fill.startsWith('#') ? fill : U(fill); });
        }
        if (it.src === 't' && it.m === 'curtain-yellow' && it.k === 'window') g.append(sv('rect', { x, y: y + 1.4, width: w, height: 2.2, fill: '#e2c25a' }));
        if (it.src === 't' && it.m === 'mural') [...g.childNodes].slice(before).forEach(n2 => { n2.style.stroke = '#5f8a73'; });
        if (it.label && it.k !== 'label') {
          n++;
          legend.push([n, it]);
          if (it.k !== 'paper') {
            let cx = x + (w || 0) / 2, cy = y + (h || 0) / 2;
            if (['window', 'glassdoor'].includes(it.k)) cy = it.vertical ? y + w / 2 : (y === 0 ? y + 4.6 : y - 4.6), cx = it.vertical ? (x === 0 ? 4.6 : x - 4.6) : x + w / 2;
            if (it.k === 'door') { if (it.vertical) { cx = x === 0 ? 4 : x - 4; cy = y + w / 2; } else { cx = x + w / 2; cy = y === 0 ? 4 : y - 4; } }
            if (it.k === 'curtain' || it.k === 'line' || (it.k === 'picture' && !it.h)) { cy = y + (y < 4 ? 3.6 : -3.6); if (it.k === 'curtain') { cx = x + w - 4; cy = y; } }
            if (it.k === 'picture' && it.h) cx = x + 3.6;
            if (it.k === 'wall') { cx = x; cy = 6; }
            const mk = sv('g', { class: 'mk ' + (it.src === 't' ? 'mt' : 'mr') });
            mk.append(sv('circle', { cx, cy, r: 2.9 }), Object.assign(sv('text', { x: cx, y: cy + 1.15, 'text-anchor': 'middle' }), { textContent: n }));
            marks.append(mk);
          }
        }
      }
      for (const [x1, y1, x2, y2] of [[0, 0, W, 0], [W, 0, W, H], [W, H, 0, H], [0, H, 0, 0]]) svg.append(sv('line', { x1, y1, x2, y2, class: 'pwall' }));
      svg.append(gr, gt, go, marks);
      const key = el('div', 'pkey'); key.append(el('span', 'kt', 'przedmiot wymieniony w tekście'), el('span', 'kr', 'rekonstrukcja umowna'));
      const ol = el('ol', 'plegend');
      for (const [i, it] of legend) {
        const li = el('li', it.src === 't' ? 'lt' : 'lr'); li.value = i;
        li.append(document.createTextNode(it.label));
        if (it.pos) li.append(el('span', 'lpos', ' · położenie: ' + it.pos));
        if (it.k === 'paper') li.append(el('span', 'lpos', ' · cechy ścian i podłogi'));
        ol.append(li);
      }
      if (fl.note) { const li = el('li', 'nonum'); li.append(document.createTextNode('Podłoga i ściany (z tekstu): ' + fl.note)); ol.append(li); }
      const cap = el('figcaption');
      cap.append(el('strong', '', 'Rzut z góry. '), document.createTextNode('Obecność przedmiotów oznaczonych linią ciągłą wynika z tekstu; ich rozmieszczenie jest umowne, chyba że podano położenie z tekstu. Elementy przerywane to rekonstrukcja.'));
      fig.append(svg, key, ol, cap);
      return fig;
    }
    let first = null;
    for (const f of P.floors) {
      const row = el('div', 'floor'), lab = el('div', 'flabel'), rooms = el('div', 'rooms');
      lab.append(el('strong', '', f.name)); if (f.note) lab.append(el('span', '', f.note));
      for (const r of f.rooms) {
        const b = btn('room' + (r.char ? ' person' : ''), '', () => { show(r, f, b); if (innerWidth < 1000) side.scrollIntoView({ block: 'start' }); });
        b.append(el('strong', '', r.name), el('span', '', r.who));
        b.setAttribute('aria-pressed', 'false'); buttons.push(b); rooms.append(b);
        if (r.name === 'Ojciec Goriot') first = [r, f, b];
      }
      row.append(lab, rooms); house.append(row);
    }
    const moves = el('div', 'moves');
    for (const m of P.moves) {
      const a = el('article', 'move'), ol = el('ol');
      a.append(el('h4', '', m.who));
      for (const s of m.steps) { const li = el('li'); li.append(el('span', '', s.text), Gx.chip(s.ref)); ol.append(li); }
      a.append(ol); moves.append(a);
    }
    wrap.append(house, side);
    show(...first);
    /* grafika robocza i jej weryfikacja */
    const fig = el('figure', 'draft'), img = el('img'), link = el('a', 'read', 'Otwórz w pełnym rozmiarze ↗');
    img.src = 'img/pensjonat-vauquer-roboczy.webp'; img.width = 1055; img.height = 1491; img.loading = 'lazy';
    img.alt = 'Grafika robocza: przekrój pensjonatu pani Vauquer z podpisanymi mieszkańcami pięter i panelem zmian miejsc.';
    link.href = img.src; link.target = '_blank'; link.rel = 'noopener';
    const cap = el('figcaption'); cap.append(el('strong', '', 'Grafika robocza. '), document.createTextNode('Przed użyciem z uczniami zob. weryfikację obok; schemat interaktywny powyżej uwzględnia poprawki. '), link);
    fig.append(img, cap);
    const tbl = el('div', 'checks');
    for (const c of P.checks) {
      const a = el('article', 'check v-' + c.verdict);
      const h = el('div', 'chead'); h.append(el('span', 'verdict', c.verdict), el('strong', '', c.claim)); a.append(h);
      if (c.comment) a.append(el('p', '', c.comment));
      const r = refList(c.refs); r && a.append(r);
      tbl.append(a);
    }
    const draft = el('div', 'draftgrid'); draft.append(fig, tbl);
    /* duże fragmenty */
    const longs = el('div', 'longs');
    for (const id of P.long) { const a = el('article', 'long'); a.id = 'dlugi-' + id; a.append(el('h3', '', Gx.item(id).title), Gx.quoteBox(id)); longs.append(a); }
    const s1 = section('Pensjonat pani Vauquer', 'Stan na początku akcji (1819). Wybierz pomieszczenie, aby zobaczyć, kto w nim mieszka i co mówi o tym tekst.', wrap);
    return [s1,
      section('Zmiany miejsc w toku powieści', null, moves),
      section('Grafika robocza i jej zgodność z tekstem', 'Każde twierdzenie grafiki porównano z oboma przekładami.', draft),
      section('Duże fragmenty tekstu', 'Pełne akapity w wybranym przekładzie; tryb „oba” zestawia je obok siebie.', longs)];
  }
  M.paryz = () => [
    ...pension(),
    section('Anatomia Paryża', 'Pensjonat, salony, finansjera, prowincja i pionowy układ przestrzeni jako wskaźnik pozycji.', theses('paryz')),
    section('Obyczaje związane z przestrzenią', 'Przykłady z katalogu obyczajów.', areaButtons([8, 1, 11, 12, 15]))
  ];
  let focusChar = () => { };
  M.bohaterowie = () => {
    const grid = el('div', 'chars'), relWrap = el('div'), filt = el('div', 'filterbar'), list = el('div', 'rels');
    let rtype = '', rchar = '';
    for (const c of O.characters) {
      const card = el('article', 'char'); card.id = 'postac-' + c.id;
      card.append(el('h3', '', c.name), el('p', '', c.role));
      const th = el('div', 'tags'); c.themes.forEach(x => th.append(el('span', 'tag', x))); card.append(th);
      const r = refList(c.refs); r && card.append(r);
      const ts = O.theses.filter(t => (t.chars || []).includes(c.id));
      if (ts.length) {
        const d = el('details', 'more'), s = el('summary', '', `Tezy o postaci (${ts.length})`);
        d.append(s); ts.forEach(t => d.append(thesis(t, { noTags: true }))); card.append(d);
      }
      const rb = btn('read', 'Relacje tej postaci ↓', () => { rchar = c.id; draw(); $('relacje').scrollIntoView({ block: 'start' }); });
      card.append(rb);
      grid.append(card);
    }
    const types = ['', 'pokrewieństwo', 'ekonomia', 'mentoring', 'erotyka', 'prestiż', 'przymus'];
    const fb = types.map(t => { const b = btn('filter', t || 'wszystkie', () => { rtype = t; draw(); }); b.dataset.t = t; return b; });
    filt.append(...fb);
    const who = el('p', 'count');
    function draw() {
      fb.forEach(b => { b.classList.toggle('on', b.dataset.t === rtype); b.setAttribute('aria-pressed', String(b.dataset.t === rtype)); });
      const rs = O.relations.filter(r => (!rtype || r.type === rtype) && (!rchar || r.from === rchar || r.to === rchar));
      who.replaceChildren(document.createTextNode(`${rs.length} z ${O.relations.length} relacji` + (rchar ? ` · postać: ${CH.get(rchar).name} ` : '')));
      if (rchar) who.append(btn('linkish', 'pokaż wszystkie', () => { rchar = ''; draw(); }));
      list.replaceChildren(...rs.map(r => {
        const a = el('article', 'rel'), h = el('div', 'rhead2');
        h.append(el('strong', '', CH.get(r.from).name), el('span', 'arrow', '→'), el('strong', '', CH.get(r.to).name), el('span', 'typ', r.type));
        a.append(h, el('p', '', r.label));
        const x = refList(r.refs); x && a.append(x);
        if (r.rows && r.rows.length) { const t = el('div', 'tags'); r.rows.forEach(([ar, row]) => t.append(btn('', `${pad(ar)} · ${D.areas.find(z => z.id === ar).rows[row][0]}`, () => Gx.goRow(ar, row, null)))); a.append(t); }
        return a;
      }));
    }
    focusChar = id => { const n = document.getElementById('postac-' + id); n && n.scrollIntoView({ block: 'start' }); };
    draw();
    relWrap.append(filt, who, list);
    const rs = section('Relacje kierunkowe', 'Strzałka wskazuje kierunek zależności. Opis relacji jest streszczeniem tekstu; interpretacje znajdują się w tezach.', relWrap); rs.id = 'relacje';
    return [section('Bohaterowie', 'Rola w fabule według tekstu, tezy z rozróżnieniem faktów i interpretacji.', grid), rs];
  };
  M.mechanizmy = () => {
    const mg = el('div', 'mechs');
    for (const m of O.mechanisms) {
      const a = el('article', 'mech'); a.append(el('h3', '', m.name), el('p', '', m.def), areaButtons(m.areas));
      const r = refList(m.refs); r && a.append(r); mg.append(a);
    }
    const ax = el('div', 'axes');
    for (const x of O.axes) {
      const a = el('article', 'axis'), ol = el('ol');
      a.append(el('h3', '', x.title));
      for (const s of x.steps) { const li = el('li'); li.append(el('span', '', s.text)); const r = refList([s.ref]); r && li.append(r); ol.append(li); }
      a.append(ol); ax.append(a);
    }
    return [section('Mechanizmy', 'Osiem mechanizmów, które łączą obyczaje z fabułą.', mg), section('Trzy osie i model uczciwego działania', 'Kolejne etapy z odsyłaczami do tekstu.', ax), section('Tezy', null, theses('mechanizmy'))];
  };
  M.poetyka = () => [section('Poetyka', 'Kompozycja, czas, narrator, portret i realizm.', theses('poetyka'))];
  M.sceny = () => {
    const w = el('div', 'scenes');
    for (const s of O.scenes) {
      const a = el('article', 'scene'); a.id = 'scena-' + s.id;
      a.append(el('h3', '', s.title), el('p', 'sfunc', s.function));
      const qs = el('div', 'squotes');
      s.refs.forEach(id => { qs.append(el('p', 'qtitle', Gx.item(id).title), Gx.quoteBox(id)); });
      a.append(qs);
      const d = el('details', 'more'); d.append(el('summary', '', `Interpretacje (${s.theses.length})`)); s.theses.forEach(id => d.append(thesis(TH.get(id), { noTags: true }))); a.append(d);
      const q = el('div', 'questions'); q.append(el('h4', '', 'Pytania')); const ol = el('ol'); s.questions.forEach(x => ol.append(el('li', '', x))); q.append(ol); a.append(q);
      w.append(a);
    }
    return [section('Sceny kluczowe', 'Fragment w wybranym przekładzie, funkcja w kompozycji, interpretacje i pytania.', w)];
  };
  M.konteksty = () => {
    const w = el('div', 'ctxs');
    for (const c of O.contexts) {
      const a = el('article', 'ctx'); a.append(el('h3', '', c.work), el('p', 'ctheme', c.theme));
      const dl = el('dl'); dl.append(el('dt', '', 'Wspólny problem'), el('dd', '', c.common), el('dt', '', 'Różnica'), el('dd', '', c.diff)); a.append(dl);
      const st = STATUS[c.status]; a.append(el('p', 'st st-' + st[1], st[0]));
      const s = sourceLine(c.source); s && a.append(s);
      const r = refList(c.refs); r && a.append(r);
      w.append(a);
    }
    return [section('Konteksty literackie', 'Porównanie pokazuje podobieństwo problemu. Nie jest dowodem wpływu jednego utworu na drugi.', w)];
  };
  M.czytanie = () => {
    const z = O.czz, art = el('article', 'czz'), s = SRC.get(z.source);
    art.append(el('p', 'srcline', `${s.title}. ${s.edition}, s. ${z.pages[0]}–${z.pages[1]}. Tekst w pisowni oryginału (domena publiczna).`));
    for (const p of z.paras) {
      const n = el('p'); let pos = 0;
      for (const [o, g] of p.brk) { n.append(p.text.slice(pos, o), el('span', 'pg', `[s. ${g}]`)); pos = o; }
      n.append(p.text.slice(pos)); art.append(n);
    }
    const q = el('div', 'questions'); q.append(el('h3', '', 'Pytania')); const ol = el('ol'); z.questions.forEach(x => ol.append(el('li', '', x))); q.append(ol);
    const k = el('details', 'more key'); k.append(el('summary', '', 'Klucz odpowiedzi')); const ko = el('ol'); z.key.forEach(x => ko.append(el('li', '', x))); k.append(ko);
    return [section('Czytanie ze zrozumieniem', `Tadeusz Boy-Żeleński o „Komedii ludzkiej” i epoce (s. ${z.pages[0]}–${z.pages[1]}).`, art), section('Zadania', null, q, k)];
  };
  M.ikonografia = () => {
    const K = window.IKONO, intro = el('div', 'ikintro');
    const q = el('div', 'ikquote');
    for (const id of K.intro.refs) q.append(el('p', 'qtitle', Gx.item(id).title), Gx.quoteBox(id));
    const hyp = el('aside', 'ikhyp'); hyp.append(el('h3', '', K.intro.hypothesis_title));
    const ul = el('ul'); K.intro.points.forEach(t => ul.append(el('li', '', t))); hyp.append(ul);
    intro.append(q, hyp);
    const out = [section('Tapeta z „Telemakiem”', K.intro.lead, intro)];
    for (const g of K.groups) {
      const items = K.items.filter(e => e.group === g.id);
      if (!items.length) continue;
      const grid = el('div', 'ikgrid' + (items.length > 1 ? ' multi' : ''));
      for (const e of items) {
        const f = el('figure', 'ikfig'), a = el('a'), pic = el('img');
        a.href = e.img.full.src; a.target = '_blank'; a.rel = 'noopener';
        a.setAttribute('aria-label', `${e.title} — otwórz w większym rozmiarze`);
        pic.src = e.img.web.src; pic.width = e.img.web.w; pic.height = e.img.web.h; pic.loading = 'lazy'; pic.decoding = 'async'; pic.alt = e.alt;
        a.append(pic);
        const cap = el('figcaption');
        cap.append(el('strong', 'iktitle', e.title), el('span', 'ikcap', e.caption));
        const meta = el('p', 'ikmeta');
        meta.append(document.createTextNode(e.credit + '. '));
        const src = el('a', '', 'Źródło'); src.href = e.source; src.target = '_blank'; src.rel = 'noopener';
        meta.append(src, document.createTextNode(' · '));
        if (e.license_url) { const l = el('a', '', e.license); l.href = e.license_url; l.target = '_blank'; l.rel = 'noopener'; meta.append(l); }
        else meta.append(document.createTextNode(e.license));
        meta.append(document.createTextNode(` · Przekształcenia: ${e.changes}`));
        if (e.derivative_license) meta.append(document.createTextNode(` Wersje pochodne: ${e.derivative_license}.`));
        cap.append(meta);
        if (e.not_feast) cap.append(el('p', 'iknote', e.not_feast));
        f.append(a, cap); grid.append(f);
      }
      out.push(section(g.title, g.lead, grid));
    }
    const t = el('div', 'tablewrap'), tb = el('table'), th = el('thead'), tr = el('tr');
    ['Plik', 'Licencja oryginału', 'Master (oryginał)'].forEach(h => { const x = el('th', '', h); x.scope = 'col'; tr.append(x); }); th.append(tr); tb.append(th);
    const body = el('tbody');
    for (const e of K.items) {
      const r = el('tr');
      r.append(el('td', '', e.title), el('td', '', e.license + (e.derivative_license ? ` (pochodne: ${e.derivative_license})` : '')), el('td', '', `${e.master.file}, ${e.master.w}×${e.master.h} px, SHA-256 ${e.master.sha256.slice(0, 16)}…`));
      body.append(r);
    }
    tb.append(body); t.append(tb);
    out.push(section('Prawa i oryginały', K.intro.rights, t));
    return out;
  };
  M.zrodla = () => {
    const t = el('div', 'tablewrap'), tb = el('table'), th = el('thead'), tr = el('tr');
    ['Źródło', 'Stan', 'Uwagi'].forEach(h => { const x = el('th', '', h); x.scope = 'col'; tr.append(x); }); th.append(tr); tb.append(th);
    const body = el('tbody');
    for (const s of O.sources) {
      const r = el('tr'), c1 = el('td');
      c1.append(document.createTextNode(s.title + (s.edition ? '. ' + s.edition : '')));
      if (s.doi) c1.append(document.createTextNode(` DOI ${s.doi}.`));
      if (s.url) { c1.append(document.createTextNode(' ')); const a = el('a', '', 'link'); a.href = s.url; a.rel = 'noopener'; a.target = '_blank'; c1.append(a); }
      const n = O.theses.filter(x => x.source && x.source.id === s.id).length;
      r.append(c1, el('td', '', s.status + (n ? ` · ${n} tez` : '')), el('td', '', s.note || ''));
      body.append(r);
    }
    tb.append(body); t.append(tb);
    /* rejestr tez */
    const reg = el('div'), bar = el('div', 'toolbar'), inp = el('input', 'search'), selT = el('select', 'search'), selS = el('select', 'search'), out = el('div', 'tlist'), cnt = el('p', 'count');
    inp.type = 'search'; inp.placeholder = 'Szukaj w tezach…'; inp.setAttribute('aria-label', 'Szukaj w tezach');
    selT.setAttribute('aria-label', 'Typ tezy'); selS.setAttribute('aria-label', 'Status weryfikacji');
    [['', 'każdy typ'], ...Object.keys(TYP).map(k => [k, k])].forEach(([v, l]) => { const o = el('option', '', l); o.value = v; selT.append(o); });
    [['', 'każdy status'], ...Object.entries(STATUS).map(([k, v]) => [k, v[0]])].forEach(([v, l]) => { const o = el('option', '', l); o.value = v; selS.append(o); });
    bar.append(inp, selT, selS);
    const run = () => {
      const w = norm(inp.value.trim()).split(/\s+/).filter(Boolean);
      const ts = O.theses.filter(x => (!selT.value || x.typ === selT.value) && (!selS.value || x.status === selS.value) && w.every(k => norm(x.id + ' ' + x.text + ' ' + (x.chars || []).map(c => CH.get(c).name).join(' ')).includes(k)));
      cnt.textContent = `${ts.length} z ${O.theses.length} tez`;
      out.replaceChildren(...ts.map(x => { const a = thesis(x, { noTags: true }); a.removeAttribute('id'); const g = btn('linkish', `w module: ${NAMES[x.mod]} →`, () => showThesis(x.id)); a.append(g); return a; }));
    };
    inp.oninput = selT.onchange = selS.onchange = run; run();
    reg.append(bar, cnt, out);
    const legend = el('ul', 'legend2');
    Object.values(STATUS).forEach(([l, k]) => { const li = el('li'); li.append(el('span', 'st st-' + k, l)); legend.append(li); });
    return [section('Źródła', 'Stan odczytu każdego źródła. „Do pozyskania” oznacza, że żadna teza się na nie nie powołuje.', t), section('Rejestr tez', 'Wszystkie tezy z typem i statusem weryfikacji.', legend, reg)];
  };

  /* ---------- zakładki ---------- */
  const NAMES = { atlas: 'Atlas obyczajów', kontekst: 'Kontekst', paryz: 'Paryż', bohaterowie: 'Bohaterowie', mechanizmy: 'Mechanizmy', poetyka: 'Poetyka', sceny: 'Sceny', konteksty: 'Konteksty', ikonografia: 'Ikonografia', czytanie: 'Czytanie ze zrozumieniem', zrodla: 'Źródła' };
  if (!window.IKONO) delete NAMES.ikonografia;
  const bar = $('tabs'), panels = $('panels'), built = new Set(['atlas']);
  const tabs = Object.entries(NAMES).map(([k, v]) => {
    const b = el('button', 'tab', v); b.type = 'button'; b.id = 'tab-' + k; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'panel-' + k); b.dataset.k = k;
    b.onclick = () => { tab(k); history.replaceState(history.state, '', k === 'atlas' ? location.pathname + location.search : '#modul-' + k); };
    bar.append(b); return b;
  });
  bar.addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    let j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (j === undefined) return; e.preventDefault(); j = (j + tabs.length) % tabs.length; tabs[j].focus(); tabs[j].click();
  });
  let current = null;
  function tab(k) {
    if (!NAMES[k]) k = 'atlas';
    if (!built.has(k)) {
      const p = el('div', 'panel'); p.id = 'panel-' + k; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'tab-' + k); p.tabIndex = -1;
      p.append(...M[k]()); panels.append(p); built.add(k);
    }
    for (const b of tabs) { const on = b.dataset.k === k; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; }
    for (const p of panels.children) p.hidden = p.id !== 'panel-' + k;
    if (current !== k) { current = k; if (k === 'atlas') select(selected); }
    tabs.find(b => b.dataset.k === k).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  window.GORIOT_TAB = tab;
  const fromHash = () => { const m = /^#modul-(\w+)$/.exec(location.hash); if (m && m[1] !== current) { tab(m[1]); window.scrollTo(0, 0); } };
  window.addEventListener('hashchange', fromHash);
  tab('atlas'); fromHash();
})();
