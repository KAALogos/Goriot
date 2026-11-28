# Ojciec Goriot — audyt projektu Logos
Data przekazania: 2026-11-28 | [Witryna](https://kaalogos.github.io/Goriot/) | [Repozytorium](https://github.com/KAALogos/Goriot)

## Werdykt
Rozwijać jako modelowy produkt edukacyjny Logos: cyfrowe wydanie powieści, wystawa muzealna i laboratorium interpretacji. Nie zwiększać mechanicznie ilości treści; przekształcić istniejącą wiedzę w narzędzia poznawcze ucznia. Ocena ekspercka (równe wagi, zaokrąglona): 8,5/10; potencjał 9,5+/10, nie pomiar.

| Kryterium | Ocena /10 |
|---|---:|
| Dydaktyka R | 9 |
| Innowacyjność | 9 |
| Architektura wiedzy | 9 |
| Warsztat źródłowy | 8,5 |
| Merytoryka (próbka) | 8,5 |
| UX (implementacja) | 7,5 |
| Potencjał estetyczny | 8,5 |
| WOW (potencjał) | 8 |

## Stan bazowy odczytany z repozytorium
333 praktyki, 21 obszarów, 46 relacji; 40 cytatów atlasu + 46 fragmentów opracowania (86 rekordów, niekoniecznie unikatowych); 14 scen, 56 zadań z kluczem (28 P, 28 R), 56 pytań do rozmowy; 43 tezy (14 faktów, 24 interpretacje, 5 kontekstów); 16 postaci, 16 relacji postaci, 8 mechanizmów, 4 osie, 4 konteksty porównawcze, 121 rekordów Quinta, 10 rekordów ikonografii tapety. Dwa przekłady, czytnik, przekrój i 14 pomieszczeń, obyczaje, poetyka, zadania, bibliografia. Dane z audytu poprzedniej wersji — porównać z HEAD.

## UX
Mocne: kafle startowe, dwa przekłady, odsyłacze do tekstu, klucze rozwijane, wyszukiwarka obyczajów normalizująca diakrytyki, Georgia/Source Sans 3, autentyczna ikonografia, reduced motion, widoczny fokus i dialog. Zachować identyfikację (papier, bordo, klasyczna typografia), nie robić futurystycznego dashboardu.

Problemy do reprodukcji na aktualnym HEAD:
- `modul.js`: nawigacja głównie `history.replaceState`; Wstecz nie odtwarza historii eksploracji; odsyłacze wewnętrzne nie zawsze aktualizują URL. Zaprojektować pushState/popstate i przywracanie stanu (scena, pozycja, przekład, filtr), zachować starsze deep linki.
- `plansze.js`: intro omija tylko hashe cytat/fragment/strona, nie moduły i sceny. Sekcyjne animacje trwają także przy powrotach; zachować pierwsze widowiskowe wejście, kolejne opcjonalne lub szybkie, pomijać wszystkie deep linki, szanować reduced motion. Nie usuwać zaakceptowanej tapety.
- `index.html` + `atlas.js`: kolumna „Str.” katalogu odsyła do Bortnowskiej niezależnie od trybu przekładu; oznaczyć edycję, nie wymyślać mapowania stron.
- `wyglad.css`: `#edges` i `#alllinks` ukryte; nie przywracać automatycznie plątaniny linii. Osobny widok relacyjny jako opcja.
- Ukryty tablist przy panelach z ARIA; zweryfikować semantykę widocznych kontrolek, fokus, obsługę klawiaturą i czytnikiem ekranu.
- Zamiast zastępować działy: zaproponować opcjonalne ścieżki Czytam / Odkrywam / Interpretuję / Przygotowuję się do matury. Sprawdzić globalną wyszukiwarkę, powroty, deep linki.

## Dydaktyka polonistyczna R
Bardzo silne: znajomość treści, postacie, relacje społeczne, kontekst historyczny i obyczajowy. Silne: realizm, narracja, kompozycja, aksjologia. Średnie: porównania, stylistyka i język, formułowanie hipotez. Rozbudować argumentację i samoocenę. Bloom (heurystyczne 1–5): zapamiętywanie 4, rozumienie 5, stosowanie 3, analiza 5, ocenianie 3, tworzenie 2. Niemierko: A/B mocne, C liczne możliwości, D największa rezerwa. Sprawdzić aktualne wymagania CKE i podstawę programową (nie twierdzić, że gotowe zadanie ma status CKE).

Przykłady R: (1) Narrator i pozorna obiektywność; (2) wertykalna organizacja pensjonatu jako hierarchia; (3) kompozycyjne zestawienie degradacji Goriota i awansu Rastignaca; (4) metaforyka Paryża; (5) ambiwalencja miłości ojcowskiej; (6) ideał/Chrystus ojcostwa w przekładach, z oryginałem; (7) Król Lear i Goriot; (8) powieść inicjacyjna; (9) wpływ Restauracji na bohaterów; (10) ekonomiczne a psychologiczne odczytanie. Rozwijać istniejące zadania zamiast je zastępować. Klucz do interpretacji: kryteria, alternatywne uzasadnione odpowiedzi, dowód + funkcja, nie jeden dogmat.

## Merytoryka i dowody
Testy wykonane w poprzednim audycie: 122/122 segmentów Bortnowskiej i 121/121 Boya zgodne z lokalnymi tekstami po normalizacji białych znaków; 28/28 zakresów scen (granice indeksów i pierwsza/ostatnia strona); 0 nierozwiązanych refs w 43 tezach. To nie kolacja z oryginalnymi wydaniami ani recenzja historyczna. Bez pełnego testu wizualnego, mobile, wydajności, dostępności lub uczniów. Nie twierdzić inaczej.

- Tapeta Dufoura: temat i datowanie pasują, identyfikacja konkretnego wzoru w fikcji pozostaje hipotezą; zweryfikować kartę muzealną i fragment powieści.
- Quint: ilustracje z 1922, recepcja, nie dokumentacja 1819; zachować kredyty i licencje.
- Rekonstrukcje: zachować istniejące oznaczenia tekst/rekonstrukcja; rozszerzyć na geometrię, rozmieszczenie i kolory, nie zamieniać przypuszczeń w fakty.
- Posag: zweryfikować kodeks cywilny 1804, własność vs zarząd, różne ustroje majątkowe. Nie uogólniać z jednostkowego przypadku.
- Chronologia publikacji: sprawdzić pierwodruk 1834–1835, wydanie książkowe 1835, wersję w Komedii ludzkiej 1843; odróżnić od akcji 1819–1820.
- Obyczaje: powieść nie jest przezroczystym dokumentem historycznym. Odróżniać praktykę ukazaną w utworze, zachowanie jednostkowe i niezależne potwierdzenie historyczne.
- `opracowanie.js` przechowuje statusy (tekst 10, źródło 20, źródło-fragment 8, autorska 5), `modul.js` w `thesis()` wyznacza status, lecz go nie wyświetla (`void st`). Bibliografia nie eksponuje częściowego odczytania. Udostępnić w zwijanym aparacie naukowym; nie robić ściany etykiet.
- Proponowane kategorie epistemiczne: tekst, historia, interpretacja, rekonstrukcja. Nie zastępują istniejących pól źródłowych; są ortogonalne.

## Benchmarki i kierunki
Poniższe linki to punkty odniesienia wskazane w audycie, nie certyfikat aktualnej dostępności ani pełny benchmark porównawczy. Claude ma zweryfikować źródła, nie powielać niezweryfikowanych twierdzeń.
- eBalzac: https://www.ebalzac.com/ — wersje tekstu, metadane, Komedia ludzka.
- Mapping Balzac: https://blogs.memphis.edu/mappingbalzac/ — geografia literacka i relacje przestrzenne.
- Digital Dante: https://digitaldante.columbia.edu/ — tekst, komentarz, intertekstualność.
- Mapping Gothic France: https://mcid.mcah.columbia.edu/mapping-gothic/about — architektura, przestrzeń, czas, widoki.
- Smithsonian Learning Lab: https://learninglab.si.edu/ — praca z obiektami muzealnymi.
- Shakespeare and Company Project: https://cdh.princeton.edu/projects/shakespeare-and-company-project/ — powiązane dane i eksploracja.
- Harvard Project Zero: https://pz.harvard.edu/thinking-routines — obserwacja, dowodzenie, pytania i refleksja.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ — dostępność.
- Źródła pierwszorzędne: https://wolnelektury.pl/katalog/lektura/ojciec-goriot/ ; https://pl.wikisource.org/wiki/Ojciec_Goriot_(Balzac,_1938)/Ojciec_Goriot ; https://www.maisondebalzac.paris.fr/vocabulaire/furne/notices/pere_goriot.htm ; rekordy muzealne w ikonografia.js i quint.js. Sprawdzić też BnF, Cooper Hewitt, Musée des Arts Décoratifs, CKE.

## WOW i dalsza wizja
Najmocniejsze elementy: tapeta jako wejście do świata powieści, Quint, przekrój pensjonatu. WOW poznawczy > animacja. Kliknięcie przedmiotu prowadzi do cytatu, postaci, obyczaju, historii, interpretacji, zadania. Jeden model wiedzy, wiele widoków (przestrzeń, poetyka, postacie, aksjologia, ekonomia, obyczaje).

1. Dynamiczny pensjonat: etapy od 1813 do 1819; zmiana piętra, wyposażenia, opłat, sposobu nazywania Goriota; źródła przy zmianach. Nie stosować pozornie ilościowych wskaźników prestiżu/majątku. Nie przebudowywać zaakceptowanego przekroju bez zgody.
2. Laboratorium interpretacji: problem → własna hipoteza → wybór cytatów → uzasadnienie → kontrargument → kontekst → synteza i samoocena. Przykład: czy miłość Goriota jest destrukcyjna? Uczeń może sformułować własną hipotezę; zapis/eksport notatki.
3. Wielowarstwowy czytnik: tekst autentyczny, przełączane warstwy przestrzeni, zmysłów, społeczeństwa, stylistyki, narracji, focalizacji, ironii, intertekstualności. Każda adnotacja wyjaśnia funkcję; nie zaznaczać wszystkiego równocześnie.
4. Ekonomia: sieć transakcji/relacji Goriot–córki–kochankowie–bankier–Rastignac, kwota, data/etap, waluta, typ, cytat, status. Porównania cen we frankach; bez pozornego przelicznika PLN.
5. Historyczny plan Paryża: miejsca z tekstu, trasy o ile udokumentowane, dzielnice elit i biedy, finałowy widok z Père-Lachaise. Źródła i licencja mapy, rozróżnienie rekonstrukcji od faktu.
6. Konteksty: zachować Lalkę, Króla Leara, Czerwone i czarne, Zbrodnię i karę. Kandydaci: Pani Bovary (pieniądz/pragnienia), Nędznicy (miasto), Przedwiośnie (dojrzewanie), Granica (kariera i moralność), Ludzie bezdomni (nierówności), Skąpiec (pieniądz/rodzina), Wesele (mikrokosmos), Tango (rodzina). Weryfikować obie strony porównania cytatami.
7. Tryb nauczycielski: pełnoekranowy, jeden problem, duży tekst, stopniowe odsłanianie, ukrywanie kluczy, klawiatura, QR/deep link, czytelność na telewizorze; tryb ucznia pozostaje.
8. Silnik literacki Logos (długofalowo): wspólny tekst/wydania, relacje, analiza, zadania i źródła; osobne tożsamości wizualne. Lalka: handel i Warszawa; Dżuma: czas i postawy; Rok 1984: kontrola i język; Dziady III: kody; Król Edyp: akcja/fabuła; Wesele: przestrzeń; Przedwiośnie: wizje Polski. Nie robić teraz migracji wszystkich projektów.

Nie dodawać na tym etapie chatbotów, awatarów, punktów XP, odznak ani 3D bez funkcji poznawczej. Zachować istniejące treści i design.

## Ograniczenia
Ocena ekspercka z kodu i danych, nie pełna recenzja ani pomiar UX. Publicznej strony nie przetestowano w działającej przeglądarce. Nie zweryfikowano niezależnie 333 obyczajów, wszystkich licencji i źródeł. Router standards/README.md odczytano; 04_DESIGN.md, 08_EDUCATION.md, 10_ACCEPTANCE.md zwróciły 404. Claude ma sprawdzić aktualne ścieżki. Żadnego pliku produkcyjnego nie zmieniono.
