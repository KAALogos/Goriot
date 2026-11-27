"""Ilustrowany przekrój pensjonatu (warstwy do animacji).

python -I tools/buduj_dom.py

Wejście: zrodla_obrazy/dom_gpt/drive/Ojciec Goriot - dom/ (obrazy z ChatGPT, poza repozytorium).
Wyjście: img/dom/*.webp — dom w dzień i wieczorem (1000 i 2000 px), postacie i efekty z przezroczystym tłem.
Pozycje pokoi i postaci są w modul.js (procenty kadru), więc kadr domu nie może się zmieniać.
"""
import sys, pathlib
from collections import deque
import numpy as np
from PIL import Image, ImageFilter
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent
SRC = R / 'zrodla_obrazy/dom_gpt/drive/Ojciec Goriot - dom'
OUT = R / 'img/dom'; OUT.mkdir(parents=True, exist_ok=True)


def house():
    for src, name in (('dom_A_dzien_pusty_5016.png', 'dzien'), ('dom_B_wieczor_pusty_5016.png', 'wieczor')):
        im = Image.open(SRC / src).convert('RGB')
        for w in (1000, 2000):
            im.resize((w, w), Image.LANCZOS).save(OUT / f'dom_{name}-{w}.webp', 'WEBP', quality=82, method=6)


def components(mask):
    """Spójne składowe maski: lista (rozmiar, dotyka brzegu, tablica indeksów)."""
    h, w = mask.shape
    seen = np.zeros_like(mask); out = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]: continue
        seen[y0, x0] = True; q = deque([(y0, x0)]); pts = []; edge = False
        while q:
            y, x = q.popleft(); pts.append((y, x))
            if y in (0, h - 1) or x in (0, w - 1): edge = True
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; q.append((ny, nx))
        out.append((len(pts), edge, np.array(pts)))
    return out


def cutout(im, tol=22):
    """Białe tło -> przezroczystość: obszary białe przy brzegu i duże białe prześwity (np. między szczeblami krzesła).
    Potem zostaje tylko największa nieprzezroczysta składowa i jej bliskie otoczenie (bez okruchów z sąsiednich kadrów)."""
    a = np.asarray(im.convert('RGB'), dtype=np.int16)
    h, w, _ = a.shape
    small = max(1, w // 400)
    white = (a.min(2) > 255 - tol) & ((a.max(2) - a.min(2)) < 18)
    ws = np.asarray(Image.fromarray(white.astype('uint8') * 255).resize((w // small, h // small), Image.NEAREST)) > 128
    bg = np.zeros(ws.shape, bool)
    for n, edge, pts in components(ws):
        if edge or n > 60: bg[pts[:, 0], pts[:, 1]] = True
    fg = ~bg
    comps = sorted(components(fg), key=lambda c: -c[0])
    keep = np.zeros(ws.shape, bool)
    if comps:
        big = comps[0][0]
        for n, edge, pts in comps:
            if n >= big * .02: keep[pts[:, 0], pts[:, 1]] = True
    up = lambda m: np.asarray(Image.fromarray(m.astype('uint8') * 255).resize((w, h), Image.NEAREST)) > 128
    grow = np.asarray(Image.fromarray(bg.astype('uint8') * 255).filter(ImageFilter.MaxFilter(3))) > 128
    bg = (up(grow) & white) | up(fg & ~keep)
    alpha = Image.fromarray(np.where(bg, 0, 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    out = im.convert('RGB').copy(); out.putalpha(alpha)
    return out.crop(out.getbbox())


def save(im, name, height):
    w = round(im.width * height / im.height)
    im.resize((w, height), Image.LANCZOS).save(OUT / f'{name}.webp', 'WEBP', quality=86, method=6)
    print(name, w, height)


FIG = {  # plik źródłowy, kadr (ułamki szerokości/wysokości) przed wycięciem
    'goriot': ('postac_goriot.png', (0, 0, .62, 1)),  # bez kominka i świecy (kominek jest w pokoju)
    'rastignac': ('postac_rastignac.png', None), 'vautrin': ('postac_vautrin.png', None),
    'vauquer': ('postac_vauquer.png', None), 'couture': ('postac_couture.png', None),
    'wiktoryna': ('postac_wiktoryna.png', None), 'michonneau': ('postac_michonneau.png', None),
    'poiret': ('postac_poiret.png', None), 'sylwia': ('postac_sylwia_wariant_02.png', None),
    'krzysztof': ('postac_krzysztof.png', None), 'kot': ('postac_kot.png', None),
}


def figures():
    for name, (f, box) in FIG.items():
        im = Image.open(SRC / f).convert('RGB')
        if box: im = im.crop((round(box[0] * im.width), round(box[1] * im.height), round(box[2] * im.width), round(box[3] * im.height)))
        save(cutout(im), 'postac_' + name, 300 if name != 'kot' else 120)


def effects():
    for name in ('dym', 'plomien'):
        im = Image.open(SRC / f'efekt_{name}.png').convert('RGB')
        for i in range(3):
            part = im.crop((i * im.width // 3, 0, (i + 1) * im.width // 3, im.height))
            save(cutout(part, tol=12), f'efekt_{name}_{i + 1}', 220 if name == 'dym' else 90)


if __name__ == '__main__':
    if "--bez-domu" not in sys.argv: house()
    figures(); effects()
