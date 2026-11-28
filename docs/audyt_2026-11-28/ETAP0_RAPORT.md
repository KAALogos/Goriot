# Goriot — weryfikacja audytu z 28.11.2026 (ETAP 0)

Status: **DONE_PARTIAL**. Weryfikacja wykonana; pełnego testu WCAG, Lighthouse, telewizora i testów z uczniami nie wykonano (szczegóły w sekcji „Ograniczenia”).

## 1. Stan wejściowy

| | |
|---|---|
| Repozytorium | KAALogos/Goriot, gałąź `main`, czyste drzewo poza nieśledzonym `docs/ilustracja_dom/PROJEKT_LISTU_VAUQUER_3D.md` |
| HEAD wejściowy = origin/main = Pages | `2822456` (Pages: `built`, ten sam SHA) |
| HEAD po etapie 0 (lokalnie, **bez push**) | `8e239e3` — poprawka 4 numerów stron w cytatach przy pokojach (patrz 3.1) |
| AGENTS.md / CLAUDE.md w repo Goriot | brak obu plików (sprawdzone `ls`) |
| Standardy logos-lab | router `standards/README.md` odczytany. Pliki zadaniowe leżą w **`standards/standards/`** (stąd 404 w audycie). Odczytane: `00_CORE`, `02_EVIDENCE`, `04_DESIGN`, `07_CODE_TESTING`, `08_EDUCATION`, `10_ACCEPTANCE` |
| Przeglądarka testowa | Chrome 156.0.8078.100 (panel przeglądarki aplikacji), serwer lokalny z HEAD |

## 2. Liczby bazowe — porównanie z HEAD

Wszystkie liczby z audytu potwierdzone na HEAD: 333 praktyki / 21 obszarów / 46 relacji (`script#data`); 40 cytatów atlasu + 46 fragmentów; 14 scen, 56 zadań (28 P, 28 R), 56 pytań; 43 tezy (14 fakt, 24 interpretacja, 5 kontekst); statusy tez: tekst 10, źródło 20, źródło-fragment 8, autorska 5; 16 postaci, 16 relacji, 8 mechanizmów, 4 osie, 4 konteksty; Quint 121 rekordów; ikonografia 10 rekordów.

## 3. Testy integralności (`tools/test_integralnosci.py`, nowy skrypt, bez `eval`)

Wynik: `docs/audyt_2026-11-28/test_integralnosci_wynik.txt` — **9/9 PASS** po poprawce 3.1.

| Test | Wynik |
|---|---|
| Segmenty cytatów atlasu — Bortnowska / Boy | 40/40, 40/40 |
| Segmenty fragmentów opracowania — Bortnowska / Boy | 46/46, 46/46 |
| Pole `page` fragmentów zgodne z tekstem (z łamaniem stron wewnątrz akapitu) | 92/92 |
| Zakresy scen (istnienie from/to, strony) — obie edycje | 28/28 |
| Cytaty w kluczach zadań mieszczą się w tekście sceny (nowy test) | 112/112 |
| Cytaty przy pokojach: dosłowne i z właściwą stroną (nowy test) | 14/14 (przed poprawką 10/14) |
| Odsyłacze G/P/T w całych danych (rozszerzone poza tezy) | 237/237 |

Uwaga do metody: audyt liczył 122/122 i 121/121 segmentów jako sumę; tu raportuję osobno per zbiór. Pierwsza wersja mojego testu stron dała fałszywe błędy, bo akapit może zawierać łamanie strony (`[[offset, strona]]`); poprawiony test uwzględnia to.

### 3.1 Błąd znaleziony i poprawiony lokalnie
Cytaty przy pokojach dodane 27.11 (sylwia, goriot, vauquer, jadalnia) miały stronę o 1 za niską — brałem stronę początku akapitu. Poprawione w `8e239e3`, test 14/14. **Na stronie publicznej nadal są złe numery** — wymaga zgody na push.

## 4. Punkty audytu — status na HEAD

| Punkt | Status | Dowód |
|---|---|---|
| Wstecz nie odtwarza eksploracji (`replaceState`) | **potwierdzony** | `modul.js:625, 670, 710, 766, 776` — tylko `replaceState`. Test: start → Sceny → scena → `history.back()` opuścił aplikację (wróciło do poprzedniego dokumentu). Wyjątek: czytnik w `atlas.js:172` używa `pushState` i `popstate` — wzorzec do powielenia |
| Intro przy deep linkach modułów/scen | **potwierdzony** | `plansze.js:25` pomija tylko `cytat/fragment/strona`. Test 1920×1080: `#modul-paryz` i `#scena-F05` pokazują planszę „Wejdź” |
| Animacje sekcji przy powrotach | **częściowo / już istnieje** | `plansze.js:80` — drugi i kolejny wjazd w sesji jest skrócony (`fast`, 0,9 s zamiast 2,6 s); reduced motion wyłącza (2 reguły CSS + `reduce` w JS). Brakuje tylko pominięcia przy deep linku |
| Kolumna „Str.” katalogu niezależna od przekładu | **potwierdzony** | Tryb Boy, ten sam wiersz: „Str. 14–16” (Bortnowska, statyczne dane) obok przycisku „Cytat, s. 43” (Boy). Kolumna nie mówi, której edycji dotyczy |
| `#edges`, `#alllinks` ukryte | **potwierdzony, zgodny z decyzją** | `wyglad.css:67, 98`. Nie przywracać — zgodnie z audytem |
| Ukryty tablist przy panelach ARIA | **potwierdzony** | `wyglad.css:7` `.tabs{display:none!important}`; 11 `role=tab`, panele `role=tabpanel` z `aria-labelledby` na ukryty przycisk. Nawigacja realnie odbywa się kaflami i „← Wszystkie działy”. Semantyka zakładek jest myląca dla czytnika ekranu; test z czytnikiem **nie wykonany** |
| `thesis()` liczy status, nie wyświetla (`void st`) | **potwierdzony, ale to decyzja autora** | wprowadzone w `8b1b0d9` „… mniej meta” — świadome ukrycie etykiet. Patrz 6 |
| Bibliografia bez informacji o częściowym odczycie | **częściowo** | `modul.js:752` ukrywa źródła „nieodczytany/niedostępny”; S-VINC („odczytano tylko s. 3”) jest wyświetlane bez tej uwagi; jedyna teza oparta na nim (T03) cytuje dokładnie s. 3 |
| Tapeta Dufoura jako hipoteza | **już istnieje** | `dane/ikonografia.json:3, 11–12`: „fotografie zachowanych egzemplarzy panoramy… na ten temat” i jawna niezgodność chronologii (40 lat vs 1818) |
| Posag | **potwierdzony częściowo** | Teza T27 trzyma się tekstu (status „tekst”). Ale definicja mechanizmu „posag” uogólnia: „przechodzi pod kontrolę męża”. Za ustroje majątkowe Kodeksu 1804 (wspólność, dotalny, rozdzielność; separacja majątkowa wątkiem powieści) — **źródła prawnego nie odczytano**, poprawka dopiero po weryfikacji tekstu kodeksu |
| Chronologia publikacji | **częściowo** | Oś ma: pisanie IX 1834–26 I 1835 (S-VINC), podpis „Saché”, przekłady. Brak druku w „Revue de Paris” (XII 1834–II 1835) i wydania Werdeta (III 1835) — **znalezione** w Wikipedii/Britannice, nie zweryfikowane w źródle pierwszym. Data 1843 / Furne / przydział do „Scen” — **niepotwierdzone**; S-MDB (notka Maison de Balzac) w danych ma status „niedostępny” |
| Overflow mobile | **nie potwierdzony (brak problemu)** | 360 px, 10 działów: `scrollWidth = 360`, brak elementów poza ekranem; 375 px pensjonat — bez overflow (27.11) |
| Małe cele dotyku | **drobne** | jedyne < 24 px to linki w podpisach licencji (15–18 px), w tekście ciągłym — wyjątek WCAG 2.5.8 dla linków inline; do ewentualnego powiększenia |
| Błędy konsoli | **brak** | `read_console_messages(onlyErrors)` po przejściu przez 10 działów: 0 |
| Wymagania CKE | **zweryfikowane** | Rozporządzenie z 10.07.2024 (Dz.U., plik CKE `DU_programowej_2024.pdf`) i znowelizowana lista lektur CKE: ZR — „realistyczna lub naturalistyczna powieść europejska (Balzac, *Ojciec Goriot* **lub** Dickens, *Klub Pickwicka*, **lub** Gogol, *Martwe dusze*, **lub** Flaubert, *Pani Bovary*)”. Goriot jest lekturą **do wyboru** w zakresie rozszerzonym. Strona nigdzie nie twierdzi, że jest obowiązkowa (grep) |

## 5. Rekomendacje

### P0 (niezbędne)
1. **Opublikować `8e239e3`** (4 numery stron). Koszt: zerowy, ryzyko: brak. Wymaga Twojej zgody na push.
2. **UX01 — historia i deep linki.** `pushState` przy zmianie działu i sceny, `popstate` odtwarza dział/scenę (wzorzec z czytnika `atlas.js`), intro pomijane dla wszystkich hashy `#modul-…` i `#scena-…`. Istniejące deep linki zostają. Koszt: mały–średni. Ryzyko regresji: interakcja z czytnikiem, który już ma własne `pushState` — test: Wstecz/Dalej przez start → dział → scena → czytnik → zamknięcie.

### P1 (maks. 3)
1. **Merytoryka, mała łatka:** definicja „posagu” (po odczycie art. Kodeksu 1804) oraz oś publikacji (Revue de Paris, Werdet) — dopiero po weryfikacji w źródle pierwszym (eBalzac / BnF / Maison de Balzac). Koszt: mały, głównie kwerenda.
2. **Kolumna „Str.” — oznaczenie edycji.** Nagłówek „Str. (Bortnowska)” lub dopisek w trybie Boy; bez wymyślania przeliczeń stron. Koszt: bardzo mały.
3. **MVP poznawcze: dynamiczny pensjonat** (opis niżej).

### Wymaga decyzji autora
- **SRC01 — statusy tez na stronie.** Kod ma statusy, ale w `8b1b0d9` celowo je ukryłeś („mniej meta”). Audyt chce je pokazać w zwijanym „aparacie naukowym”. To sprzeczność z Twoją wcześniejszą decyzją — nie rozstrzygam.
- **Semantyka zakładek** (ukryty tablist): albo usunąć role tab/tabpanel (nawigacja kaflami), albo przywrócić widoczną listę działów. Pierwsze nie zmienia wyglądu.
- Ścieżki „Czytam / Odkrywam / Interpretuję / Matura” — zmiana architektury informacji, nie łatka.

### Odłożyć
Tryb lekcyjny (TEACH01), laboratorium interpretacji (INT01), warstwy poetyki, przepływy pieniężne, mapa, oryginał francuski, graf, 3D — każdy to osobny etap; sensownie dopiero po P0 i MVP.

## 6. MVP: dynamiczny pensjonat (propozycja)

Na istniejącym ilustrowanym przekroju — bez zmiany obrazu, geometrii pokoi i danych — pasek czterech etapów z danymi, które **już są** w sekcji „Kto się przeprowadza”: 1813 (1. piętro, 1200 fr. rocznie) → koniec 2. roku (2. piętro, 900 fr. rocznie) → koniec 3. roku (3. piętro, 45 fr. miesięcznie) → luty (śmierć w swoim pokoju). Zmianę sposobu nazywania („pan” → „ojciec” Goriot) można dodać tylko z cytatem — w danych jej jeszcze nie ma. Kliknięcie etapu: postać Goriota w odpowiednim pokoju, podświetlenie pokoju, krótki cytat ze stroną w wybranym przekładzie, przycisk do pełnego fragmentu.

Kryteria odbioru:
- każdy etap ma dosłowny cytat z obu przekładów i poprawną stronę (test automatyczny jak w p. 3);
- bez wskaźników „prestiżu”/„majątku” i bez przeliczeń na złotówki;
- pozycje 1. i 2. piętra Goriota oznaczone jako rekonstrukcja (powieść nie wskazuje konkretnego pokoju);
- działa klawiaturą, z reduced motion, na 360 px i 1920×1080, bez błędów konsoli;
- dotychczasowy przekrój i panel pokoju działają jak przed zmianą.

Koszt: średni. Zależność: P0-2 (żeby etap miał własny adres i Wstecz).

## 7. Czego nie wykonano
- Lighthouse / Core Web Vitals, pełny audyt WCAG 2.2 AA (kontrast, czytnik ekranu), test druku, test na telewizorze.
- 390×844 i 1440×900 osobno (wykonane 360×800, 375×812, 1920×1080).
- Odczyt Kodeksu cywilnego 1804 i notki Maison de Balzac; weryfikacja 333 obyczajów i wszystkich licencji.
- Testy z uczniami (wymagają ludzi).
- Benchmarki z audytu (eBalzac, Digital Dante itd.) — nie otwierane; nie są potrzebne do decyzji P0/P1.

## 8. Zmiany w repo w etapie 0
- `8e239e3` (lokalnie): `dane/opracowanie.json`, `opracowanie.js` — 4 numery stron.
- Nowe, niezacommitowane: `tools/test_integralnosci.py`, `docs/audyt_2026-11-28/` (ten raport, wynik testu, kopia audytu).
- Nic nie wypchnięto, Pages bez zmian.

---

## 9. Wdrożenie (gałąź `audyt-p1`, 28.11.2026)

| Commit | Zakres | Testy |
|---|---|---|
| `b97eb93` | UX01: `pushState`/`popstate` dla działów i scen, powrót do pozycji przewinięcia, deep linki `#modul-…`/`#scena-…` bez planszy wejściowej i bez planszy działu; czytnik (`atlas.js`) bez zmian | start → Sceny → scena → Wstecz → Wstecz → Dalej → Dalej: każdy krok właściwy widok; powrót z czytnika do tej samej pozycji; Wstecz po zamknięciu czytnika → poprzedni dział; `#modul-paryz`, `#scena-F03` bez intro |
| `d6518fc` | Posag: definicja wg Kodeksu 1804 (art. 1421, 1428, 1443, 1549; Wikiźródła, tekst niesprawdzony), nowa teza T45 i fragment P49 (separacja majątkowa Delfiny, oba przekłady); historia wydań T44 (eBalzac: Revue de Paris 4 odcinki, Werdet 1835, Furne 1843 t. IX, Furne corrigé → Sceny z życia prywatnego) | integralność 9/9; render T44, T45 |
| `36a8367` | MVP „Droga Goriota przez dom”: 3 etapy (P24+P28, G18, G19) + „1819: cały dom”; postać przenosi się, pozostali lokatorzy znikają, zaznaczony pokój (1. i 3. piętro) albo całe piętro z adnotacją rekonstrukcji (2. piętro); panel z faktami i cytatami w wybranym przekładzie; kliknięcie pokoju wraca do zwykłego widoku | 800 px i 375 px bez overflow; zmiana etapu → pokój → reset; 0 błędów konsoli; reduced motion wyłącza przejścia |

Nie wykonano: test czytnikiem ekranu, Lighthouse, test na telewizorze, test z uczniami. Miesiąc wydania Werdeta i notka Maison de Balzac (HTTP 503) — niepotwierdzone, nie wpisane.
