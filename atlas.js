/* Atlas cytatów i czytnik powieści.
   Korzysta ze zmiennych głównego skryptu (D, A, G, sections, select, jump, update, links, el, pad, norm, $).
   Przekład: Bortnowska (domyślnie), Boy-Żeleński albo oba; dane Boya z opracowanie.js. */
(() => {
  'use strict';
  const C = window.CYTATY;
  if (!C) return;
  const O = window.OPRAC || { variants: {}, passages: [] };
  const Q = C.quotes, byId = new Map(Q.map(q => [q.id, q]));
  const PS = new Map((O.passages || []).map(p => [p.id, p]));
  const ED = {
    bort: { name: 'Bortnowska', full: 'przekład Amelii Bortnowskiej (1881)', first: 2, last: 128, src: 'tekst.js?v=1', key: 'POWIESC', hash: '' },
    boy: { name: 'Boy-Żeleński', full: 'przekład Tadeusza Boya-Żeleńskiego (1938)', first: 17, last: 267, src: 'boy.js?v=1', key: 'POWIESC_BOY', hash: 'boy-' }
  };
  const btn = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.onclick = fn; return b; };

  /* ---------- tryb przekładu ---------- */
  let mode = 'bort';
  try { const m = localStorage.getItem('goriot-przeklad'); if (['bort', 'boy', 'oba'].includes(m)) mode = m; } catch (e) { }
  const listeners = [];
  function setMode(m) {
    mode = m;
    try { localStorage.setItem('goriot-przeklad', m); } catch (e) { }
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    document.querySelectorAll('.qbox').forEach(renderBox);
    listeners.forEach(f => f(m));
  }
  document.querySelectorAll('[data-mode]').forEach(b => { b.onclick = () => setMode(b.dataset.mode); b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });

  /* item: cytat atlasu (G..) albo fragment opracowania (P..) w obu wydaniach */
  function item(id) {
    if (byId.has(id)) { const q = byId.get(id); return { id, title: q.title, bort: { text: q.text, seg: q.seg, page: q.page }, boy: O.variants[id] || null }; }
    const p = PS.get(id);
    return p ? { id, title: p.title, bort: p.bort, boy: p.boy } : null;
  }
  const eds = () => mode === 'oba' ? ['bort', 'boy'] : [mode];
  const pageLabel = (id, ed) => { const v = item(id) && item(id)[ed]; return v ? 's. ' + v.page : '—'; };

  function renderBox(box) {
    const it = item(box.dataset.q), both = mode === 'oba';
    box.classList.toggle('both', both);
    box.replaceChildren(...eds().map(ed => {
      const f = el('figure', 'qver'), v = it[ed];
      if (both) f.append(el('figcaption', '', ED[ed].name));
      if (!v) { f.append(el('p', 'missing', ed === 'boy' ? 'Brak odpowiednika w przekładzie Boya.' : 'Brak tego fragmentu u Bortnowskiej.')); return f; }
      const b = el('blockquote', 'quote');
      for (const t of v.text) b.append(el('p', '', t));
      const foot = el('div', 'qfoot');
      foot.append(btn('read', `${ed === 'boy' ? 'Zobacz u Boya' : 'Zobacz w powieści'}, s. ${v.page} →`, () => open(it.id, ed)));
      f.append(b, foot);
      return f;
    }));
  }
  function quoteBox(id) { const b = el('div', 'qbox'); b.dataset.q = id; renderBox(b); return b; }
  function chip(id, onClick) {
    const it = item(id), b = btn('qchip', '', onClick || (() => open(id, mode === 'boy' ? 'boy' : 'bort')));
    const label = () => {
      const t = mode === 'oba' ? `Cytat, s. ${it.bort ? it.bort.page : '—'} / ${it.boy ? it.boy.page : '—'}` : `Cytat, ${pageLabel(id, mode)}`;
      b.textContent = t; b.setAttribute('aria-label', `${t}: ${it.title}`);
    };
    b.title = it.title; label(); listeners.push(label);
    return b;
  }
  window.GORIOT = { item, quoteBox, chip, open: (id, ed) => open(id, ed || (mode === 'boy' ? 'boy' : 'bort')), openPage: (p, ed) => openPage(p, ed), mode: () => mode, onMode: f => listeners.push(f), ED };

  /* ---------- przy przykładach w katalogu ---------- */
  const rowKey = (a, r) => a + ':' + r, chipsAt = new Map();
  for (const q of Q) for (const [a, r] of q.rows) {
    const tr = sections.get(a).rows[r];
    let box = tr.querySelector('.qchips');
    if (!box) { box = el('div', 'qchips'); tr.cells[1].append(box); }
    const c = chip(q.id, () => toggle(tr, q, c));
    c.setAttribute('aria-expanded', 'false');
    box.append(c);
    chipsAt.set(rowKey(a, r) + q.id, [tr, c]);
  }
  function toggle(tr, q, c, force) {
    let next = tr.nextElementSibling;
    while (next && next.classList.contains('qrow') && next.dataset.q !== q.id) next = next.nextElementSibling;
    const shown = next && next.classList.contains('qrow');
    if (shown) { if (force) return; next.remove(); c.setAttribute('aria-expanded', 'false'); return; }
    const row = el('tr', 'qrow'), td = el('td');
    row.dataset.q = q.id; row.parentRow = tr; td.colSpan = 3;
    td.append(quoteBox(q.id)); row.append(td); tr.after(row);
    c.setAttribute('aria-expanded', 'true');
  }
  const update0 = update;
  update = function () { update0(); document.querySelectorAll('tr.qrow').forEach(r => { r.hidden = r.parentRow.hidden; }); };

  /* ---------- cytaty do całego obszaru ---------- */
  for (const a of D.areas) {
    const qs = Q.filter(q => q.areas.includes(a.id));
    if (!qs.length) continue;
    const bar = el('div', 'qbar'); bar.append(el('span', '', 'Cytaty do obszaru:'), ...qs.map(q => chip(q.id)));
    sections.get(a.id).root.querySelector('.tablewrap').after(bar);
  }

  /* ---------- przy relacjach na mapie ---------- */
  const select0 = select;
  select = function (id) {
    select0(id);
    const near = links(id);
    [...$('relations').querySelectorAll('.relation')].forEach((b, i) => {
      const k = [id, near[i].id].sort((x, y) => x - y).join();
      const qs = Q.filter(q => q.links.some(l => l.join() === k));
      if (!qs.length) return;
      const box = el('div', 'qchips relchips'); box.append(...qs.map(q => chip(q.id)));
      const wrap = el('div'); b.replaceWith(wrap); wrap.append(b, box);
    });
  };
  select(selected);

  /* ---------- atlas ---------- */
  const cards = [];
  function goRow(a, r, q) {
    window.GORIOT_TAB && window.GORIOT_TAB('atlas');
    jump(a);
    const tr = sections.get(a).rows[r], hit = q && chipsAt.get(rowKey(a, r) + q.id);
    if (hit) toggle(tr, q, hit[1], true);
    tr.classList.add('flash'); setTimeout(() => tr.classList.remove('flash'), 2500);
    tr.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  window.GORIOT.goRow = (a, r, id) => goRow(a, r, byId.get(id) || null);
  C.topics.forEach((title, n) => {
    const root = el('details', 'area'), sum = el('summary'), qty = el('span', 'qty');
    sum.append(el('span', 'num', pad(n + 1)), el('span', 'title', title), qty); root.append(sum);
    const items = Q.filter(q => q.t === n + 1).map(q => {
      const c = el('article', 'card'), tags = el('div', 'tags');
      c.id = 'karta-' + q.id;
      c.append(el('h3', '', q.title), el('p', '', q.desc), quoteBox(q.id));
      for (const [a, r] of q.rows) tags.append(btn('', `${pad(a)} · ${D.areas.find(x => x.id === a).rows[r][0]}`, () => goRow(a, r, q)));
      for (const a of q.areas) tags.append(btn('', `${pad(a)} · ${A.get(a).title}`, () => jump(a)));
      for (const [a, b] of q.links) tags.append(btn('', `${A.get(a).short} ↔ ${A.get(b).short}`, () => { select(a); $('map').scrollIntoView(); }));
      if (tags.children.length) { tags.style.marginTop = '8px'; c.append(tags); }
      root.append(c);
      const boy = O.variants[q.id] ? O.variants[q.id].text : [];
      return { c, text: norm([q.id, q.title, q.desc, title, ...q.text, ...boy, ...q.rows.map(([a, r]) => A.get(a).title + ' ' + A.get(a).rows[r][0]), ...q.areas.map(a => A.get(a).title)].join(' ')) };
    });
    $('topics').append(root); cards.push({ root, items, qty });
  });
  function filterAtlas() {
    const words = norm($('qsearch').value.trim()).split(/\s+/).filter(Boolean);
    let total = 0;
    for (const t of cards) {
      let n = 0;
      for (const i of t.items) { const ok = words.every(w => i.text.includes(w)); i.c.hidden = !ok; if (ok) n++; }
      t.root.hidden = !n; t.qty.textContent = n + ' cyt.'; total += n;
      if (words.length && n) t.root.open = true;
    }
    $('qcount').textContent = `${total} z ${Q.length} cytatów`;
    $('qempty').hidden = total > 0;
  }
  $('qsearch').oninput = filterAtlas;
  $('qexpand').onclick = () => { for (const t of cards) if (!t.root.hidden) t.root.open = true; };
  $('qcollapse').onclick = () => { for (const t of cards) t.root.open = false; };
  $('novel').onclick = () => openPage(ED[mode === 'boy' ? 'boy' : 'bort'].first, mode === 'boy' ? 'boy' : 'bort');
  filterAtlas();

  /* ---------- czytnik ---------- */
  const R = $('reader'), body = $('rbody');
  let cur = null, ed = 'bort', page = 2, shownLast = 2, pushed = false;
  const loading = {};
  const loadText = e => window[ED[e].key] ? Promise.resolve(window[ED[e].key]) : loading[e] || (loading[e] = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = ED[e].src;
    s.onload = () => window[ED[e].key] ? ok(window[ED[e].key]) : no(); s.onerror = () => { loading[e] = null; s.remove(); no(); };
    document.head.append(s);
  }));
  const open = (id, e) => go(`#${ED[e].hash}${byId.has(id) ? 'cytat' : 'fragment'}-${id}`);
  const openPage = (p, e) => go(`#${ED[e].hash}strona-${p}`);
  function go(hash) {
    if (R.open) history.replaceState(history.state, '', hash);
    else { history.pushState({ reader: 1 }, '', hash); pushed = true; }
    route();
  }
  function route() {
    const m = /^#(boy-)?(?:(?:cytat|fragment)-([GP]\d\d)|strona-(\d+))$/.exec(location.hash);
    const e = m && m[1] ? 'boy' : 'bort';
    const it = m && m[2] ? item(m[2]) : null, p = m && m[3] ? +m[3] : 0;
    const ok = it ? !!it[e] : (p >= ED[e].first && p <= ED[e].last);
    if (!m || !ok) { if (R.open) R.close(); return; }
    ed = e; cur = it; page = it ? it[e].page : p;
    if (!R.open) R.showModal();
    render(true);
  }
  function closeReader() {
    if (pushed) { pushed = false; history.back(); }
    else { history.replaceState(null, '', location.pathname + location.search); R.close(); }
  }
  window.addEventListener('popstate', () => { pushed = !!(history.state && history.state.reader); route(); });
  window.addEventListener('hashchange', route);
  R.addEventListener('cancel', e => { e.preventDefault(); closeReader(); });
  R.addEventListener('click', e => { if (e.target === R) closeReader(); });
  $('rclose').onclick = closeReader;

  function slices(T, p) {
    const out = [];
    T.forEach((x, pi) => {
      const cuts = [[0, x[0]], ...x[2]];
      cuts.forEach(([o, g], k) => { if (g === p) out.push({ pi, a: o, b: k + 1 < cuts.length ? cuts[k + 1][0] : x[1].length, cont: k > 0, type: x[3] }); });
    });
    return out;
  }
  const allItems = () => [...Q.map(q => q.id), ...PS.keys()].map(item);
  let token = 0;
  async function render(focusMark) {
    const my = ++token, E = ED[ed], other = ed === 'boy' ? 'bort' : 'boy';
    $('reyebrow').textContent = cur && byId.has(cur.id) ? `${E.name} · Zagadnienie ${pad(byId.get(cur.id).t)} · ${C.topics[byId.get(cur.id).t - 1]}` : `${E.name} · ${E.full}`;
    $('rtitle').textContent = cur ? cur.title : 'Tekst powieści';
    $('rqnav').hidden = !cur || !byId.has(cur.id);
    if (cur && byId.has(cur.id)) $('rqpos').textContent = `Cytat ${Q.indexOf(byId.get(cur.id)) + 1} z ${Q.length}`;
    const sw = $('rswitch');
    sw.hidden = !cur || !cur[other];
    if (cur && cur[other]) { sw.textContent = `${ED[other].name}, s. ${cur[other].page} →`; sw.setAttribute('aria-label', `Ten fragment w przekładzie: ${ED[other].name}, s. ${cur[other].page}`); }
    $('rprev').disabled = page <= E.first; $('rnext').disabled = page >= E.last;
    $('rback').hidden = !cur || page === cur[ed].page;
    $('rnum').min = E.first; $('rnum').max = E.last; $('rnum').value = page; $('rlast').textContent = E.last;
    let T;
    try { body.setAttribute('aria-busy', 'true'); T = await loadText(ed); }
    catch (e) {
      if (my !== token) return;
      body.replaceChildren(el('p', 'cont', 'Nie udało się wczytać tekstu powieści.'));
      if (cur) body.append(quoteBox(cur.id));
      return;
    }
    if (my !== token) return;
    body.removeAttribute('aria-busy');
    body.lang = 'pl';
    const span = cur && page === cur[ed].page && cur[ed].pages ? cur[ed].pages : [page];
    const frag = [];
    shownLast = span[span.length - 1];
    $('rnext').disabled = shownLast >= E.last;
    for (const pg of span) {
    frag.push(el('div', 'rpage', `${E.name} · s. ${pg}`));
    const on = allItems().filter(it => it && it[ed] && (it[ed].pages || [it[ed].page]).includes(pg));
    for (const s of slices(T, pg)) {
      const p = el('p', (s.cont ? 'cont ' : '') + ['', 'v', 'sig'][s.type || 0]);
      const hits = on.flatMap(it => it[ed].seg.filter(g => g[0] === s.pi).map(g => ({ it, a: Math.max(g[1], s.a), b: Math.min(g[2], s.b) }))).filter(h => h.a < h.b);
      const pts = [...new Set([s.a, s.b, ...hits.flatMap(h => [h.a, h.b])])].sort((x, y) => x - y);
      for (let i = 0; i + 1 < pts.length; i++) {
        const t = T[s.pi][1].slice(pts[i], pts[i + 1]), hs = hits.filter(h => h.a <= pts[i] && h.b >= pts[i + 1]);
        if (!hs.length) p.append(t);
        else { const m = el('mark', hs.some(h => cur && h.it.id === cur.id) ? 'on' : 'other', t); m.title = hs.map(h => h.it.title).join(' · '); p.append(m); }
      }
      frag.push(p);
    }
    }
    body.replaceChildren(...frag);
    const m = focusMark && body.querySelector('mark.on');
    body.scrollTop = 0;
    body.scrollTop = m ? Math.max(0, m.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientHeight / 4) : 0;
  }
  function turn(p) {
    const E = ED[ed];
    page = Math.min(E.last, Math.max(E.first, p));
    if (!cur) history.replaceState(history.state, '', `#${E.hash}strona-${page}`);
    render(cur && page === cur[ed].page);
  }
  $('rprev').onclick = () => turn(page - 1);
  $('rnext').onclick = () => turn(shownLast + 1);
  $('rback').onclick = () => turn(cur[ed].page);
  $('rnum').onchange = e => turn(parseInt(e.target.value, 10) || page);
  $('rswitch').onclick = () => open(cur.id, ed === 'boy' ? 'bort' : 'boy');
  const qmove = d => { const i = Q.indexOf(byId.get(cur.id)); open(Q[(i + d + Q.length) % Q.length].id, ed); };
  $('rqprev').onclick = () => qmove(-1);
  $('rqnext').onclick = () => qmove(1);
  route();
})();
