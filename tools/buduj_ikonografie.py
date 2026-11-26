"""Moduł ikonograficzny: wersje do sieci + ikonografia.js.

python -I tools/buduj_ikonografie.py <folder_z_raport_pobrania.json>

- Czyta raport downloadera (raport_pobrania.json) i dane/ikonografia.json (opisy zweryfikowane ręcznie).
- Używa wyłącznie wpisów ze statusem OK; ponownie liczy SHA-256 masterów.
- Wersje do sieci: WebP o szerokości 1200 px i JPG o szerokości 2400 px; gdy oryginał jest węższy,
  zostaje jego szerokość (bez powiększania). Bez kadrowania, retuszu i uzupełniania.
- Mastery zostają nietknięte poza repozytorium (folder downloadera).
"""
import json, sys, hashlib, pathlib
from PIL import Image, ImageOps
import numpy as np
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1])
report = {r['id']: r for r in json.loads((SRC / 'raport_pobrania.json').read_text(encoding='utf-8'))}
D = json.loads((R / 'dane/ikonografia.json').read_text(encoding='utf-8'))
OUT = R / 'img/telemak'
OUT.mkdir(parents=True, exist_ok=True)
items, errors = [], []
for e in D['items']:
    r = report.get(e['id'])
    if not r or r['status'] != 'OK':
        print('POMINIĘTO (brak statusu OK):', e['id'])
        continue
    master = SRC / r['file']
    sha = hashlib.sha256(master.read_bytes()).hexdigest()
    if sha != r['sha256']:
        errors.append(e['id'] + ': SHA-256 mastera niezgodne z raportem')
        continue
    im = Image.open(master)
    im = ImageOps.exif_transpose(im)
    if im.mode not in ('RGB', 'L'):
        im = im.convert('RGB')
    if im.mode == 'L':
        im = im.convert('RGB')
    W, H = im.size
    MW, MH = W, H

    def derive(im, tag=''):
        W, H = im.size
        out = {}
        for name, width, fmt, q in (('web', 1200, 'WEBP', 82), ('bg', 1920, 'WEBP', 78), ('full', 2400, 'JPEG', 88)):
            w = min(width, W)
            h = round(H * w / W)
            res = im if w == W else im.resize((w, h), Image.LANCZOS)
            fn = f"{e['id']}{tag}-{w}.{'webp' if fmt == 'WEBP' else 'jpg'}"
            res.save(OUT / fn, fmt, quality=q, **({'method': 6} if fmt == 'WEBP' else {'optimize': True, 'progressive': True}))
            out[name] = {'src': f'img/telemak/{fn}', 'w': w, 'h': h}
        return out
    out = derive(im)
    if e.get('rectify'):
        # prostowanie perspektywy: cztery narożniki pola sceny (TL, TR, BR, BL) w skali szerokości 1000 px
        k = W / 1000
        P = [(x * k, y * k) for x, y in e['rectify']['corners_1000w']]
        dist = lambda a, b: ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** .5
        RW = int(max(dist(P[0], P[1]), dist(P[3], P[2])))
        RH = int(max(dist(P[0], P[3]), dist(P[1], P[2])) * e['rectify'].get('stretch_h', 1))
        A, B = [], []
        for (x, y), (u, v) in zip([(0, 0), (RW, 0), (RW, RH), (0, RH)], P):
            A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
        c = np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()
        rim = im.transform((RW, RH), Image.PERSPECTIVE, c, Image.BICUBIC)
        t = e['rectify'].get('trim', 0)
        rim = rim.crop((round(RW * t), round(RH * t), round(RW * (1 - t)), round(RH * (1 - t))))
        out = {**derive(rim, '-scena'), 'room': out}
    W, H = MW, MH
    items.append({**e, 'license': e.get('license_label') or r['actual_license'], 'license_url': r['license_url'] or e.get('license_url_fallback'),
                  'source': r['source'], 'master': {'file': r['filename'], 'w': W, 'h': H, 'bytes': r['size'],
                                                    'sha256': sha, 'mime': 'image/tiff' if r['filename'].endswith('.tif') else 'image/jpeg'},
                  'img': out})
    print('OK', e['id'], (W, H), '->', out['web']['w'], out['full']['w'])
if errors:
    print('BŁĘDY', *errors, sep='\n  ')
    sys.exit(1)
for e in items:
    for k in ('title', 'caption', 'credit', 'group'):
        assert e.get(k), (e['id'], k)
    if 'BY-SA' in e['license'] and 'BY-SA' not in e.get('derivative_license', ''):
        sys.exit(e['id'] + ': adaptacja CC BY-SA bez licencji pochodnej')
(R / 'ikonografia.js').write_text('window.IKONO=' + json.dumps({'intro': D['intro'], 'groups': D['groups'], 'items': items, 'episodes': D.get('episodes', []), 'modules': D.get('modules', {}), 'opening': D.get('opening'), 'order_note': D.get('order_note')},
                                  ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
(R / 'img/telemak/LICENCJE.md').write_text('\n'.join(
    ['# Fotografie tapety „Paysage de Télémaque dans l’île de Calypso” — licencje', '',
     'Pliki w tym folderze to zmniejszone wersje (WebP 1200 px, JPG do 2400 px) oryginałów z Wikimedia Commons;',
     'bez retuszu, uzupełniania i powiększania. Pliki `*-scena-*` to zdjęcia z Wismaru z wyprostowaną perspektywą',
     '(przekształcenie geometryczne pola sceny w ramie, narożniki zapisane w dane/ikonografia.json, pole `rectify`) i przycięte do tego pola.',
     'Oryginały (mastery) przechowywane lokalnie poza repozytorium.', ''] +
    [f"- `{e['img']['web']['src'].split('/')[-1]}`, `{e['img']['full']['src'].split('/')[-1]}` — {e['title']}. {e['credit']}. "
     f"Źródło: {e['source']}. Licencja oryginału: {e['license']}" + (f" ({e['license_url']})" if e['license_url'] else '') +
     (f". Wersje pochodne: {e['derivative_license']}." if e.get('derivative_license') else '.') +
     f" Master: {e['master']['file']} {e['master']['w']}×{e['master']['h']}, SHA-256 {e['master']['sha256']}."
     for e in items]) + '\n', encoding='utf-8')
print('ikonografia.js:', len(items), 'obrazów')
