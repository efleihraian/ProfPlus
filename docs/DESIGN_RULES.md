# Reguli de design ProfPlus

Actualizat: 2026-11-15 (P-277). Se aplică site-ului (`web/`) și aplicației mobile (`mobile/`), pentru oameni și pentru agenți (Claude, Codex).

Documentul strânge regulile care fac interfața să nu arate „generată” sau „vibecoded”. Ele vin din cererile titularului: P-231, P-253 și P-271/P-272 (lista de 20 de reguli).

**Ordinea de prioritate:** cererea explicită a titularului pentru o sarcină (de exemplu, o machetă) > acest document > obiceiurile unui instrument sau ale unui model. Dacă o cerere contrazice o regulă de aici, urmezi cererea și notezi excepția în STATUS și la „Abateri cunoscute” de mai jos.

## Sursa de adevăr

- **Culorile, fontul și razele:** [`web/shared/design-tokens.ts`](../web/shared/design-tokens.ts).
  - Site-ul primește variabilele CSS `--pp-*` generate cu `node scripts/generate-design-tokens.mjs` (din `web/`).
  - Aplicația le citește prin `mobile/src/constants/theme.ts`.
  - Nu scrii culori noi direct în componente dacă există un jeton potrivit.
- **Font:** Roboto (400, 500, 600, 700), găzduit local în `web/public/fonts`.
- **Prototipul de referință:** [`docs/design/README.md`](design/README.md). Paleta din el e mai veche decât P-253; pentru culori contează jetoanele.

## Cele 20 de reguli

| # | Regula | Cum se aplică în ProfPlus |
|---|---|---|
| 1 | Șterge badge-urile de umplutură | Fără „Nou”, „AI”, „Obligatoriu” sau pastile decorative deasupra titlurilor. Informația utilă devine o propoziție sub titlu. |
| 2 | Renunță la etichetele redundante | Fără „Evaluare” deasupra cardului „Test” sau „Deschide clasa →” pe un card care se deschide oricum. |
| 3 | Fără italice aleatorii | Italic doar în imitații de documente tipărite sau la termeni care o cer. |
| 4 | Monospace doar unde trebuie | Doar sursa LaTeX și codurile (de exemplu, cheia 2FA). |
| 5 | Folosește design systemul | Jetoanele `--pp-*`, `.pp-btn` și componentele comune din `web/features/shell/`. |
| 6 | Arată produsul real | Pe landing apar ecranele ProfPlus (generarea, chatul, clasele, portofoliul), nu ilustrații generice. |
| 7 | Mărește funcția principală | Pe fiecare ecran, acțiunea pentru care vine profesorul ocupă cel mai mult loc. |
| 8 | Grupează prin spațiere | Spațiul dintre grupuri e vizibil mai mare decât cel din interiorul lor. Fără card în card (P-253). |
| 9 | Titluri specifice | „Documentele cerute de lege, într-un singur loc”, nu „Funcții puternice”. |
| 10 | Scoate în evidență acțiunea principală | Un singur buton plin pe ecran. O acțiune care doar pornește un flux de ștergere e secundară (`.pp-btn-quiet`); roșul apare la confirmare. Excepție cerută de titular: „Șterge clase” (P-279, `.pp-btn-danger`, roșu deschis, nu plin). |
| 11 | O singură culoare de accent | Verdele din jetoane (`--pp-accent`, `--pp-accent-text`, `--pp-dark`). Nu alte nuanțe de verde (de exemplu `#10B981`). |
| 12 | Iconițe consecvente | Setul `lucide-react` (sau SVG-uri în același stil), linie de 2, aceeași mărime în același context. |
| 13 | Fără ornamente | Fără pete de gradient, cercuri decorative sau umbre colorate. Excepții aprobate: textura de doodle-uri de pe fundal (P-273, P-275), caietul din hero-ul landingului, cardurile colorate cu doodle-uri din pagina clasei (P-278, P-282: câte o culoare plină pe card, cerută de titular; fără doodle-uri pe carduri din P-282) și desenele de pe bannerele din lista claselor (P-279). |
| 14 | Raza interioară = raza exterioară − spațiul dintre ele | Un buton de 32px într-o casetă cu raza 8 și spațiu de 4px primește raza 4. |
| 15 | Contrast bun la text | Minimum 4,5:1 în ambele teme. Verifici mereu și tema întunecată (vezi capcana de mai jos). |
| 16 | Titluri împărțite frumos | `text-wrap: balance` la titluri (regulă globală `.shell h1,h2,h3`), `text-wrap: pretty` la paragrafe. |
| 17 | Aliniază din ochi | Săgețile și iconițele din butoane se corectează optic, nu doar matematic. |
| 18 | Cifre tabulare | `font-variant-numeric: tabular-nums` la contoare (`0/8`), progres, prețuri și date. |
| 19 | Stări de încărcare | Ecranele își păstrează locul până vin datele (`usePageReady`, `PageStage`), fără săritura paginii. Butoanele arată „Se salvează…”. |
| 20 | Animații pentru feedback util | Apăsarea, salvarea, eroarea. Respectă `prefers-reduced-motion`. Animația pur decorativă nu e feedback. |

## Reguli vizuale ProfPlus

### Paletă și teme

- Tema luminoasă e bej cald (P-253): fără alb pur pe suprafețe, verde pentru structură, verde închis pentru acțiuni.
- Tema întunecată: gri cu o nuanță de verde, accente verzi.
- Culorile fixe (scrise direct în cod) au nevoie de o variantă pentru tema întunecată. De exemplu: `[data-theme=dark] .portfolio-letter` (P-272).

### Raze

- Jetoanele (P-253) au o singură rază, **8px**, pentru carduri, butoane, câmpuri, meniuri și dialoguri.
- `999px` doar pentru pastile și elemente rotunde.
- Fără 16, 20 sau 22px.

### Umbre

- Umbrele sunt calde (`var(--pp-shadow)` sau `rgba(70,50,25,…)`). Niciodată verzi, colorate sau reci (ardezie `rgba(15,23,42,…)`).
- Fundalul din spatele dialogurilor e cald și închis (`rgba(20,16,10,…)`).
- Cardurile obișnuite nu au umbre slabe dedesubt (P-253). Meniurile și dialogurile au umbre neutre.

### Etichete, titluri, separatori

- Fără etichete cu majuscule (eyebrow) deasupra titlurilor, pe site și în aplicație. Ce era etichetă devine titlu mic în litere normale sau text sub titlu.
- Titlurile de pagină: grosime 700 (P-253). Excepție: Acasă păstrează 500 din macheta „varianta 2” (P-258).
- Un singur separator în aceeași linie de detalii („·”).
- În textele landingului nu folosești liniuțe lungi (`—`, `–`) ca separatori (verificat de `web/tests/landing-page.mjs`).
- Funcțiile care cer cont deschid popupul comun (`web/features/shell/login-prompt.tsx`), nu texte „intră în cont” pe pagină. Butoanele popupului, „Intră în cont” din antet și „Creează cont” de pe landing duc pe pagina `/autentificare` (P-310).

### Capcană: linkurile din tema întunecată

`[data-theme=dark] .shell a` (specificitate 0,2,1) colorează toate linkurile în verde deschis. Un link stilizat ca buton are nevoie de un selector mai puternic, de exemplu `.lp .lp-btn.lp-btn-primary` (0,3,0). Altfel textul iese verde pe verde (bug găsit în P-271).

## Accesibilitate

- Toate acțiunile merg din tastatură, cu focus vizibil (`:focus-visible`). Dacă scoți `outline`, pui altceva vizibil (`:focus-within` pe container).
- Navigarea se face prin `<a href>`. Butoanele fac acțiuni. Fără `div` sau `span` pe care se poate apăsa.
- Butoanele care conțin doar o iconiță au `aria-label`. Ilustrațiile decorative au `aria-hidden`.
- Culoarea nu e singurul semnal: adaugi text sau o iconiță.
- Pe mobil: ținte de cel puțin 44px, etichete pentru TalkBack și VoiceOver.

## Aplicația mobilă

- Aceleași reguli: fără etichete cu majuscule (`Card` afișează `eyebrow` ca titlu mic normal, P-272), aceleași jetoane și același accent.
- Razele aplicației sunt separate de cele ale site-ului: aspectul aplicației din P-200 folosește `Shape` din `mobile/src/constants/theme.ts` (control 14, card 22, sheet 28). Butoanele (`components/ui/button.tsx`) au formă de pastilă. În aplicație folosești `Shape`, nu valori scrise direct.

## Cum verifici o schimbare vizuală

1. Capturi cu Playwright (`playwright-cli`) la 1440px și 390px, în tema luminoasă și în cea întunecată. Pentru ecranele cu cont, simulezi răspunsurile API doar în browserul de test.
2. Auditul `web-design-guidelines` pe fișierele atinse.
3. Testele care impun regulile: `web/tests/home-page.mjs` (fără eyebrow sau badge, fără umbre verzi, fără raze de 16–22px) și `web/tests/landing-page.mjs` (fără majuscule, fără liniuțe în text, butoane albe în tema întunecată). Când adaugi o regulă nouă, adaugi și testul.
4. Treci prin cele 20 de reguli de mai sus pentru fiecare ecran nou.

## Abateri cunoscute (de aliniat)

- P-310, la cererea titularului („conform ghidului Google”): butonul „Continuă cu Google” de pe `/autentificare` și din aplicație e alb (#FFFFFF, chenar #747775) în tema luminoasă, deși regulile cer fără alb pur pe suprafețe; sigla Google e cea oficială, multicoloră.

- P-293, la cererea titularului: separatorul de pe Asistent e „SAU” (majuscule), deși regulile cer fără etichete cu majuscule.
- P-279, la cererea titularului: bannerele claselor au desene tematice (ca în Google Classroom), deși regula 13 cere fără ornamente; „Șterge clase” e roșu (`.pp-btn-danger`) deși doar pornește modul de ștergere (regula 10).
- Cardurile mari de pe Acasă (P-271) și cardurile landingului (P-263) folosesc raza 12px, deși jetoanele P-253 cer 8px peste tot.
- Ecranul Acasă din aplicație (`mobile/src/app/index.tsx`) are raze scrise direct (12 și 8 după P-271), nu `Shape`.
- Paginile de administrare și de cont nu au trecut încă prin cele 20 de reguli.
- Paleta din `docs/design/README.md` e mai veche decât P-253.
