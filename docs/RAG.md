# RAG — manuale comune și pilotul inițial

Colecția activă este definită în `catalog/matematica-clasa-5.json`, cu 9 volume din catalogul manuale.edu.ro. Include 7 manuale în română și traduceri în maghiară și germană. Nu presupunem că acest catalog cuprinde orice ediție istorică aprobată.

## Flux

PDF oficial → text pe pagini (OCR pentru paginile cu puțin text) → fragmente de 500 de tokeni, suprapunere de 100 → index OpenAI → căutare filtrată după ID-urile colecției → răspuns cu citări și linkuri la paginile PDF. Nu antrenăm modelul.

Catalogul, importatorul și evaluările sunt în GitHub. PDF-urile, textele extrase, cheia și baza de stare rămân în directoare ignorate. OpenAI păstrează fișierele încărcate pentru căutare; conversațiile trimise prin Responses au `store: false`.

## Import reluabil

Din rădăcina repository-ului:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-rag.txt
.venv/bin/python scripts/import_manuals.py --school-class 'Clasa a V-a' --subject-prefix Matematica --ocr --workers 2
```

Necesită cheia din `.env`, Tesseract și modelele de limbă ron/eng în `data/rag/tessdata/`. Pentru importurile noi 0.9.5, pragul implicit este 90% pagini cu cel puțin 60 caractere; sub prag se marchează pentru OCR. SQLite `data/rag/import.sqlite` salvează starea, metadatele, hash-ul PDF și ID-urile încărcate; fișierele indexate sunt omise la reluare. Descărcările au reîncercări și verificare PDF; o blocare locală împiedică două importuri simultane. PDF-urile se șterg după extragere pentru a limita spațiul ocupat.

Aceasta descria restrângerea pilotului inițial. În 0.9.4 selecția automată a devenit dinamică după profil; în 0.9.5 importul general a fost reluat. Toate manualele potrivite indexate pot participa; selecțiile personalizate rămân restrânse explicit. Contorul acoperă întregul catalog. Vezi [importul curent](MANUAL_IMPORT.md).

## Limite

Paginile din citări sunt poziții în PDF, nu obligatoriu numerele tipărite. Extragerea textului poate pierde structura fracțiilor, exponenții, tabelele și figurile. OCR general nu garantează formule matematice corecte. Indexarea unui manual nu înseamnă verificarea tuturor exercițiilor sale. Citările sunt verificate pentru existență și apartenență la colecție; corectitudinea fiecărei afirmații necesită evaluare.

Cheia și ID-ul indexului sunt configurate numai pe server. Site-ul rămâne privat; accesul public și limitele de consum sunt sarcini separate.

## Import finalizat la 2026-10-03

Toate cele 9 manuale sunt indexate. [Stare pe manual](../catalog/matematica-clasa-5-status.json): 2.020 pagini PDF și 1.995 pagini cu text extras. [Evaluare](RAG_EVALUATION.md): 9/10 verificări ale fluxului au trecut; cazul despre triunghiuri rămâne deschis.

## Actualizare 0.4.0

Colecția manualelor este o sursă prioritară, nu exclusivă. [Chatul hibrid](HYBRID_CHAT.md) permite documentele profesorului și completare web. Evaluarea 0.3.0 rămâne o înregistrare istorică a modului exclusiv.
