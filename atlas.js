/* Atlas cytatów: korzysta ze zmiennych głównego skryptu (D, A, G, sections, select, jump, update, el, pad, norm). */
(() => {
  'use strict';
  const C = window.CYTATY;
  if (!C) return;
  const Q = C.quotes, byId = new Map(Q.map(q => [q.id, q]));
  const FIRST = 2, LAST = 128;
  const btn = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.onclick = fn; return b; };
  const quoteBox = q => { const b = el('blockquote', 'quote'); for (const t of q.text) b.append(el('p', '', t)); return b; };
  const openChip = q => { const b = btn('qchip', `Cytat, s. ${q.page}`, () => open(q)); b.title = q.title; b.setAttribute('aria-label', `Cytat, s. ${q.page}: ${q.title}`); return b; };

  /* ---------- przy przykładach w katalogu ---------- */
  const rowKey = (a, r) => a + ':' + r, chipsAt = new Map();
  for (const q of Q) for (const [a, r] of q.rows) {
    const tr = sections.get(a).rows[r];
    let box = tr.querySelector('.qchips');
    if (!box) { box = el('div', 'qchips'); tr.cells[1].append(box); }
    const chip = btn('qchip', `Cytat, s. ${q.page}`, () => toggle(tr, q, chip));
    chip.setAttribute('aria-expanded', 'false');
    chip.setAttribute('aria-label', `Cytat, s. ${q.page}: ${q.title}`);
    box.append(chip);
    chipsAt.set(rowKey(a, r) + q.id, [tr, chip]);
  }
  function toggle(tr, q, chip, force) {
    let next = tr.nextElementSibling;
    while (next && next.classList.contains('qrow') && next.dataset.q !== q.id) next = next.nextElementSibling;
    const shown = next && next.classList.contains('qrow');
    if (shown) { if (force) return; next.remove(); chip.setAttribute('aria-expanded', 'false'); return; }
    const row = el('tr', 'qrow'), td = el('td'), foot = el('div', 'qfoot');
    row.dataset.q = q.id; row.parentRow = tr; td.colSpan = 3;
    foot.append(btn('read', `Zobacz w powieści, s. ${q.page} →`, () => open(q)));
    td.append(quoteBox(q), foot); row.append(td); tr.after(row);
    chip.setAttribute('aria-expanded', 'true');
  }
  const update0 = update;
  update = function () { update0(); document.querySelectorAll('tr.qrow').forEach(r => { r.hidden = r.parentRow.hidden; }); };

  /* ---------- cytaty do całego obszaru ---------- */
  for (const a of D.areas) {
    const qs = Q.filter(q => q.areas.includes(a.id));
    if (!qs.length) continue;
    const bar = el('div', 'qbar'); bar.append(el('span', '', 'Cytaty do obszaru:'), ...qs.map(openChip));
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
      const box = el('div', 'qchips relchips'); box.append(...qs.map(openChip));
      const wrap = el('div'); b.replaceWith(wrap); wrap.append(b, box);
    });
  };
  select(selected);

  /* ---------- atlas ---------- */
  const cards = [];
  function goRow(a, r, q) {
    jump(a);
    const [tr, chip] = chipsAt.get(rowKey(a, r) + q.id);
    toggle(tr, q, chip, true);
    tr.classList.add('flash'); setTimeout(() => tr.classList.remove('flash'), 2500);
    tr.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  C.topics.forEach((title, n) => {
    const root = el('details', 'area'), sum = el('summary'), qty = el('span', 'qty');
    sum.append(el('span', 'num', pad(n + 1)), el('span', 'title', title), qty); root.append(sum);
    const items = Q.filter(q => q.t === n + 1).map(q => {
      const c = el('article', 'card'), foot = el('div', 'qfoot'), tags = el('div', 'tags');
      c.id = 'karta-' + q.id;
      c.append(el('h3', '', q.title), el('p', '', q.desc), quoteBox(q));
      foot.append(btn('read', `Zobacz w powieści, s. ${q.page} →`, () => open(q)));
      for (const [a, r] of q.rows) tags.append(btn('', `${pad(a)} · ${D.areas.find(x => x.id === a).rows[r][0]}`, () => goRow(a, r, q)));
      for (const a of q.areas) tags.append(btn('', `${pad(a)} · ${A.get(a).title}`, () => jump(a)));
      for (const [a, b] of q.links) tags.append(btn('', `${A.get(a).short} ↔ ${A.get(b).short}`, () => { select(a); $('map').scrollIntoView(); }));
      c.append(foot); if (tags.children.length) { tags.style.marginTop = '8px'; c.append(tags); }
      root.append(c);
      return { c, text: norm([q.id, q.title, q.desc, title, ...q.text, ...q.rows.map(([a, r]) => A.get(a).title + ' ' + A.get(a).rows[r][0]), ...q.areas.map(a => A.get(a).title)].join(' ')) };
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
  $('novel').onclick = () => openPage(FIRST);
  filterAtlas();

  /* ---------- czytnik ---------- */
  const R = $('reader'), body = $('rbody');
  let cur = null, page = FIRST, pushed = false, loading = null;
  const loadText = () => loading || (loading = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = 'tekst.js?v=1';
    s.onload = () => window.POWIESC ? ok(window.POWIESC) : no(); s.onerror = () => { loading = null; s.remove(); no(); };
    document.head.append(s);
  }));
  const open = q => go('#cytat-' + q.id);
  const openPage = p => go('#strona-' + p);
  function go(hash) {
    if (R.open) history.replaceState(history.state, '', hash);
    else { history.pushState({ reader: 1 }, '', hash); pushed = true; }
    route();
  }
  function route() {
    const m = /^#(?:cytat-(G\d\d)|strona-(\d+))$/.exec(location.hash);
    const q = m && m[1] ? byId.get(m[1]) : null, p = m && m[2] ? +m[2] : 0;
    if (!q && !(p >= FIRST && p <= LAST)) { if (R.open) R.close(); return; }
    cur = q || null; page = q ? q.page : p;
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
  let token = 0;
  async function render(focusMark) {
    const my = ++token;
    $('reyebrow').textContent = cur ? `Zagadnienie ${pad(cur.t)} · ${C.topics[cur.t - 1]}` : 'Ojciec Goriot';
    $('rtitle').textContent = cur ? cur.title : 'Tekst powieści';
    $('rqnav').hidden = !cur;
    if (cur) $('rqpos').textContent = `Cytat ${Q.indexOf(cur) + 1} z ${Q.length}`;
    $('rprev').disabled = page <= FIRST; $('rnext').disabled = page >= LAST;
    $('rback').hidden = !cur || page === cur.page;
    $('rnum').value = page;
    let T;
    try { body.setAttribute('aria-busy', 'true'); T = window.POWIESC || await loadText(); }
    catch (e) {
      if (my !== token) return;
      body.replaceChildren(el('p', 'cont', 'Nie udało się wczytać tekstu powieści.'));
      if (cur) body.append(quoteBox(cur));
      return;
    }
    if (my !== token) return;
    body.removeAttribute('aria-busy');
    const frag = [el('div', 'rpage', 's. ' + page)];
    const on = Q.filter(q => q.page === page);
    for (const s of slices(T, page)) {
      const p = el('p', (s.cont ? 'cont ' : '') + ['', 'v', 'sig'][s.type]);
      const hits = on.flatMap(q => q.seg.filter(g => g[0] === s.pi).map(g => ({ q, a: Math.max(g[1], s.a), b: Math.min(g[2], s.b) }))).filter(h => h.a < h.b);
      const pts = [...new Set([s.a, s.b, ...hits.flatMap(h => [h.a, h.b])])].sort((x, y) => x - y);
      for (let i = 0; i + 1 < pts.length; i++) {
        const t = T[s.pi][1].slice(pts[i], pts[i + 1]), hs = hits.filter(h => h.a <= pts[i] && h.b >= pts[i + 1]);
        if (!hs.length) p.append(t);
        else { const m = el('mark', hs.some(h => h.q === cur) ? 'on' : 'other', t); m.title = hs.map(h => h.q.title).join(' · '); p.append(m); }
      }
      frag.push(p);
    }
    body.replaceChildren(...frag);
    const m = focusMark && body.querySelector('mark.on');
    body.scrollTop = 0;
    body.scrollTop = m ? Math.max(0, m.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientHeight / 4) : 0;
  }
  function turn(p) { page = Math.min(LAST, Math.max(FIRST, p)); if (!cur) history.replaceState(history.state, '', '#strona-' + page); render(cur && page === cur.page); }
  $('rprev').onclick = () => turn(page - 1);
  $('rnext').onclick = () => turn(page + 1);
  $('rback').onclick = () => turn(cur.page);
  $('rnum').onchange = e => turn(parseInt(e.target.value, 10) || page);
  $('rqprev').onclick = () => open(Q[(Q.indexOf(cur) + Q.length - 1) % Q.length]);
  $('rqnext').onclick = () => open(Q[(Q.indexOf(cur) + 1) % Q.length]);
  route();
})();
