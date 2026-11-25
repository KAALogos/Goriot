"""Buduje tekst.js i cytaty.js z PDF-u Wolnych Lektur oraz dane/*.

python -I tools/buduj_cytaty.py <oznaczony.pdf>   (wymaga pymupdf)

Cyfry, ligatury i spacje po "j" odtwarza z kodów i geometrii znaków PDF.
Przerywa pracę, gdy cytat nie występuje dosłownie, dokładnie raz i na wskazanej stronie,
albo gdy powiązanie nie trafia w istniejący przykład lub relację.
"""
import sys, re, json, pathlib
import pymupdf
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent
M = {'గ': 'j', 'ǳ': 'dz', 'ǲ': 'Dz', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff',
     'ﬃ': 'ffi', 'ǌ': 'nj', 'ĳ': 'ij', '': 'fr', '': 'ft', '': 'fy'}
M.update({chr(0xf730+i): str(i) for i in range(10)})
OFFSET, FIRST, LAST = 10, 2, 128          # strona PDF = strona książki + 10


def page_lines(pg):
    lines = {}
    for b in pg.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                if abs(s['size']-10.4) > .12 or 'Junicode' not in s['font']:
                    continue
                for c in s['chars']:
                    x, y = c['origin']
                    if x >= 425 or not 80 < y < 758:
                        continue
                    k = next((k for k in lines if abs(k-y) < 3), y)
                    lines.setdefault(k, []).append((x, c['bbox'][2], c['c']))
    for y in sorted(lines):
        t, prev = '', None
        cs = sorted(lines[y])
        for c in cs:
            if prev and prev[2] != ' ' and c[2] != ' ' and c[0]-prev[1] > 1.1:
                t += ' '
            t += M.get(c[2], c[2])
            prev = c
        t = re.sub(' +', ' ', t).strip()
        if t:
            yield round(cs[0][0], 1), t


paras = []                                 # [strona, tekst, [[pozycja, strona]...], typ]
d = pymupdf.open(sys.argv[1])
for p in range(FIRST, LAST+1):
    for x, t in page_lines(d[p+OFFSET-1]):
        if not paras or x > 80:
            paras.append([p, t, [], 2 if x > 300 else 1 if x > 90 else 0])
            continue
        q = paras[-1]
        s, sep = q[1], ' '
        if re.search(r'\w-$', s):
            sep = ''
            if t[0] == '-':
                t = t[1:]                  # Trompe-la- / -Mort
            elif not t[0].isupper():
                s = s[:-1]
        if (q[2][-1][1] if q[2] else q[0]) != p:
            q[2].append([len(s+sep), p])
        q[1] = s+sep+t
bad = {c for q in paras for c in q[1]
       if not (c.isalnum() or c in ' ,.;:!?()—–’„”«»…\'-')
       or 0xe000 <= ord(c) <= 0xf8ff or ord(c) in (0xc17, 0xc1d)}
assert not bad, bad


def page_at(q, i):
    return max([q[0]]+[g for o, g in q[2] if o <= i])


flat, where = '', []
for pi, q in enumerate(paras):
    for k, c in enumerate(q[1]):
        if c != ' ':
            flat += c
            where.append((pi, k))
idx = json.loads((R/'dane/indeks_cytatow.json').read_text(encoding='utf-8'))
topics = ["Pensjonat pani Vauquer", "Studia Rastignaca", "Córki Goriota", "Paryskie salony i protekcja",
          "Tożsamość Vautrina", "Opiekunka Wiktoryny", "Zgniatanie i sprzedaż sreber",
          "Nazwisko Goriot w salonie", "Spisek wobec brata Wiktoryny", "Pomoc lekarska Bianchona",
          "Od dostatku do nędzy", "Finanse Anastazji i Delfiny", "Demaskacja Vautrina",
          "Prośba o pomoc do rodziny", "Program Vautrina: droga do sukcesu", "Rastignac i moralny wybór",
          "Status społeczny a traktowanie ludzi", "Pogrzeb i wyzwanie rzucone Paryżowi"]
cover = re.sub(r'\s+', ' ', d[0].get_text())
for t in topics:
    assert t in cover, t
quotes, fixed = {}, []
for c in idx['citations']:
    s = re.sub(r'\s', '', c['quote'])
    assert flat.count(s) == 1, (c['id'], flat.count(s))
    i = flat.index(s)
    (p0, a), (p1, b) = where[i], where[i+len(s)-1]
    seg = [[p, a if p == p0 else 0, b+1 if p == p1 else len(paras[p][1])] for p in range(p0, p1+1)]
    assert page_at(paras[p0], a) == page_at(paras[p1], b) == c['book_page'] == c['integrated_pdf_page']-OFFSET, c['id']
    assert any(an.type[1] == 'Highlight' for an in d[c['integrated_pdf_page']-1].annots()), c['id']
    text = [paras[p][1][u:v] for p, u, v in seg]
    if ' '.join(text) != c['quote']:
        fixed.append(c['id'])
    quotes[c['id']] = dict(id=c['id'], t=c['question'], title=c['title'], desc=c['description'],
                           page=c['book_page'], text=text, seg=seg, rows=[], links=[], areas=[])
html = (R/'index.html').read_text(encoding='utf-8')
D = json.loads(re.search(r'id="data">(.*?)</script>', html, re.S).group(1))
A = {a['id']: a for a in D['areas']}
L = {tuple(sorted(l[:2])) for l in D['links']}
for line in (R/'dane/powiazania.txt').read_text(encoding='utf-8').splitlines():
    if not line.strip() or line[0] == '#':
        continue
    f = [x.strip() for x in line.split('|')]
    for q in (quotes[g] for g in f[0].split()):
        if len(f) == 3:
            m = [i for i, r in enumerate(A[int(f[1])]['rows']) if r[0].startswith(f[2])]
            assert len(m) == 1, line
            q['rows'].append([int(f[1]), m[0]])
        elif '-' in f[1]:
            k = sorted(map(int, f[1].split('-')))
            assert tuple(k) in L, line
            q['links'].append(k)
        else:
            assert int(f[1]) in A, line
            q['areas'].append(int(f[1]))


def js(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


def out(name, var, o):
    (R/name).write_text(f'window.{var}={js(o)};\n', encoding='utf-8', newline='\n')


out('cytaty.js', 'CYTATY', {'topics': topics, 'quotes': list(quotes.values())})
out('tekst.js', 'POWIESC', paras)
v = quotes.values()
print('akapity', len(paras), 'znaki', sum(len(q[1]) for q in paras), 'cytaty', len(v), 'poprawione spacje', fixed)
print('przy przykładach', sum(bool(q['rows']) for q in v), 'powiązań', sum(len(q['rows']) for q in v),
      'różnych przykładów', len({tuple(r) for q in v for r in q['rows']}),
      'relacji', len({tuple(r) for q in v for r in q['links']}),
      'do obszaru', [q['id'] for q in v if q['areas']],
      'tylko atlas', [q['id'] for q in v if not (q['rows'] or q['links'] or q['areas'])])
