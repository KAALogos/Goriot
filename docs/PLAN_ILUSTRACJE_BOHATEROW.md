# Plan: ilustracje kafli i kart bohaterów

**Zasada:** zamiast tapety i zamiast obrazów generowanych — XIX-wieczne ilustracje do samego „Ojca Goriot”, z domeny publicznej. Pokazują dokładnie te postacie i sceny, mają właściwy kostium i są uczciwe źródłowo (podpis: kto narysował, kiedy, skąd).

## Źródła (sprawdzone na Wikimedia Commons, 26.11.2026)
| Zestaw | Kiedy | Co zawiera | Licencja |
|---|---|---|---|
| Honoré Daumier, drzeworyty do „Comédie humaine” | 1842 | „Father Goriot”, „Vautrin” | domena publiczna |
| „Œuvres illustrées de Balzac” (Marescq i Havard), Gallica bpt6k406167g, bpt6k116911k | ok. 1851–1853 | „La Mère Vauquer”, „Eugène de Rastignac présenté à madame de Nucingen” | domena publiczna (drugi plik na Commons opisany jako CC BY-SA 4.0 — do sprawdzenia u źródła w Gallica) |
| Albert Lynch (rys.) i Eugène Abot (ryt.), 10 plansz, Gallica btv1b2200166f | 1885 | sceny: Goriot przy stole; Eugeniusz i księżna; Vautrin bierze Eugeniusza pod rękę; markiz przedstawia studenta pani de Nucingen; Michonneau i Poiret z „panem z policji”; Delfina w kaszmirowej sukni; Delfina w ramionach ojca; Goriot między córkami; pani de Beauséant i Rastignac na balu; „Mój ojciec umarł!” — hrabina mdleje | domena publiczna |
| Wydanie z 1910 (Commons: „Balzac Le Père Goriot 1910”) | 1910 | winiety i ryciny w tekście | do sprawdzenia (zależy od daty śmierci ilustratora) |

## Przydział do kart bohaterów
| Karta | Ilustracja | Uwagi |
|---|---|---|
| Ojciec Goriot | Daumier 1842 „Father Goriot” | portret pełnej postaci; najbliżej epoki |
| Vautrin | Daumier „Vautrin” | jw. |
| Pani Vauquer | „La Mère Vauquer” (Œuvres illustrées) | |
| Rastignac | Lynch: „Madame, je ne suis encore qu'un pauvre diable d'étudiant…” (kadr na Eugeniusza) | |
| Delfina de Nucingen | Lynch: „Suis-je à votre goût?…” (suknia z kaszmiru) | |
| Anastazja de Restaud | Lynch: „Mon père est mort!…” (kadr na hrabinę) | albo plansza „Goriot między córkami” |
| Pani de Beauséant | Lynch: „Je tremblais que vous ne vinssiez pas…” | |
| Panna Michonneau, Poiret | Lynch: Michonneau i Poiret z Gondureau | jedna plansza, dwa kadry |
| Bianchon | do znalezienia (Œuvres illustrées lub wyd. 1910) | jeśli brak — karta bez ilustracji, z medalionem |
| Wiktoryna, pani Couture | do znalezienia jw. | jw. |

## Przydział do kafli i scen
- Kafel „Bohaterowie”: Lynch „Goriot między córkami” (najmocniejsza scena zbiorowa).
- Sceny do omawiania: każda scena dostaje planszę Lyncha, jeśli jest (sceny 3, 6, 8, 10, 11, 12, 13), a pozostałe — Daumiera lub ilustrację z Œuvres illustrées.
- Kafle „Obyczaje”, „Epoka”, „Paryż”: obrazy i ryciny Paryża z lat 1815–1830 (Boilly, Canella, Boys; „Journal des Dames et des Modes”) — osobna kwerenda.
- Tapeta z „Telemakiem” zostaje tylko na planszy wejściowej i w salonie pensjonatu (tam, gdzie wisi w powieści).

## Wykonanie (ja)
1. Pobrać oryginały z Gallica/Commons (najwyższa rozdzielczość), zapisać mastery poza repozytorium, sprawdzić licencję każdej karty.
2. Kadry na karty (portret 4:5) i kafle (16:9), bez retuszu; podpis i źródło w przypisie.
3. Build jak przy tapecie (`buduj_ikonografie.py` z nowym zestawem), potem test kontrastu podpisów.
