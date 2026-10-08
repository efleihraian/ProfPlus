# Import arhive de olimpiade și concursuri

Catalog: ../catalog/competition-archives.json. Stare datată: ../catalog/competition-import-status.json. Scripts: import_competitions.py și run_competition_import.py. Datele, originalele și credențialele rămân excluse din Git. Word-ul sursă rămâne nemodificat.

Controllerul nescheduled alternează descoperirea a 20 linkuri cu indexarea documentelor extrase, maximum trei indexări concurente, și se oprește cu raport când nu mai există linkuri în așteptare. Checkpointul SQLite permite reluarea fără upload normal duplicat; un fișier confirmat indexed este omis. Pe acces/cotă/spațiu, procesul se oprește. Failed nu înseamnă indexat; rezultatele personale sunt excluse.

Pentru reluare: setează PROFPLUS_OPERATIONAL_ROOT la copia operațională autorizată (conține .env / web/.dev.vars și data/rag/store.json), apoi execută run_competition_import.py cu runtime-ul care are requests/PyMuPDF. OCR folosește Tesseract și modelele ron/eng existente. Nu copia secrete în branch-uri sau rapoarte.

Categoriile sunt olympiad/competition; materia și ciclul necunoscut rămân explicit generale. Ani doar din text. Pagina PDF este poziția în original; DOC/DOCX/HTML au locator fragment. ZIP/RAR indică și numele membrului. Deduplicarea SHA-256 folosește prima origine disponibilă; paginile și sursele sunt verificate separat.

Biblioteca și căutarea citesc metadatele publice ale fișierelor comune în mod dinamic. Importarea unui document nu garantează că formulele, drepturile de utilizare sau clasificarea pedagogică sunt corecte. Pentru arhive inaccesibile și documente unsupported se păstrează motivul în raport; nu se declară indexate.
