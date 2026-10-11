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

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](FAILED_MATERIALS.md).


## P-071 — scopul bibliotecii, 2026-10-11

Responsabil Marcos Soames, issue #16. Cererea titularului păstrează toate materialele utile pentru învățare și generarea documentelor: subiecte, bareme, soluții, manuale, programe școlare, calendare școlare, repere metodologice, planificări, proiecte de lecție și unități de învățare. Un calendar/regulament/metodologie nu se elimină automat după titlu. Cazurile ambigue deja descoperite rămân în coadă.

Linkurile includ pagini intermediare, nu numai documente. Numărul poate crește când o arhivă dezvăluie alte fișiere; SHA-256 previne indexarea aceluiași conținut de două ori. Navigarea prin meniuri tag/category/comentarii și anul din orice pagină generică nu mai extinde automat coada. Rutele ONI istorice, problemele Infoarena și descărcările Mateinfo sunt păstrate. Subiectele/baremele descărcabile din admitere/examene rămân utile, fără explorarea generală a administrării admiterii.

Formularele de înscriere, tabelele nominale, convocatoarele și cotizațiile fără indicii de conținut didactic sunt excluse după numele efectiv al fișierului. În arhive se verifică numele final, astfel încât un regulament sau subiect dintr-un folder care conține și formulare nu este eliminat. Rezultatele nominale rămân excluse prin controlul existent.

Aplicarea operațională înlocuiește atomic numai importerul verificat, după compararea cu baza Git. Curățarea cozii așteaptă import.lock la încheierea lotului curent; nu întrerupe uploaduri și nu resetează checkout-ul. Se păstrează checkpointul, istoricul surselor și jurnalul eliminărilor. Pentru documente administrative deja indexate se verifică UID/SHA și apartenența la catalogul concursurilor; se elimină numai indexul AI, obiectele și manifestele exacte și rândurile de catalog aferente, apoi se confirmă absența și se marchează excluded în checkpoint. Modelele personale ale profesorilor și cele zece exemple comune P-070 nu sunt vizate.

Verificare: 61 teste Python offline trecute, inclusiv filtrul, arhivele mixte, calendarele/programele/proiectele didactice, materialele de examen și rutele istorice. Testele nu folosesc furnizori reali. Codul web și lockfile-urile sunt identice cu versiunea publicată P-070; nu se declară un nou build/deploy web pentru această modificare a importerului. Audit npm: 8 high preexistente în toolchain, zero în producție. Importul întregii biblioteci rămâne în curs; referințele pentru fișiere inaccesibile/prea mari nu reprezintă originale încărcate.
