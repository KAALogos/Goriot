# Prompt dla Claude Code — Goriot / audyt i decyzje rozwojowe

Pracujesz na KAALogos/Goriot (https://github.com/KAALogos/Goriot), live https://kaalogos.github.io/Goriot/. Przeczytaj 01_AUDYT.md, 02_BACKLOG.csv i 03_QA.md. To przekazanie audytu, nie zatwierdzenie wszystkich propozycji. Celem jest ustalenie, co ma sens i co można rzeczywiście wykonać na poziomie premium dla polonistyki licealnej R.

ETAP 0 (wykonaj teraz i zatrzymaj się):
1. Ustal bieżący HEAD, stan working tree, branch, aktualny deployment. Nie nadpisuj pracy użytkownika. Odczytaj aktualne AGENTS.md / CLAUDE.md i router KAALogos/logos-lab/standards/README.md; tylko właściwe standardy (research, evidence, design, code/testing, education, acceptance). Jeżeli brak pliku, sprawdź ścieżkę, nie udawaj odczytu.
2. Porównaj audyt ze stanem aktualnym. Każdy punkt oznacz: już istnieje / potwierdzony / częściowo / nieaktualny / hipoteza / nieprzetestowany. Reprodukuj problemy w prawdziwej przeglądarce i na 360–390 px, desktop oraz 1920×1080. Nie zgaduj. Zrób screenshoty, logi konsoli, pomiary. Nie zmieniaj środowiska bez potrzeby.
3. Powtórz testy integralności i odsyłaczy, sprawdź źródła problematycznych tez oraz wzorce wskazane w audycie. Rozróżniaj odczytane, znalezione, zweryfikowane i niedostępne. Sprawdź aktualne wymagania R CKE.
4. Przygotuj krótką decyzję: co wdrożyć bez naruszenia zaakceptowanych elementów, co wymaga decyzji autora, co odłożyć. Podaj zależności, ryzyko regresji i koszt względny, nie obiecuj dokładnych terminów. Przedstaw maksymalnie 3 priorytety P1 oraz niezbędne P0. Zaproponuj jedno małe MVP poznawcze (dynamiczny pensjonat albo laboratorium interpretacji) z kryteriami odbioru. Raport w Markdown + dowody. STOP po etapie 0.

Po akceptacji użytkownika: osobna gałąź, małe odwracalne patche, jeden zakres naraz, testy i changelog. Nie publikuj, nie pushuj, nie zmieniaj GitHub Pages bez wyraźnej zgody. Nie usuwaj modułów, ikonografii, dwóch przekładów, zaakceptowanego układu, modeli danych ani istniejących identyfikatorów. Nie przerabiaj całej witryny. Nie dodawaj liczb ani źródeł bez podstawy. Nie wyceniaj prestiżu w procentach. Zachowuj polskie znaki i aktualną identyfikację. Zmiany mają zwiększać rzeczywistą wartość dydaktyczną, nie produkować dekoracji.

Docelowy raport: stan wejściowy (SHA), dowody, tabela rekomendacji z decyzją, proponowany zakres następnego etapu, testy, ograniczenia; bez deklaracji sukcesu bez dowodów.
