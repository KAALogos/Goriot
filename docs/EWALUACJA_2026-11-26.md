# Ojciec Goriot — ewaluacja projektu (26.11.2026)

Ocena wersji opublikowanej (https://kaalogos.github.io/Goriot/) pod kątem użyteczności dla ucznia i nauczyciela. Wniosek główny: **za dużo meta, za mało funkcji.** Strona dokumentuje własną weryfikację lepiej, niż pomaga czytać powieść.

## 1. Co działa i warto zostawić
- Czytnik obu przekładów z podświetleniem fragmentu i przejściem Bortnowska ↔ Boy.
- Atlas obyczajów (mapa, katalog 333 przykładów) — gęsty, ale merytoryczny.
- Pensjonat: klikalne pomieszczenia z rzutami i opisem z tekstu.
- Plansze z tapetą — budują nastrój, nie przeszkadzają.

## 2. Meta, która nie służy uczniowi (do usunięcia z UI, zostaje w repozytorium)
| Element | Gdzie | Decyzja |
|---|---|---|
| ID tez (T01…T43), ID cytatów | Kontekst, Paryż, Mechanizmy, Poetyka, Bohaterowie | ukryć |
| Etykiety statusu („źródło odczytane”, „odczytano część źródła”, „interpretacja autorska…”) | wszystkie tezy | zastąpić jedną dyskretną etykietą: *z tekstu* / *interpretacja* |
| Rejestr tez z filtrami, tabela stanów źródeł | Źródła | przenieść do repo (docs/); w UI krótka bibliografia |
| Liczniki w nagłówku (21 · 333 · 46 · 40) | nagłówek | usunąć |
| „Grafika robocza i jej zgodność z tekstem” (8 kart weryfikacji) | Paryż | usunąć; zastąpić nowym rysunkiem domu |
| Legendy „przedmiot z tekstu / rekonstrukcja”, długie podpisy rzutów | Paryż | skrócić do jednej linii |
| Tabela praw i SHA-256, nota o kolejności epizodów | Ikonografia | przenieść do stopki/przypisów |
| Opisy „Pytania autorskie do akceptacji”, noty o przesunięciu stron | różne | usunąć z UI |

## 3. Braki funkcjonalne
1. **Brak strony startowej.** 11 zakładek bez hierarchii; uczeń nie wie, od czego zacząć. → strona z kaflami (start, czytanie, postacie, pensjonat, Paryż, obyczaje, zadania).
2. **Brak pełnych fragmentów do omawiania** (jak w Lalce i Hamlecie). Sceny mają po kilka cytatów, a nie czytelne całości z granicami, czasem czytania i zadaniami. → zestaw 10–14 fragmentów kanonicznych, wybranych na podstawie francuskiej tradycji szkolnej (zadanie dla GPT, potem weryfikacja granic w obu przekładach).
3. **Brak kart postaci.** Bohaterowie to lista tez. → karty: kim jest, jedno zdanie syntezy, portret z tekstu, gdzie mieszka, z kim jest powiązany, przemiana, kluczowy fragment.
4. **Zadania są nierówne.** Pytania przy scenach i CZZ nie mają poziomów ani kluczy w jednym miejscu. → zadania przy fragmentach (poziom P/R, klucz z cytatem).
5. **Dom jako schemat z przycisków.** → nowy rysunek przekroju kamienicy (jedna ilustracja, w której klika się okna/pokoje).
6. **Brak ścieżki lekcyjnej.** → kolejność kafli = proponowana kolejność pracy; każdy kafel prowadzi do jednego działania.

## 4. Kolejność prac
1. Strona startowa z kaflami; usunięcie meta z punktu 2. *(w tej iteracji)*
2. Nowy rysunek domu zamiast schematu i grafiki roboczej. *(w tej iteracji)*
3. Karty postaci. *(w tej iteracji)*
4. Fragmenty do omawiania — po kwerendzie GPT (prompt: `docs/PROMPT_GPT_fragmenty_FR.md`); granice w obu przekładach weryfikuje build.
5. Zadania przy fragmentach (P/R, klucze z cytatami).

## 5. Zasady na dalsze iteracje
- W UI tylko treść dla ucznia; weryfikacja, statusy i licencje w repo, w przypisach lub stopce.
- Fragmenty pełne, nie „sałatka” cytatów.
- Każda nowa interpretacja z tekstem albo źródłem; bez metakomentarzy.

## 6. Audyt porządkowy — wykonano (26.11.2026)
Przegląd każdej zakładki pod kątem meta. Usunięto z widoku strony (dane zostają w repo):

| Zakładka | Usunięte / zmienione |
|---|---|
| nagłówek | liczniki 21 · 333 · 46 · 40 |
| stopka | uwagi o audycie stron, „interpretacyjnym uporządkowaniu”, stanie źródeł |
| Atlas | zastrzeżenie o „powiązaniach interpretacyjnych, a nie przyczynowych”; nota „praktyki instytucjonalne nie są tożsame…” |
| Kontekst | kolumna „Chronologia powstania i przekładów”; linie „Źródło:” przy datach |
| wszystkie tezy | numery T01…T43, etykiety statusu źródła; „Źródło:” i cytat-dowód → krótki odsyłacz (cytat w dymku) |
| Kontekst, Mechanizmy | nagłówek „Tezy” → „Interpretacje” |
| Konteksty | zastrzeżenie „nie jest dowodem wpływu” → jedno zdanie zachęty |
| Paryż | „Grafika robocza i jej zgodność z tekstem”, długie legendy rzutów, opis trybu „oba” |
| Sceny | opis techniczny sekcji |
| Postacie | lista tez zamiast kart; licznik relacji |
| Ikonografia | tabela praw i SHA-256; nota o kolejności epizodów; dopiski „to nie jest uczta Kalipso”; licencje schowane pod „Źródło i licencja” |
| Źródła | rejestr tez z filtrami i tabela stanów → zwykła bibliografia |

Zostaje do zrobienia: fragmenty do omawiania (po paczce GPT), zadania P/R z kluczami.
