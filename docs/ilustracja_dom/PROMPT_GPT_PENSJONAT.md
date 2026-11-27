# Prompt dla GPT: przekrój pensjonatu pani Vauquer (do animacji)

**Gdzie:** ChatGPT (generowanie obrazów). Poprawki i warianty można robić też w Gemini (Nano Banana). Ruch na końcu: Veo w Gemini, Sora albo Runway.

**Co dołączyć do pierwszej wiadomości** (pliki z tego folderu):
1. `01_rzut_przekroj_obecny.png` — obecny schemat domu na stronie. To jest **kontrakt układu**: kolejność i proporcje pokoi muszą zostać takie same, bo na ten układ nakładam klikalne pokoje.
2. `02_rzut_pokoj_goriota.png` — rzut pokoju Goriota z rozstawieniem sprzętów według powieści.
3. `03_quint_pensjonat_od_ulicy.jpg`, `04_quint_jadalnia.jpg`, `05_quint_pokoj_goriota.jpg` — ilustracje Jean-Paula Quinta z 1922 r. (CC0). Wzór nastroju, kostiumów i wnętrz, nie stylu kreski.

**Kolejność pracy.** Wklej najpierw blok ETAP 1. Gdy obraz będzie dobry, w tej samej rozmowie wklejaj kolejne etapy, za każdym razem dołączając zatwierdzony obraz. Wszystkie pliki (PNG, największa rozdzielczość) wrzuć na Dysk do `ChatGPT/Ojciec Goriot - dom`, z nazwami jak w nawiasach przy etapach.

**Dlaczego etapy:** animacja na stronie będzie robiona warstwami. Pusty dom to tło. Wersja wieczorna, z zapalonymi światłami, służy do płynnego przejścia dzień–noc. Postacie i drobne elementy (dym, płomień świecy, kot, bielizna na sznurach) wycinam osobno i ożywiam delikatnym ruchem. Potrzebuję więc kilku obrazów o **identycznym kadrze**, różniących się tylko tym, co wskazano.

Opisy wnętrz pochodzą z obu przekładów powieści (Bortnowska, Boy-Żeleński). Tam, gdzie powieść milczy, prompt to zaznacza, żeby GPT nie dorysowywał rzeczy „z głowy”.

---

## ETAP 1 — pusty dom w dzień (`dom_A_dzien_pusty.png`)

```
Create ONE highly detailed illustration: a CUTAWAY CROSS-SECTION of a modest Parisian boarding house in late November 1819 (Bourbon Restoration). The front wall (garden side) is removed, so every room on every floor is visible at once, like a dollhouse. NO PEOPLE AND NO ANIMALS in this version — the rooms are furnished but empty.

LAYOUT CONTRACT — follow the attached schematic "01_rzut_przekroj_obecny.png" EXACTLY:
- same order of rooms, same relative widths, same equal floor heights, same narrow stairwell column about two thirds to the right, rising straight through all floors;
- strictly frontal ORTHOGRAPHIC view: no perspective, no tilted camera, all walls perfectly vertical, all floors perfectly horizontal; each room is a clean closed rectangle outlined by a thin dark wall/floor line (I will mask each room separately);
- square canvas 1:1, house occupying the central 80% of the width, a little sky above, a strip of garden below;
- ABSOLUTELY NO TEXT anywhere: no letters, numbers, labels, signatures; the sign above the garden gate is blank, the clock faces have no numerals.

STYLE: hand-coloured French book illustration of the 1820s–1840s (ink line + transparent watercolour), refined and calm, muted historical palette (yellow ochre, faded green, grey-blue, brick red, brown), fine hatching, soft daylight from the left. Not cartoonish, not 3D render, not photorealistic.

THE HOUSE (exterior, as described by Balzac):
- three storeys plus a mansard attic with dormers and two brick chimneys; built of sandstone painted a cheap yellow;
- the front (garden) facade has FIVE small-paned windows per floor, with wooden jalousie shutters each hanging at a different angle, so their lines "quarrel" with each other (in the cutaway you see these windows from inside, on the back walls of the rooms only where the schematic shows a window);
- the LEFT side wall faces the street (rue Neuve-Sainte-Geneviève, steeply sloping downhill to the left, dry cobbles, grass growing at the foot of the wall); this side wall has two windows per floor, the two on the ground floor have iron bars in a lattice pattern;
- shabby, patched, respectable poverty; the higher the floor, the poorer.

ROOMS, FROM TOP TO BOTTOM (left → right as in the schematic):

ATTIC (under the slate mansard):
1. Christophe's cubbyhole (manservant): a tiny garret with a dormer, a straw pallet; nothing else (the novel does not describe it — keep it bare);
2. the laundry-drying loft (wide, centre): bare boards, washing lines with white linen and napkins;
3. Sylvie's cubbyhole (the fat cook): a tiny garret with a dormer, a narrow bed; bare.

THIRD FLOOR (four rooms at 45 francs a month, board included — the poorest):
4. Mlle Michonneau's room: bare and cold; on a nail a dirty green eyeshade; a shawl with thin fringes on the chair (interior not described in the novel — keep minimal);
5. OLD GORIOT'S ROOM — the most detailed room, follow plan "02_rzut_pokoj_goriota.png": a window WITHOUT curtains; wallpaper peeling off in many places from the damp, curling and showing a wall yellowed by smoke; a wretched bed with only a thin blanket and a quilted foot-cover patched from pieces of old dresses; a red-and-white checked curtain on a rod at the head of the bed; a bedside cupboard with no door and no top; opposite the window an old pot-bellied commode of rosewood with brass fittings in the shape of leaves and flowers; on a stool (or the commode) a water jug in a basin and shaving things; a pair of shoes in the corner; a fireplace with NO trace of fire; by the fireplace a square walnut table; a poor little writing desk with his hat lying on it; a dark wicker armchair and two chairs; the floor damp and dusty. It must feel like the saddest prison cell;
6. Eugène de Rastignac's garret (student, next door to Goriot, sharing a wall; both doors open onto the same corridor): an untidy little room, law books and papers on a study table, a narrow bed, a small cold fireplace;
7. (right of the stairwell) the vacant room for "birds of passage", usually poor students: an empty bed frame, a chair, dust.

SECOND FLOOR (two lodgings at 72 francs a month):
8. Monsieur Poiret's room: neat, lifeless, grey; an old soft cap on a peg, a cane with a yellowed ivory knob (interior not described — keep minimal);
9. Vautrin's room (interior not described in the novel — keep it plain and orderly): on the table a disassembled door lock, a small oil can and a file (the novel says he repairs every faulty lock in the house); nothing luxurious;
10. (right of the stairwell) continuation of the second-floor lodgings, shutters half-closed.

FIRST FLOOR (the two best apartments):
11. Madame Vauquer's apartment (the more modest of the two; the novel only says the two widows chat here after dinner over blackcurrant liqueur and sweets): a small round table with a decanter, two glasses and a plate of sweets, two armchairs; otherwise plain;
12.–13. Madame Couture's apartment (three rooms, she lives here with her ward Victorine; once refurbished for Goriot when he was rich): curtains of yellow cotton (calico), varnished armchairs upholstered in plush, a few poor paintings, cheap paper wallpaper "that any tavern would despise"; a sewing basket by the window; two beds in the third room (right of the stairwell).

GROUND FLOOR (common rooms):
14. THE DRAWING ROOM (left, at the street end): a glass door to the garden and two barred windows onto the street; armchairs and chairs upholstered in horsehair cloth with alternating matt and shiny stripes; in the middle a round table with a grey-and-white imitation marble top bearing a white porcelain tea set with half-worn gilt bands; a poor floor; wooden panelling up to door-handle height; above it a glossy scenic wallpaper with scenes from "Télémaque" — between the two barred windows Calypso's feast for the son of Ulysses (classical figures in a landscape); a fireplace with a perfectly clean hearth (fire only on great occasions), two vases of old dusty artificial flowers flanking an ugly alabaster clock;
15. THE DINING ROOM (next to the drawing room, the heart of the house): entirely wood-panelled, once painted a colour impossible to name, now layered with dirt forming strange shapes; sticky shelves all round with chipped yellowed carafes, metal napkin rings and stacks of faience plates with blue borders; in a corner a box with pigeon-holes for wine-stained napkins; a barometer with a little Capuchin figure that comes out when it rains; ugly engravings in black lacquered frames with a gold fillet; a tortoiseshell clock inlaid with brass; a green stove; oil lamps (wall sconces) where dust mixes with oil; a LONG TABLE covered with greasy oilcloth, set for eighteen; rickety chairs; wretched curled mats of sea-grass; old foot-warmers with broken holes; a red-tiled floor full of bumps;
16. THE ENTRANCE HALL between the dining room and the kitchen, with the painted, waxed wooden staircase starting here (the stairwell column), and the door to the garden;
17. THE KITCHEN (right): stone sink, copper pans, a hearth/stove, a window onto the back yard (the novel does not describe the kitchen — keep it plain and plausible).

GARDEN STRIP (bottom foreground, as wide as the house): along the facade a paved gutter, then a sandy path lined with geraniums, oleanders and pomegranate shrubs in blue faience pots; a small garden gate with a noisy bell and a blank sign; on the wall facing the street a niche painted as green marble with a plaster statue of Cupid whose varnish is peeling; ivy hanging from the neighbouring wall; espaliers and a dusty vine on the garden wall; a little arbour of lime trees with a round green-painted table and benches; beds of artichokes, sorrel, lettuce and parsley.

MOOD AND HISTORY: cold, shabby, decline toward the top; late autumn light; costumes and furniture strictly of 1815–1820, no anachronisms (no gas light, no modern objects).
```

**Prawie na pewno trzeba będzie dopisać (każde osobno):**
- „Keep the layout of the attached schematic exactly: same room order and widths, equal floor heights, straight vertical stairwell.”
- „Remove every letter or number, including on the sign and the clocks.”
- „Make the outlines between rooms continuous and clearly visible.”
- „Less saturated, more like a hand-coloured print from 1830.”

---

## ETAP 2 — ten sam dom wieczorem (`dom_B_wieczor_pusty.png`)

```
Using the approved image as the exact base, produce the SAME image with IDENTICAL framing, geometry and furniture — change ONLY the lighting: a winter evening around 6 p.m. Dark blue sky, the oil lamps in the dining room lit, a single tallow candle in Goriot's room, a candle in Rastignac's room, a lamp in Madame Vauquer's room, a warm glow in the kitchen; the other rooms dim. Windows that are lit glow warm yellow. Still NO people and NO animals, still NO text.
```

---

## ETAP 3 — postacie osobno (`postac_<nazwa>.png`, po jednej na obraz)

Każdą postać generuj osobno, za każdym razem tym samym poleceniem, zmieniając tylko opis w nawiasie. Wtedy wytnę je z tła i postawię w pokojach na stronie, z delikatnym ruchem (oddech, mrugnięcie świecy, gest).

```
Draw ONE full-length figure in exactly the same drawing style, line weight, palette and light (from the left) as the approved house image, at the scale it would have inside its room. Plain flat pure white background, no floor shadow, no props except the ones named, NO text. Character: [OPIS]
```

Opisy do wstawienia w miejsce [OPIS] (według powieści):
- **Goriot:** an old man of about seventy, once a well-off vermicelli maker, now shabby; hair no longer powdered, of a dirty greenish-grey; a worn frock coat; seated on a wicker chair by a cold fireplace, hands on his knees, head bowed.
- **Rastignac:** a student of 21 from the south of France: white complexion, black hair, blue eyes; a modest worn frock coat; seated at a study table, leaning over a law book, chin on hand.
- **Vautrin:** a man of about forty, broad-shouldered, powerful chest, square thick hands with tufts of red hair; a black wig and dyed sideburns; jovial but hard face with premature wrinkles; in shirt-sleeves and waistcoat, bending over a disassembled door lock with a small oil can.
- **Madame Vauquer:** a short stout woman of about fifty; a tulle cap with a badly fitted false braid hanging under it; a nose like a parrot's beak; small plump hands; a skirt made from an old dress under which a knitted woollen petticoat shows; trodden-down slippers; standing, with a bunch of keys.
- **Madame Couture:** a widow of a war commissary, middle-aged, simple dark dress and bonnet, kind face; seated, knitting.
- **Victorine Taillefer:** a very young girl, pale with the sickly pallor of chlorosis, fair hair, grey eyes with shadows under them, too thin; a cheap modest dress; seated, sewing by a window.
- **Mademoiselle Michonneau:** an elderly spinster, angular, wearing a dirty green eyeshade and a shawl with thin miserable fringes; colourless eyes; standing stiffly.
- **Poiret:** a small dried-up old man like a grey shadow; an old soft cap; a cane with a yellowed ivory knob; a dirty white waistcoat, a crumpled coarse-muslin jabot, a cravat round a turkey-like neck, blue stockings on unsteady legs.
- **Sylvie:** the fat cook, apron, sleeves rolled up, holding a pot.
- **Christophe:** the manservant, plain working clothes, carrying boots to polish.
- **The cat:** Madame Vauquer's tabby cat walking along a shelf (separate image, same rules).

---

## ETAP 4 — drobne elementy do ruchu (`efekt_<nazwa>.png`)

```
Same style and scale as the approved house image, plain flat pure white background, NO text. Draw separately, each as its own small element: (a) a wisp of chimney smoke, three slightly different phases; (b) a tallow candle flame, three phases; (c) white linen on a washing line, three phases of a light breeze; (d) the Capuchin figure of the barometer half out of its little house.
```

---

## ETAP 5 — ruch całej sceny (opcjonalnie, `dom_ruch.mp4`)

W Gemini (Veo), Sorze albo Runwayu wgraj zatwierdzony obraz z etapu 1 lub 2:

```
Subtle cinemagraph from this exact image. Static camera, no zoom, no pan, no new objects, keep every line identical. Only: smoke drifting from the two chimneys, candle flames flickering in the lit rooms, the linen on the drying lines swaying slightly, the ivy leaves trembling, a very slow change of daylight. 8 seconds, seamless loop.
```

Film posłuży tylko jako tło kafla albo planszy. Klikalne pokoje i podpisy zostaną na obrazie statycznym.

---

## Czego pilnuję przy odbiorze
- Układ zgodny ze schematem 01 (sprawdzę nakładając siatkę pokoi).
- Brak napisów i cyfr.
- Zgodność z powieścią: okno Goriota bez firanek, zimny kominek, sprzęty z rzutu 02; w jadalni długi stół z ceratą i zielony piec; w salonie tapeta z Kalipso między zakratowanymi oknami.
- Na kaflu strony głównej jest teraz winieta Quinta „pensjonat od ulicy” (1922, CC0). Nowa ilustracja trafi do działu „Pensjonat i Paryż”. Kafel zmienię tylko, jeśli nowy obraz okaże się lepszy.
