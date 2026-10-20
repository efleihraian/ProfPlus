# Flux automat de știri și recomandări — P-082

Responsabil: echipa (cerere explicită din 2026-10-15). Branch `feature/P-082-news-feed`, din `main` b78b12e.

## Cum funcționează

- **Surse**: fluxuri RSS publice — Ministerul Educației (edu.ro, oficial), Edupedu.ro, Digi24 · Educație, Educație Privată (`web/lib/news-feed.ts`, `NEWS_SOURCES`). Se folosesc fluxurile oferite de publicații pentru preluare, nu scraping de pagini; robots.txt nu restricționează fluxurile.
- **Ce se publică**: doar titlul, un extras de cel mult 280 de caractere, data, categoria și linkul către sursă. Fără text integral, imagini sau date personale; pagina știrii spune „Preluată automat din …” și trimite la articolul complet.
- **Filtru**: intră știrile despre profesori, elevi și școală (cuvinte-cheie); sursa oficială intră integral; știrile medicale/universitare fără legătură cu școala sunt excluse. Numai ultimele 14 zile, fără date din viitor.
- **Publicare automată**: știrile intră direct în lista completă (/news), poziția 4, status publicat. Id-ul este derivat din link (UUID v8), deci aceeași știre nu se dublează, iar o știre arhivată de editor nu este republicată.
- **Frecvență**: actualizare în fundal la cererile către /api/news, cel mult o dată la 30 de minute pe instanță (fără scheduled task); administratorul are „Actualizează fluxul automat” în Admin → Știri.

## Acasă (aranjarea P-079 păstrată: o știre principală + trei secundare)

- Fixările editorului mai noi de 14 zile își păstrează poziția; restul pozițiilor se completează automat din ultimele 21 de zile.
- Scor = importanță (ex. salarii, majorări, greve, sporuri, titularizare/definitivat, norme, calendar școlar, Evaluare Națională/Bacalaureat) + relevanță pentru profilul didactic (disciplina, ciclul — primar/gimnaziu/liceu, olimpiade/concursuri la disciplina ta) − vechime. Temele și sursele repetate sunt penalizate pentru diversitate.
- Cardurile arată motivul: „Pentru tine: Matematică · gimnaziu” sau „Important”. Vizitatorii fără cont văd cele mai importante știri.
- Profilul didactic se folosește numai pe server, pentru ordonare; nu se salvează nimic nou și nu se trimite nimic unui furnizor AI.

## Verificări (2026-10-15)

- `tests/news-feed.mjs` (nou, în CI): parsare RSS (CDATA, entități, parametri de urmărire, linkuri/date invalide), filtru educație, extras scurt, id determinist și compatibil cu validatorul editorial, categorii; recomandări — profesorul de matematică de gimnaziu vede olimpiada înaintea știrilor de liceu, știrea majoră rămâne vizibilă, fixările recente se păstrează, cele vechi sunt înlocuite, „română” nu potrivește „România”; colectare cu surse simulate (vechi/irelevante sărite, dubluri eliminate, sursă căzută raportată).
- Rulare reală pe cele patru fluxuri, fără scriere: 85 de știri relevante; recomandări diferite pentru vizitator, matematică-gimnaziu, română-liceu și învățător.
- Pe localhost:3000 (backend real): ingestia a publicat știrile automate în lista completă, Acasă afișează principalul + trei secundare cu motivul recomandării, pagina știrii arată extrasul și linkul sursei.
- Build, TypeScript și toate suitele din CI trecute pe Linux; ESLint fără erori noi.

## Limite

- Clasificarea pe cuvinte-cheie poate greși (ex. o știre despre un profesor de sport marcată „gimnaziu”); editorul poate arhiva orice știre automată.
- Ciclul de predare este cel din profil (primar/gimnaziu/liceu), nu clasa exactă.
- Pe Site, ingestia depinde de permisiunea platformei pentru cereri HTTPS externe către surse; se verifică la publicare.
- Drepturile asupra conținutului rămân ale surselor; ProfPlus afișează titlu + extras scurt cu link. Dacă o sursă cere oprirea, se scoate din `NEWS_SOURCES`.


## Precizia disciplinei — P-089, 2026-10-15

Relevanța pentru profil nu mai folosește fragmente obținute prin tăierea finalului cuvintelor. Fizică acceptă „fizică”/„fizicii” pe cuvinte întregi, după eliminarea expresiilor de educație fizică, pregătire sportivă și activitate/condiție/pregătire fizică. Educație fizică are propriile expresii; simpla apariție a Fizicii nu îi oferă relevanță. Un articol care menționează separat ambele discipline poate primi ambele potriviri. Titlul și rezumatul se verifică separat.

Pentru alte discipline: cuvinte întregi, aliasuri explicite pentru Matematică și Informatică/TIC, variante flexionare uzuale pentru științe și expresii de limbă/literatură; disciplinele compuse necunoscute cer toți termenii semnificativi. Sufixul „în limba …” al unei discipline nonlingvistice este ignorat. Regresii în tests/news-feed.mjs: confundări negative, potriviri pozitive, text mixt, metafizică/biochimie/informații, limba de predare și prioritatea de scor.

Regulile sunt deterministe și conservatoare, nu clasificare semantică perfectă. Știrile pot apărea în continuare pentru importanță generală/ciclu sau fixarea editorului, fără motivul de disciplină greșit. Reordonarea se aplică la următoarea cerere; fără reimport, reindexare RAG, model AI ori migrare.
