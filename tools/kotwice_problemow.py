"""Dopasowanie kotwic cytatów z arkusza TREŚCI (eksport CSV) do tekstu obu przekładów.

python -I tools/kotwice_problemow.py <plik.csv> [R002 R003 …] [--json wynik.json] [--tekst]

Kotwica: BORT: „początek … koniec” · BOY: „początek … koniec” (jedna linia na fragment).
Dla każdej kotwicy: jednoznaczność początku, koniec po początku, liczba akapitów, strony,
oraz istniejący identyfikator (G../P..) o identycznym zakresie.
"""
import csv, json, re, sys, pathlib
if __name__ == '__main__': sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent


def load(f):
    s = (R / f).read_text(encoding='utf-8'); i = s.index('=') + 1
    return json.loads(s[i:].strip().rstrip(';'))


T = {'bort': load('tekst.js'), 'boy': load('boy.js')}
C, O = load('cytaty.js'), load('opracowanie.js')


def index(ed):
    flat, where = [], []
    for p, row in enumerate(T[ed]):
        for a, ch in enumerate(row[1]):
            if not ch.isspace(): flat.append(ch); where.append((p, a))
    return ''.join(flat), where


IDX = {ed: index(ed) for ed in T}
nows = lambda s: re.sub(r'\s', '', s)


def page_at(ed, p, a):
    row = T[ed][p]; pg = row[0]
    for off, q in (row[2] if len(row) > 2 else []):
        if a >= off: pg = q
    return pg


def locate(ed, start, end):
    flat, where = IDX[ed]
    qs, qe = nows(start), nows(end)
    n = flat.count(qs)
    if n != 1: return {'error': f'początek występuje {n} raz(y)', 'start': start}
    i = flat.index(qs)
    j = flat.find(qe, i)
    if j < 0: return {'error': 'nie znaleziono końca po początku', 'end': end}
    (p0, a), (p1, b) = where[i], where[j + len(qe) - 1]
    seg = [[p, a if p == p0 else 0, b + 1 if p == p1 else len(T[ed][p][1])] for p in range(p0, p1 + 1)]
    pages = sorted({page_at(ed, p, x) for p, x, _ in seg} | {page_at(ed, p, y - 1) for p, _, y in seg})
    text = ' '.join(T[ed][p][1][x:y] for p, x, y in seg)
    warn = []
    if p1 - p0 > 15: warn.append(f'zakres {p1 - p0 + 1} akapitów (limit 16)')
    if flat.count(qe) > 1: warn.append(f'koniec występuje {flat.count(qe)} razy (wzięto najbliższy po początku)')
    return {'seg': seg, 'page': pages[0], 'pages': pages, 'paras': p1 - p0 + 1, 'chars': len(text), 'text': text, 'warn': warn}


# istniejące zakresy: cytaty atlasu (Bortnowska + wariant Boya) i fragmenty opracowania
EXIST = {}
for q in C['quotes']:
    v = O['variants'].get(q['id'])
    EXIST[q['id']] = {'bort': q['seg'], 'boy': v['seg'] if v else None}
for p in O['passages']:
    EXIST[p['id']] = {'bort': p.get('bort', {}).get('seg'), 'boy': p.get('boy', {}).get('seg')}


def same(id_, b, y):
    e = EXIST[id_]
    return e['bort'] == b and e['boy'] == y


ANCH = re.compile(r'(BORT|BOY):\s*„(.+?)”(?=\s*(?:·|$))')


def parse(line):
    out = {}
    for ed, body in ANCH.findall(line):
        if ' … ' in body: s, e = body.split(' … ', 1)
        elif '…' in body: s, e = body.split('…', 1)
        else: s = e = body
        out['bort' if ed == 'BORT' else 'boy'] = (s.strip(), e.strip())
    return out


def main():
    argv = sys.argv[1:]
    if '--json' in argv: i = argv.index('--json'); del argv[i:i + 2]
    args = [a for a in argv if not a.startswith('--')]
    rows = list(csv.reader(open(args[0], encoding='utf-8')))
    want = set(args[1:])
    res = {}
    for r in rows[1:]:
        rid = r[0]
        if want and rid not in want: continue
        items = []
        for k, line in enumerate([x for x in r[6].splitlines() if x.strip()], 1):
            an = parse(line); it = {'n': k, 'line': line}
            for ed in ('bort', 'boy'):
                it[ed] = locate(ed, *an[ed]) if ed in an else {'error': 'brak kotwicy'}
            if all('seg' in it[ed] for ed in ('bort', 'boy')):
                it['reuse'] = next((i for i in EXIST if same(i, it['bort']['seg'], it['boy']['seg'])), None)
            items.append(it)
        res[rid] = {'question': r[4], 'text': r[5], 'items': items}
        bad = sum(1 for it in items for ed in ('bort', 'boy') if 'error' in it[ed])
        print(f'== {rid} {r[4]} — kotwic {len(items)}, błędów {bad}')
        for it in items:
            b, y = it['bort'], it['boy']
            fmt = lambda v: v.get('error') or f"s. {'–'.join(map(str, v['pages'][:1] + v['pages'][-1:])) if len(v['pages']) > 1 else v['page']}, {v['paras']} ak., {v['chars']} zn." + (' ⚠ ' + '; '.join(v['warn']) if v['warn'] else '')
            print(f"  {it['n']}. BORT {fmt(b)} | BOY {fmt(y)}" + (f" | = {it['reuse']}" if it.get('reuse') else ''))
            if '--tekst' in sys.argv:
                for ed in ('bort', 'boy'):
                    if 'text' in it[ed]: print(f"     {ed.upper()}: {it[ed]['text']}")
    if '--json' in sys.argv:
        out = sys.argv[sys.argv.index('--json') + 1]
        pathlib.Path(out).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')


if __name__ == '__main__':
    main()
