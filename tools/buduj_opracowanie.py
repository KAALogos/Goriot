"""Buduje opracowanie.js i boy.js z dane/*.json i sprawdza je.

python -I tools/buduj_opracowanie.py

Przerywa pracę, gdy:
- fragment nie występuje dosłownie dokładnie raz w danym przekładzie,
- fragment wielozdaniowy nie jest ciągły (kolejne akapity),
- odsyłacz wskazuje nieistniejący cytat, fragment, tezę, przykład, relację, postać lub źródło,
- identyfikator się powtarza albo tekst jest pusty.
"""
import json, re, sys, pathlib
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent
rd = lambda p: (R / p).read_text(encoding='utf-8')
js = lambda s, var: json.loads(s[len(f'window.{var}='):].rstrip().rstrip(';'))

BORT = js(rd('tekst.js'), 'POWIESC')
C = js(rd('cytaty.js'), 'CYTATY')
BOY = json.loads(rd('dane/boy_1938.json'))
BAL = json.loads(rd('dane/boy_balzak_1934_r8.json'))
VAR = json.loads(rd('dane/warianty_boy.json'))
O = json.loads(rd('dane/opracowanie.json'))
D = json.loads(re.search(r'id="data">(.*?)</script>', rd('index.html'), re.S).group(1))
AREAS = {a['id']: a for a in D['areas']}
LINKS = {tuple(sorted(l[:2])) for l in D['links']}
errors = []


def err(*a):
    errors.append(' '.join(map(str, a)))


def index(T):
    flat, where = [], []
    for pi, p in enumerate(T):
        for k, c in enumerate(p[1]):
            if not c.isspace():
                flat.append(c)
                where.append((pi, k))
    return ''.join(flat), where


IDX = {'bort': (BORT, *index(BORT)), 'boy': (BOY, *index(BOY)), 'balzak': (BAL, *index(BAL))}


def page_at(p, i):
    return max([p[0]] + [g for o, g in p[2] if o <= i])


def locate(ed, parts, label):
    T, flat, where = IDX[ed]
    seg, prev = [], None
    for s in parts:
        if not s.strip():
            err(label, ed, 'pusty tekst')
            return None
        q = re.sub(r'\s', '', s)
        hits = [m.start() for m in re.finditer(re.escape(q), flat)]
        if len(hits) != 1 and prev is not None:
            # krótka replika dialogu: jednoznaczna jako następny akapit po poprzedniej części
            hits = [h for h in hits if where[h][0] == prev + 1]
        if len(hits) != 1:
            err(label, ed, f'występuje {len(hits)} razy:', s[:60])
            return None
        i = hits[0]
        (p0, a), (p1, b) = where[i], where[i + len(q) - 1]
        if p0 != p1:
            err(label, ed, 'fragment przekracza akapit')
            return None
        if prev is not None and p0 != prev + 1 and p0 != prev:
            err(label, ed, 'fragmenty nie są ciągłe')
        prev = p0
        seg.append([p0, a, b + 1])
    pages = sorted({page_at(T[p], a) for p, a, _ in seg} | {page_at(T[p], b - 1) for p, _, b in seg})
    return {'text': [T[p][1][a:b] for p, a, b in seg], 'seg': seg, 'page': pages[0], 'pages': pages}


# --- warianty Boya dla 40 cytatów ---
Q = {q['id']: q for q in C['quotes']}
variants = {}
for qid in Q:
    if qid not in VAR:
        err(qid, 'brak wariantu Boya')
        continue
    variants[qid] = locate('boy', VAR[qid], qid)
for k in VAR:
    if not k.startswith('_') and k not in Q:
        err(k, 'wariant bez cytatu w atlasie')

# --- nowe fragmenty ---
ids = set(Q)
passages = []
for p in O['passages']:
    if p['id'] in ids:
        err(p['id'], 'powtórzone ID')
    ids.add(p['id'])
    passages.append({'id': p['id'], 'title': p['title'],
                     'bort': locate('bort', p['bort'], p['id']) if p.get('bort') else None,
                     'boy': locate('boy', p['boy'], p['id']) if p.get('boy') else None})

SRC = {s['id']: s for s in O['sources']}
CH = {c['id'] for c in O['characters']}
MECH = {m['id'] for m in O['mechanisms']}
TH = {t['id'] for t in O['theses']}
if len(TH) != len(O['theses']):
    err('powtórzone ID tez')


def check_refs(owner, refs, allow_theses=False):
    for r in refs or []:
        if r not in ids and not (allow_theses and r in TH):
            err(owner, 'nieznany odsyłacz', r)


def check_rows(owner, rows):
    out = []
    for a, start in rows or []:
        m = [i for i, r in enumerate(AREAS[a]['rows']) if r[0].startswith(start)]
        if len(m) != 1:
            err(owner, 'przykład', a, start, len(m))
        else:
            out.append([a, m[0]])
    return out


def check_source(owner, s):
    if not s:
        return None
    if s['id'] not in SRC:
        err(owner, 'nieznane źródło', s['id'])
        return s
    s = dict(s)
    if s.get('quote'):
        loc = locate('balzak' if s['id'] == 'S-BOY-BALZAK' else 'boy', [s['quote']], owner)
        if loc:
            s['loc'] = 's. ' + '–'.join(map(str, [loc['pages'][0], loc['pages'][-1]] if len(loc['pages']) > 1 else loc['pages']))
            s['seg'] = loc['seg']
    if not s.get('loc'):
        err(owner, 'źródło bez lokalizacji')
    return s


for t in O['theses']:
    check_refs(t['id'], t.get('refs'), allow_theses=True)
    t['rows'] = check_rows(t['id'], t.get('rows'))
    for l in t.get('links') or []:
        if tuple(sorted(l)) not in LINKS:
            err(t['id'], 'brak relacji na mapie', l)
    for c in t.get('chars') or []:
        if c not in CH:
            err(t['id'], 'nieznana postać', c)
    for m in t.get('mech') or []:
        if m not in MECH:
            err(t['id'], 'nieznany mechanizm', m)
    t['source'] = check_source(t['id'], t.get('source'))
    if t['status'] in ('źródło', 'źródło-fragment') and not t['source']:
        err(t['id'], 'status źródłowy bez źródła')
    if t['status'] == 'tekst' and not t.get('refs'):
        err(t['id'], 'status tekstowy bez odsyłacza')
    if t['typ'] not in ('fakt', 'interpretacja', 'kontekst'):
        err(t['id'], 'zły typ')
for c in O['characters']:
    check_refs(c['id'], c['refs'])
rel_types = {'pokrewieństwo', 'ekonomia', 'mentoring', 'erotyka', 'prestiż', 'przymus'}
for r in O['relations']:
    check_refs(r['id'], r['refs'])
    r['rows'] = check_rows(r['id'], r.get('rows'))
    if r['from'] not in CH or r['to'] not in CH or r['type'] not in rel_types:
        err(r['id'], 'zła relacja')
    if not r['refs'] and not r['rows']:
        err(r['id'], 'relacja bez dowodu')
for m in O['mechanisms']:
    check_refs(m['id'], m['refs'])
    for a in m['areas']:
        if a not in AREAS:
            err(m['id'], 'nieznany obszar', a)
for ax in O['axes']:
    check_refs(ax['id'], [s['ref'] for s in ax['steps']])
for s in O['scenes']:
    check_refs(s['id'], s['refs'])
    check_refs(s['id'], s['theses'], allow_theses=True)
for side in O['timeline'].values():
    for e in side:
        if e.get('ref'):
            check_refs('oś czasu', [e['ref']])
        e['source'] = check_source('oś czasu ' + e['date'], e.get('source'))
for c in O['contexts']:
    check_refs(c['id'], c['refs'])
    c['source'] = check_source(c['id'], c.get('source'))

# --- karta CZZ: dosłowny tekst krytyczny od „from” do „to” ---
cz = O['czz']
flat, where = IDX['balzak'][1:]
a0 = flat.find(re.sub(r'\s', '', cz['from']))
b0 = flat.find(re.sub(r'\s', '', cz['to']))
if a0 < 0 or b0 < 0:
    err('CZZ: nie znaleziono granic fragmentu')
else:
    (pa, ka) = where[a0]
    (pb, kb) = where[b0 + len(re.sub(r'\s', '', cz['to'])) - 1]
    paras = []
    for pi in range(pa, pb + 1):
        p = BAL[pi]
        s, e = (ka if pi == pa else 0), (kb + 1 if pi == pb else len(p[1]))
        paras.append({'page': page_at(p, s), 'text': p[1][s:e],
                      'brk': [[o - s, g] for o, g in p[2] if s < o < e]})
    cz['paras'] = paras
    cz['pages'] = [paras[0]['page'], page_at(BAL[pb], kb)]
    if len(cz['questions']) != len(cz['key']):
        err('CZZ: liczba pytań i odpowiedzi')

if errors:
    print('BŁĘDY:', *errors, sep='\n  ')
    sys.exit(1)

out = {k: O[k] for k in ('sources', 'timeline', 'characters', 'relations', 'mechanisms', 'axes', 'theses', 'scenes', 'contexts', 'czz')}
out['passages'] = passages
out['variants'] = variants


def write(name, var, obj):
    (R / name).write_text(f'window.{var}=' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + ';\n',
                          encoding='utf-8', newline='\n')


write('opracowanie.js', 'OPRAC', out)
write('boy.js', 'POWIESC_BOY', [[p[0], p[1], p[2], 0] for p in BOY])
print('OK: warianty', len(variants), '| fragmenty', len(passages), '| tezy', len(O['theses']),
      '| relacje', len(O['relations']), '| sceny', len(O['scenes']), '| CZZ s.', cz['pages'],
      '| tezy wg statusu', {s: sum(t['status'] == s for t in O['theses']) for s in ('tekst', 'źródło', 'źródło-fragment', 'autorska')})
