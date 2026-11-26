"""Eksport wszystkich tekstów widocznych na stronie do audytu językowego.

python -I tools/eksport_tekstow.py  ->  docs/audyt_jezyka/TEKSTY_STRONY.md

Każdy tekst ma identyfikator (ID), po którym poprawki da się wprowadzić z powrotem.
Cytaty z powieści NIE są eksportowane (nie poprawiamy przekładów).
"""
import json, re, sys, pathlib
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent
O = json.loads((R / 'dane/opracowanie.json').read_text(encoding='utf-8'))
F = json.loads((R / 'dane/fragmenty.json').read_text(encoding='utf-8'))
html = (R / 'index.html').read_text(encoding='utf-8')
D = json.loads(re.search(r'<script type="application/json" id="data">(.*?)</script>', html, re.S).group(1))
js = (R / 'modul.js').read_text(encoding='utf-8')
out, n = [], 0


def add(i, t):
    global n
    if t and t.strip():
        out.append(f'| {i} | {t.strip().replace("|", "/")} |'); n += 1


def head(t):
    out.extend(['', f'## {t}', '', '| ID | Tekst |', '|---|---|'])


head('Tytuły działów, kafli i sekcji (kod strony)')
for k, v in re.findall(r"(\w+): '([^']+)'", re.search(r"const NAMES = \{([^}]*)\}", js).group(1)):
    add(f'dzial.{k}', v)
for i, (k, t, d) in enumerate(re.findall(r"\['(\w+)', '([^']+)', '([^']+)'", js[js.index('const T = ['):js.index('for (const [k, title, desc')])):
    add(f'kafel.{k}.tytul', t); add(f'kafel.{k}.opis', d)
for i, (t, sub) in enumerate(re.findall(r"section\('([^']+)', (?:'([^']*)'|null)", js)):
    add(f'sekcja.{i:02d}.tytul', t); add(f'sekcja.{i:02d}.opis', sub)
head('Sceny do omawiania')
for s in F['scenes']:
    add(f"{s['id']}.tytul", s['title']); add(f"{s['id']}.czesc", s['part']); add(f"{s['id']}.wprowadzenie", s['lead'])
    for j, q in enumerate(s['questions']): add(f"{s['id']}.pytanie{j+1}", q)
    for j, t in enumerate(s.get('tasks', [])):
        add(f"{s['id']}.zadanie{j+1}", t['q']); add(f"{s['id']}.klucz{j+1}", t['key'])
head('Bohaterowie')
for c in O['characters']: add(f"postac.{c['id']}.rola", c['role'])
for c in O['cards']: add(f"karta.{c['id']}.opis", c['short'])
for r in O['relations']: add(f"relacja.{r['id']}", r['label'])
head('Pensjonat')
for k, r in O['pension']['rooms'].items():
    add(f'pokoj.{k}.synteza', r.get('synth')); add(f'pokoj.{k}.opis', r.get('desc') if isinstance(r.get('desc'), str) and not re.fullmatch(r'[PG]\d+', r.get('desc') or '') else None)
for m in O['pension']['moves']:
    for j, st in enumerate(m['steps']): add(f"przeprowadzka.{m['who']}.{j+1}", st['text'])
head('Pieniądz i awans')
for m in O['mechanisms']: add(f"mechanizm.{m['id']}.nazwa", m['name']); add(f"mechanizm.{m['id']}.opis", m['def'])
for a in O['axes']:
    add(f"los.{a['id']}.tytul", a['title'])
    for j, st in enumerate(a['steps']): add(f"los.{a['id']}.{j+1}", st['text'])
head('Tezy (sekcje „W skrócie” i interpretacje)')
for t in O['theses']: add(f"teza.{t['id']}", t['text']); add(f"teza.{t['id']}.uwaga", t.get('note'))
head('Epoka: chronologia')
for j, e in enumerate(O['timeline']['world']): add(f'chronologia.{j+1}', f"{e['date']}: {e['text']}")
head('Porównania')
for c in O['contexts']:
    add(f"porownanie.{c['id']}.temat", c['theme']); add(f"porownanie.{c['id']}.wspolne", c['common']); add(f"porownanie.{c['id']}.roznica", c['diff'])
head('Obyczaje: mapa i katalog')
for g in D['groups']: add(f"sfera.{g['title']}", g['title'])
for a in D['areas']:
    add(f"obszar.{a['id']:02d}", a['title'])
    for j, r in enumerate(a['rows']): add(f"obszar.{a['id']:02d}.{j+1}", f'{r[0]} — {r[1]}')
for l in D['links']: add(f'powiazanie.{l[0]}-{l[1]}', l[2])
dst = R / 'docs/audyt_jezyka'; dst.mkdir(parents=True, exist_ok=True)
(dst / 'TEKSTY_STRONY.md').write_text('# Teksty strony „Ojciec Goriot” do audytu językowego\n\nWszystkie teksty widoczne na stronie poza cytatami z powieści. Kolumna ID służy do wprowadzenia poprawek.\n' + '\n'.join(out) + '\n', encoding='utf-8')
print('teksty:', n)
