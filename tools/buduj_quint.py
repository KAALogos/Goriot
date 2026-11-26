"""Ilustracje Jean-Paula Quinta (Le Père Goriot, éd. Kieffer 1922) do kart postaci.

python -I tools/buduj_quint.py

Wejście: zrodla_obrazy/quint/manifest.json (oryginały z IIIF Paris Musées, CC0, poza repozytorium),
         dane/quint.json (wybór portretów, galerie wariantów, kadry z ilustracji grupowych).
Wyjście: img/quint/*.webp|jpg (wersje do sieci, bez retuszu), quint.js (window.QUINT), img/quint/LICENCJE.md.
Kadr z ilustracji grupowej powstaje tylko, gdy w dane/quint.json jest wpis z pewną identyfikacją (pole „why”).
"""
import json, sys, hashlib, pathlib
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from quint_ramka import frame
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent
SRC = R / 'zrodla_obrazy/quint'
MAN = {m['iiif']: m for m in json.loads((SRC / 'manifest.json').read_text(encoding='utf-8'))}
SEL = json.loads((R / 'dane/quint.json').read_text(encoding='utf-8'))
OUT = R / 'img/quint'; OUT.mkdir(parents=True, exist_ok=True)
CH = {c['id'] for c in json.loads((R / 'dane/opracowanie.json').read_text(encoding='utf-8'))['characters']}
err, items, used = [], {}, set()


def web(im, base):
    out = {}
    for name, width, fmt, q in (('web', 700, 'WEBP', 84), ('full', 2160, 'JPEG', 90)):
        w = min(width, im.width); h = round(im.height * w / im.width)
        r = im if w == im.width else im.resize((w, h), Image.LANCZOS)
        fn = f"{base}-{w}.{'webp' if fmt == 'WEBP' else 'jpg'}"
        r.save(OUT / fn, fmt, quality=q, **({'method': 6} if fmt == 'WEBP' else {'optimize': True, 'progressive': True}))
        out[name] = {'src': f'img/quint/{fn}', 'w': w, 'h': h}
    return out


def item(iid):
    if iid in items: return iid
    m = MAN.get(iid)
    if not m:
        err.append(f'brak oryginału {iid}'); return None
    p = SRC / m['file']
    if hashlib.sha256(p.read_bytes()).hexdigest() != m['sha256']:
        err.append(f'SHA-256 niezgodne {iid}'); return None
    if 'CC0' not in (m['rights'] or ''):
        err.append(f'licencja inna niż CC0: {iid} {m["rights"]}'); return None
    im = Image.open(p).convert('RGB')
    box = SEL.get('frames', {}).get(iid) or frame(im)
    if box: im = im.crop(tuple(box))
    items[iid] = {'id': iid, 'title': m['title'], 'desc': m['desc'], 'date': m['date'], 'url': m['url'], 'manifest': m['manifest'],
                  'rights': m['rights'], 'img': web(im, iid)}
    return iid


crops = {}
for c in SEL.get('crops', []):
    if c['char'] not in CH: err.append(f'kadr: nieznana postać {c["char"]}'); continue
    if not c.get('why'): err.append(f'kadr {c["src"]} bez uzasadnienia identyfikacji'); continue
    if not item(c['src']): continue
    im = Image.open(SRC / MAN[c['src']]['file']).convert('RGB')
    x, y, w, h = c['box']
    if not (0 <= x and 0 <= y and x + w <= im.width and y + h <= im.height): err.append(f'kadr poza obrazem {c["src"]}'); continue
    cid = f"{c['src']}-{c['char']}"
    crops[cid] = {'id': cid, 'of': c['src'], 'char': c['char'], 'why': c['why'], 'img': web(im.crop((x, y, x + w, y + h)), cid)}
cards = {}
for ch, s in SEL['cards'].items():
    if ch not in CH: err.append(f'karta: nieznana postać {ch}'); continue
    por = s.get('portrait')
    if por and por not in crops and not item(por): continue
    var = [v for v in s.get('variants', []) if v in crops or item(v)]
    cards[ch] = {'portrait': por, 'variants': var}
    used.update([por] + var)
gallery = [g for g in SEL.get('gallery', []) if g in MAN]
if err:
    print('BŁĘDY', *err, sep='\n  '); sys.exit(1)
(R / 'quint.js').write_text('window.QUINT=' + json.dumps({'credit': SEL['credit'], 'items': items, 'crops': crops, 'cards': cards, 'gallery': gallery}, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
(OUT / 'LICENCJE.md').write_text('# Ilustracje Jean-Paula Quinta do „Le Père Goriot” (Paryż, Kieffer, 1922)\n\nŹródło: Maison de Balzac, Paris Musées (IIIF). Licencja: CC0 Paris Musées / Maison de Balzac. Wersje do sieci zmniejszone (WebP 700 px, JPG do 2160 px); kadry postaci wycięte z ilustracji grupowych bez retuszu. Oryginały i pełne metadane: zrodla_obrazy/quint/manifest.json (poza repozytorium).\n\n' +
                               '\n'.join(f"- {i['img']['web']['src'].split('/')[-1]} — {i['title']}" + (f" ({i['desc']})" if i['desc'] else '') + f". {i['url']} · {i['rights']}" for i in items.values()) +
                               '\n\n## Kadry\n' + '\n'.join(f"- {c['id']}: z {c['of']} — {c['why']}" for c in crops.values()) + '\n', encoding='utf-8')
print('obrazy:', len(items), '| kadry:', len(crops), '| karty:', len(cards), '| galeria:', len(gallery))
