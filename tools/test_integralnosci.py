"""Testy integralności danych (bez eval): segmenty cytatów, zakresy scen, cytaty w zadaniach, odsyłacze.

python -I tools/test_integralnosci.py
"""
import json, re, sys, pathlib
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent


def load(f):
    s = (R / f).read_text(encoding='utf-8'); i = s.index('=') + 1
    return json.loads(s[i:].strip().rstrip(';'))


ws = lambda t: re.sub(r'\s+', ' ', t).strip()
def js_slice(t, a, b):  # indeksy JS (UTF-16)
    u = t.encode('utf-16-le'); return u[2 * a:2 * b].decode('utf-16-le')

T = {'bort': load('tekst.js'), 'boy': load('boy.js')}
C, O, S = load('cytaty.js'), load('opracowanie.js'), load('fragmenty.js')
fails = []; res = {}

def page_at(ed, j, a):  # strona w miejscu a akapitu j (łamania stron wewnątrz akapitu: [[offset, strona], ...])
    row = T[ed][j]; pg = row[0]
    for off, p in (row[2] if len(row) > 2 else []):
        if a >= off: pg = p
    return pg


def seg_ok(ed, v):
    got = ' '.join(ws(js_slice(T[ed][j][1], a, b)) for j, a, b in v['seg'])
    return ws(' '.join(v['text'])) == got

def count(name, items):
    ok = sum(1 for _, good in items if good); res[name] = (ok, len(items))
    fails.extend(f'{name}: {k}' for k, good in items if not good)

count('cytaty atlasu (Bortnowska)', [(q['id'], seg_ok('bort', q)) for q in C['quotes']])
count('cytaty atlasu (Boy, warianty)', [(k, seg_ok('boy', v)) for k, v in O['variants'].items() if v])
count('fragmenty opracowania (Bortnowska)', [(p['id'], seg_ok('bort', p['bort'])) for p in O['passages'] if p.get('bort')])
count('fragmenty opracowania (Boy)', [(p['id'], seg_ok('boy', p['boy'])) for p in O['passages'] if p.get('boy')])
count('strony fragmentów zgodne z tekstem', [(f"{x['id']}/{ed}", x[ed]['page'] == page_at(ed, *x[ed]['seg'][0][:2]))
      for x in O['passages'] for ed in ('bort', 'boy') if x.get(ed)])

sc = []
cites = []
for s in S:
    for ed in ('bort', 'boy'):
        r = s[ed]; n = len(T[ed])
        good = 0 <= r['from'] <= r['to'] < n and [T[ed][r['from']][0], T[ed][r['to']][0]] == r['pages']
        sc.append((f"{s['id']}/{ed}", good))
        txt = ws(' '.join(T[ed][i][1] for i in range(r['from'], r['to'] + 1))) if good else ''
        for k, t in enumerate(s.get('tasks', [])):
            c = (t.get('cite') or {}).get(ed)
            if c: cites.append((f"{s['id']}/zad{k + 1}/{ed}: {c[:40]}", ws(c) in txt))
count('zakresy scen (obie edycje)', sc)
src = T['bort']; cyt = []
for rid, room in O['pension']['rooms'].items():
    c = room.get('cyt')
    if not c: continue
    hit = [(j, src[j][1].find(c['text'])) for j in range(len(src)) if c['text'] in src[j][1]]
    cyt.append((f"pokój {rid}: s. {c['page']}", len(hit) == 1 and page_at('bort', *hit[0]) == c['page']))
count('cytaty przy pokojach: dosłowne i z właściwą stroną', cyt)
count('cytaty w kluczach zadań w zakresie sceny', cites)

ids = {q['id'] for q in C['quotes']} | {p['id'] for p in O['passages']} | {t['id'] for t in O['theses']}
refs = []
def walk(x, path):
    if isinstance(x, dict):
        for k, v in x.items():
            if k in ('refs', 'theses', 'extra') and isinstance(v, list):
                refs.extend((f'{path}.{k}:{r}', r in ids) for r in v if isinstance(r, str) and re.fullmatch(r'[GPT]\d+', r))
            elif k in ('char', 'desc', 'text') and isinstance(v, str) and re.fullmatch(r'[GPT]\d+', v):
                refs.append((f'{path}.{k}:{v}', v in ids))
            else: walk(v, f'{path}.{k}')
    elif isinstance(x, list):
        for i, v in enumerate(x): walk(v, f'{path}[{i}]')
walk(O, 'OPRAC'); walk(S, 'SCENY')
count('odsyłacze G/P/T w danych', refs)

chars = {c['id'] for c in O['characters']}
rel = [(f"{r.get('a')}-{r.get('b')}", r.get('a') in chars and r.get('b') in chars) for r in O['relations'] if 'a' in r]
if rel: count('relacje postaci: oba końce istnieją', rel)

for k, (ok, n) in res.items(): print(f'{"PASS" if ok == n else "FAIL"}  {ok}/{n}  {k}')
for f in fails[:40]: print('  -', f)
sys.exit(1 if fails else 0)
