# Import arhive de olimpiade și concursuri

Catalog: ../catalog/competition-archives.json. Stare datată: ../catalog/competition-import-status.json. Scripts: import_competitions.py și run_competition_import.py. Datele, originalele și credențialele rămân excluse din Git. Word-ul sursă rămâne nemodificat.

Controllerul nescheduled alternează descoperirea a 20 linkuri cu indexarea documentelor extrase, maximum trei indexări concurente, și se oprește cu raport când nu mai există linkuri în așteptare. Checkpointul SQLite permite reluarea fără upload normal duplicat; un fișier confirmat indexed este omis. Pe acces/cotă/spațiu, procesul se oprește. Failed nu înseamnă indexat; rezultatele personale sunt excluse.

Pentru reluare: setează PROFPLUS_OPERATIONAL_ROOT la copia operațională autorizată (conține .env / web/.dev.vars și data/rag/store.json), apoi execută run_competition_import.py cu runtime-ul care are requests/PyMuPDF. OCR folosește Tesseract și modelele ron/eng existente. Nu copia secrete în branch-uri sau rapoarte.

Categoriile sunt olympiad/competition; materia și ciclul necunoscut rămân explicit generale. Ani doar din text. Pagina PDF este poziția în original; DOC/DOCX/HTML au locator fragment. ZIP/RAR indică și numele membrului. Deduplicarea SHA-256 folosește prima origine disponibilă; paginile și sursele sunt verificate separat.

Biblioteca și căutarea citesc metadatele publice ale fișierelor comune în mod dinamic. Importarea unui document nu garantează că formulele, drepturile de utilizare sau clasificarea pedagogică sunt corecte. Pentru arhive inaccesibile și documente unsupported se păstrează motivul în raport; nu se declară indexate.

P-056, 2026-10-09: marcajele paginii se repetă în blocuri de aproximativ 900 de caractere, pentru ca fragmentele căutate să păstreze pagina sursei. Migrarea reluabilă textChunkVersion=3 corectează doar fișierele acestui import: vechea indexare rămâne disponibilă până la confirmarea înlocuirii, apoi se elimină copia veche. Curățarea întreruptă se reia separat, fără reupload. Documentele noi aplică aceeași fragmentare înainte de upload; 11 teste verifică inclusiv salvarea efectivă, migrarea și reluarea curățării.

P-056, 2026-10-09: importul s-a oprit controlat la 578 fișiere confirmate din cauza DISK_SPACE_LOW. Eliminarea exclusivă a dependențelor regenerabile din cele două checkout-uri create pentru această sarcină a eliberat aproximativ 2 GB; originalele, checkpointurile, configurația și copia operațională au fost păstrate. Reluat cu controller PID 90588 și protecție de somn inactiv. La reluare sunt rezolvate întâi indexările/migrarea paginilor, apoi descoperirea. Raportul DISK_SPACE_LOW este istoric; starea curentă se citește din run.json.

## P-062 — 2026-10-09

Omiterea originalelor peste 50 MB este autorizată explicit de titular; referința este păstrată privat în Supabase și catalogul manualelor păstrează URL-ul oficial. Indexul existent, furnizorii, conturile, RLS și audiența pilotului nu se schimbă. Fișierele Word de blocare nu sunt materiale educaționale. Datele Storage nu sunt incluse în backupul DB. Transferul bibliotecii continuă, fără declarație de audit complet sau finalizare a tuturor importurilor. [Dovezi, teste și limite](IMPORT_CONTINUATION.md).
