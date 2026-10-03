# Istoricul versiunilor

## Ne lansat încă

## 0.6.1 — 2026-10-03

- Proiecte și istoric direct în bara laterală, cu căutare, grupuri expandabile și creare proiect inline.
- Mutarea conversației în meniul „···”; eliminate istoricul din antet și selectorul de proiect din composer.
- Meniu lateral pe mobil, fundal de închidere și suport Escape.
- Simplificate antetul, ecranul de pornire și caseta de mesaj.

## 0.6.0 — 2026-10-03

- Proiecte și istoric persistent în contul Sites.
- Conversații noi distincte, căutare după titlu, filtrare după proiect și redeschidere cu mesaje, citări și documente.
- Mutarea conversațiilor între proiecte; selecția surselor se salvează pe server.
- Salvare înainte de apelul AI și salvarea răspunsului pe server înainte de trimitere; protecție la suprascriere între ferestre.
- Recuperarea grupurilor de documente anterioare; mesajele vechi nesalvate nu pot fi reconstruite.

## 0.5.0 — 2026-10-03

- Bibliotecă de surse: catalogul comun, materialele indexate, documentele profesorului din toate conversațiile și sursele web citate.
- Căutare după metadate, filtre, selecție/golire și linkuri la originale.
- Căutarea RAG aplică selecția verificată pe server; materialele neindexate și documentele altor utilizatori sunt respinse.
- Vizualizare PDF pentru documentele profesorului; revizuire a răspunsurilor documentare care omit citarea.
- Verificări documentate în docs/LIBRARY.md.

## 0.4.0 — 2026-10-03

- Documentele profesorului și manualele au prioritate; căutarea web completează informațiile lipsă.
- Încărcare documente în chat, stări de procesare, păstrare pe server și ștergere completă.
- Originale R2, metadate D1, indexuri OpenAI separate și acces verificat pe utilizator/conversație.
- Citări accesibile și surse distincte pentru documente, manuale și internet.
- Fluxuri reale verificate pentru TXT/PDF/DOCX, răspunsuri document/web/mixt, validări, izolare și ștergere. Limitele sunt în docs/HYBRID_EVALUATION.md.

## 0.3.0 — 2026-10-03

- Catalog general manuale.edu.ro și colecție activă de matematică pentru clasa a V-a: 9/9 volume indexate.
- Import reluabil cu stări SQLite, extracție pe pagini, OCR, metadate și reîncercări.
- Chat RAG cu căutare filtrată, citări și linkuri la paginile PDF; numărul manualelor afișat în interfață.
- Pilot privat publicat; 9/10 verificări ale fluxului au trecut. Recuperarea pentru triunghiuri și verificarea formulelor rămân deschise.

## 0.2.0 — 2026-10-01

### Adăugat

- Site de chat AI adaptat pentru telefon și desktop, cu interfață în română.
- Casetă de mesaj, conversație nouă, stare de așteptare, oprire și reîncercare.
- API server-side cu context conversațional și cheia păstrată ca secret.
- Validări, limitarea contextului și timeout; contract JSON documentat pentru viitoarele aplicații mobile.
- RAG-ul și aplicațiile mobile sunt planificate separat.

- Configurare locală a cheii OpenAI prin introducere ascunsă și test API cu timeout, erori și afișarea consumului. Apelul real a fost verificat cu succes.
- Folosirea certificatelor de sistem macOS când instalarea Python nu are un bundle disponibil, cu verificarea TLS activă.

## 0.1.0 — 2026-10-01

### Adăugat

- Documentație pentru scop, stare, MVP și arhitectură conceptuală.
- Backlog, roadmap, jurnal de lucru și registru de decizii.
- Reguli pentru actualizarea progresului și șabloane GitHub.
- Repository privat GitHub pentru versionarea proiectului.

Această versiune conține doar documentație.
