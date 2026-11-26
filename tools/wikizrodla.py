"""Pobiera tekst z Wikiźródeł i zapisuje akapity ze stronami druku.

python -I tools/wikizrodla.py

Wynik: dane/boy_1938.json (Ojciec Goriot, przekład Boya, 1938)
       dane/boy_balzak_1934_r8.json (T. Boy-Żeleński, „Balzak”, rozdz. 8)
Format akapitu: [strona_druku, tekst, [[pozycja, strona_druku], ...]].
Strona druku = numer skanu DjVu minus przesunięcie (sprawdzone na obrazach skanów).
Ukryty tekst szablonu korekty (span.n0kh) jest pomijany, zostaje forma poprawiona.
"""
import json, re, sys, pathlib, urllib.parse, urllib.request
from html.parser import HTMLParser

R = pathlib.Path(__file__).resolve().parent.parent
API = 'https://pl.wikisource.org/w/api.php?action=parse&format=json&prop=text&page='
UA = {'User-Agent': 'Mozilla/5.0 (compatible; GoriotStudy/1.0)'}


class Parser(HTMLParser):
    def __init__(self, offset):
        super().__init__()
        self.shift, self.paras, self.cur, self.page, self.skip = offset, [], None, None, 0

    def new(self):
        if self.cur and self.cur['t'].strip():
            self.paras.append(self.cur)
        self.cur = {'p': self.page, 't': '', 'brk': []}

    def handle_starttag(self, t, a):
        a = dict(a)
        c = a.get('class') or ''
        if self.skip:
            if t not in ('br', 'img'):
                self.skip += 1
            return
        if (t == 'sup' and 'reference' in c) or 'n0kh' in c or (t == 'ol' and 'references' in c):
            self.skip = 1
            return
        if t == 'span' and 'ws-pagenum' in c:
            self.page = int(re.search(r'/(\d+)$', a['title']).group(1)) - self.shift
            self.skip = 1
            if self.cur is not None and self.cur['t'].strip():
                self.cur['brk'].append([len(self.cur['t']), self.page])
            return
        if t == 'span' and c == '_tb':
            self.new()
            self.skip = 1
            return
        if t == 'p' or (t == 'div' and 'poem' in c):
            self.new()
        if t == 'br':
            self.text(' ')

    def handle_endtag(self, t):
        if self.skip:
            self.skip -= 1
        elif t == 'p':
            self.new()

    def handle_data(self, d):
        if not self.skip:
            self.text(d)

    def text(self, d):
        if self.cur is None:
            self.new()
        if not self.cur['t'].strip():
            self.cur['p'] = self.page
        self.cur['t'] += d


def fetch(title, offset, start, end):
    url = API + urllib.parse.quote(title)
    h = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA)))['parse']['text']['*']
    p = Parser(offset)
    p.feed(h[h.find('prp-pages-output'):])
    p.new()
    out = []
    for x in p.paras:
        raw = x['t']
        t = re.sub(r'\s+', ' ', raw).strip()
        if not t or x['p'] is None:
            continue
        brk = []
        for o, g in x['brk']:
            pre = re.sub(r'\s+', ' ', raw[:o]).lstrip()
            brk.append([len(pre), g])
        out.append([x['p'], t, brk])
    a = next(i for i, x in enumerate(out) if x[1].startswith(start))
    b = next(i for i, x in enumerate(out) if x[1].startswith(end))
    return out[a:b + 1]


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    for name, title, offset, start, end in [
        ('boy_1938.json', 'Ojciec_Goriot_(Balzac,_1938)/Ojciec_Goriot', 4, 'Pani Vauquer', 'Saché'),
        ('boy_balzak_1934_r8.json', 'Balzak/8._„Komedja_ludzka“_na_tle_epoki', 11, 'Aby dać', 'Jeżeli zważymy'),
    ]:
        paras = fetch(title, offset, start, end)
        (R / 'dane' / name).write_text(json.dumps(paras, ensure_ascii=False), encoding='utf-8')
        pages = sorted({x[0] for x in paras} | {g for x in paras for _, g in x[2]})
        print(name, len(paras), 'akapitów', sum(len(x[1]) for x in paras), 'znaków, s.', pages[0], '–', pages[-1])
