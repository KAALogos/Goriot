"""Wykrywa prostokąt ilustracji na zeskanowanej stronie książki (kolorowa winieta lub czarno-biały drzeworyt na beżowym papierze).

Kolor: piksele wyraźnie bardziej nasycone niż papier; czarno-biały drzeworyt: duże zwarte ciemne pole.
Tekst (drobne, nienasycone znaki) nie tworzy dużego spójnego obszaru po zmniejszeniu, więc odpada.
"""
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

K = 8


def _largest(b):
    h, w = b.shape
    seen = np.zeros_like(b, dtype=bool)
    best, bbox = 0, None
    for y in range(h):
        for x in range(w):
            if b[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; n = 0; y0 = y1 = y; x0 = x1 = x
                while q:
                    cy, cx = q.popleft(); n += 1
                    y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and b[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if n > best: best, bbox = n, (x0, y0, x1, y1)
    return best, bbox


def frame(im):
    small = im.convert('RGB').resize((im.width // K, im.height // K), Image.BILINEAR)
    a = np.asarray(small, dtype=np.float32) / 255
    mx, mn = a.max(2), a.min(2)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    paper = mx > 0.55
    ps = float(np.median(sat[paper])) if paper.any() else 0.15
    col = (sat > ps + 0.10) & ~((mx > 0.8) & (sat < ps + 0.16))
    dark = mx < 0.30
    best = None; masks = {}
    for m, close in ((col, 3), (dark, 2)):
        img = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(2 * close + 1)).filter(ImageFilter.MinFilter(2 * close - 1))
        bm = np.asarray(img) > 128
        n, bb = _largest(bm)
        if bb and n > 0.02 * m.size and (best is None or n > best[0]):
            best = (n, bb); masks['m'] = bm
    if not best:
        return None
    x0, y0, x1, y1 = best[1]; bm = masks['m']
    pad = 2
    return (max(0, (x0 - pad) * K), max(0, (y0 - pad) * K), min(im.width, (x1 + pad + 1) * K), min(im.height, (y1 + pad + 1) * K))
