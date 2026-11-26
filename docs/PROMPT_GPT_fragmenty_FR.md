# PROMPT DLA GPT — „Ojciec Goriot”: fragmenty do omawiania na podstawie źródeł francuskich

(wklej całość jako pierwszą wiadomość)

## Kontekst
Budujemy stronę edukacyjną o „Ojcu Goriot” Balzaka dla polskiego liceum (https://kaalogos.github.io/Goriot/), w dwóch polskich przekładach: Amelia Bortnowska (1881, Wolne Lektury) i Tadeusz Boy-Żeleński (1938, Wikiźródła). Potrzebujemy zestawu **pełnych fragmentów do omawiania na lekcji**, tak jak w naszych projektach „Lalka” i „Hamlet”: czytelne całości (zwykle 400–2000 słów), z jasnymi granicami, a nie krótkie cytaty. Wybór ma się opierać na **francuskiej tradycji szkolnej i akademickiej**: które fragmenty Francuzi najczęściej analizują (lectures analytiques / explications linéaires, bac de français, manuele, dossiery wydań szkolnych).

## Zadanie
1. **Kwerenda francuska.** Przejrzyj źródła francuskie i ustal, które fragmenty powieści są kanoniczne w nauczaniu. Sprawdź co najmniej:
   - Éduscol i programy bac de français (czy i kiedy „Le Père Goriot” był w programie; jakie parcours),
   - strony akademii (ac-versailles, ac-paris, ac-lyon itd.) i sekwencje dydaktyczne nauczycieli,
   - wydania szkolne z dossier: Classiques Larousse, Folioplus classiques, GF-Flammarion, Hatier „Classiques & Cie”, Magnard, Belin-Gallimard; „Profil d'une œuvre” (Hatier),
   - Gallica (BnF) — wydanie Furne 1843 i Werdet 1835 do kotwic tekstu,
   - Maison de Balzac (Paris Musées), artykuły w otwartym dostępie (Persée, OpenEdition, Cairn – tylko streszczenia, jeśli brak dostępu).
2. **Wytypuj 10–14 fragmentów** w kolejności fabuły. Dla każdego podaj:
   - `fragment_id` (np. `FR_INCIPIT_PENSION`), `tytul_pl`, `tytul_fr`,
   - część/rozdział według wydania Furne (np. „Une pension bourgeoise”, „L'entrée dans le monde”, „Trompe-la-Mort”, „La mort du père”),
   - **kotwice po francusku**: pierwsze ok. 8–12 słów fragmentu i ostatnie ok. 8–12 słów (dosłownie, z Gallica lub Wikisource FR; podaj link do miejsca),
   - przybliżoną długość w słowach,
   - **uzasadnienie wyboru**: w ilu i w jakich źródłach francuskich ten fragment się pojawia (lista linków z typem: programme / académie / manuel / édition scolaire / article),
   - 3–5 tematów (np. pieniądz, ojcostwo, inicjacja, Paryż, maska społeczna, realizm opisu),
   - funkcję w kompozycji (1–2 zdania),
   - 2 zadania typu P (rozumienie tekstu) i 2 typu R (interpretacja, porównanie), z **kluczem opartym na tekście** (wskaż, które zdania fragmentu uzasadniają odpowiedź — po francusku, krótko).
3. **Kandydaci odrzuceni.** Wymień fragmenty często cytowane, których nie wybrałeś, i powód.

## Dla porównania — fragmenty, które już mamy na stronie (krótkie cytaty, nie pełne fragmenty)
opis pensjonatu i pani Vauquer; Goriot zgniatający srebra; pierwsza wizyta Rastignaca u Restaudów; lekcja pani de Beauséant; lekcja Vautrina (protekcja, posag, „nie ma zasad”); listy do matki i sióstr; paradoks mandaryna (Rastignac–Bianchon); los Wiktoryny i pojedynek Taillefera; demaskacja Vautrina; agonia i pogrzeb Goriota; finał na Père-Lachaise. Możesz je potwierdzić, poszerzyć do pełnych fragmentów albo zastąpić lepszymi.

## Zasady
- Nie wymyślaj źródeł, numerów stron, cytatów ani programów. Każde twierdzenie poprzyj linkiem, który faktycznie otworzyłeś. Jeśli strona się nie otworzyła, napisz to.
- Oddzielaj źródła oficjalne (programmes, Éduscol) od akademickich i od stron prywatnych/komercyjnych (oznacz typ).
- Cytuj po francusku tylko kotwice i krótkie uzasadnienia z tekstu Balzaka (domena publiczna). Nie przepisuj współczesnych opracowań.
- Kotwic nie tłumacz — polskie granice ustalimy sami w obu przekładach.
- Jeśli francuskie źródła nie są zgodne co do granic fragmentu, podaj warianty.

## Format wyniku (paczka ZIP do folderu Dysku `ChatGPT/Ojciec Goriot - fragmenty`)
- `fragmenty_fr.json` — lista obiektów z polami jak w punkcie 2 (`fragment_id`, `kolejnosc`, `tytul_pl`, `tytul_fr`, `czesc_furne`, `kotwica_start_fr`, `kotwica_koniec_fr`, `link_tekst`, `dlugosc_slow`, `zrodla[{url, typ, co_mowi}]`, `liczba_zrodel`, `tematy[]`, `funkcja`, `zadania[{typ:'P'|'R', polecenie, klucz, zdania_uzasadniajace_fr}]`, `warianty_granic`),
- `RAPORT.md` — podsumowanie kwerendy: przejrzane źródła, ranking fragmentów według częstości, wątpliwości,
- `README_DLA_CLAUDE.md` — stan rzeczywisty (co otwarto, czego nie udało się sprawdzić).
