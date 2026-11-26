"""Pełne sceny do omawiania: dane/fragmenty.json -> fragmenty.js.

python -I tools/buduj_fragmenty.py

Sprawdza zakresy akapitów w obu przekładach, liczy słowa, zapisuje kotwice (początek
pierwszego i koniec ostatniego akapitu), aby zmiana tekstu źródłowego wywołała błąd.
"""
import json, sys, pathlib
sys.stdout.reconfigure(encoding='utf-8')
R = pathlib.Path(__file__).resolve().parent.parent


def load(f):
    s = (R / f).read_text(encoding='utf-8')
    return json.loads(s[s.index('=') + 1:].rstrip().rstrip(';'))


T = {'bort': load('tekst.js'), 'boy': load('boy.js')}
D = json.loads((R / 'dane/fragmenty.json').read_text(encoding='utf-8'))
LOCK = R / 'dane/fragmenty_kotwice.json'
lock = json.loads(LOCK.read_text(encoding='utf-8')) if LOCK.exists() else {}
out, err, prev = [], [], {'bort': -1, 'boy': -1}
for s in D['scenes']:
    e = {k: s[k] for k in ('id', 'title', 'part', 'lead', 'questions')}
    for ed in ('bort', 'boy'):
        a, b = s[ed]
        if not (0 <= a <= b < len(T[ed])):
            err.append(f"{s['id']} {ed}: zakres poza tekstem"); continue
        if a <= prev[ed]:
            err.append(f"{s['id']} {ed}: zakres nachodzi na poprzednią scenę")
        prev[ed] = b
        words = sum(len(T[ed][i][1].split()) for i in range(a, b + 1))
        anchor = [T[ed][a][1][:60], T[ed][b][1][-60:]]
        key = f"{s['id']}-{ed}"
        if key in lock and lock[key] != anchor:
            err.append(f'{key}: zmieniły się kotwice zakresu')
        lock[key] = anchor
        e[ed] = {'from': a, 'to': b, 'pages': [T[ed][a][0], T[ed][b][0]], 'words': words}
    assert len(s['questions']) >= 3, s['id']
    for t in s.get('tasks', []):
        assert t['lvl'] in ('P', 'R') and t['q'] and t['key'], (s['id'], t)
        for ed in ('bort', 'boy'):
            a2, b2 = s[ed]
            if not any(t['cite'][ed] in T[ed][i][1] for i in range(a2, b2 + 1)):
                err.append(f"{s['id']} {ed}: cytat w kluczu nie występuje w scenie: {t['cite'][ed]!r}")
    e['tasks'] = s.get('tasks', [])
    out.append(e)
if err:
    print('BŁĘDY', *err, sep='\n  '); sys.exit(1)
LOCK.write_text(json.dumps(lock, ensure_ascii=False, indent=1), encoding='utf-8')
(R / 'fragmenty.js').write_text('window.SCENY=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
for e in out:
    print(e['id'], e['title'], '| Bort', e['bort']['words'], 'słów, s.', e['bort']['pages'], '| Boy', e['boy']['words'], 'słów, s.', e['boy']['pages'])
print('OK:', len(out), 'scen')
