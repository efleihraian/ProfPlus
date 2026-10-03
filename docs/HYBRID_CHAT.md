# Chat cu documente prioritare și completare web — 0.4.0

## Comportamentul răspunsului

1. Caută în documentele proprii ale profesorului, pentru conversația activă, și în cele 9 manuale din pilot.
2. Modelul evaluează dacă pasajele sunt suficiente. Documentele profesorului au prioritate, apoi manualele. Explicațiile generale sunt permise și trebuie marcate ca suplimentare.
3. Când lipsesc informații, sunt cerute date actuale sau surse externe, generează o interogare generală și folosește căutarea web OpenAI. Apelul de căutare nu primește documentele ori istoricul; primește numai interogarea generală. Promptul cere eliminarea numelor și detaliilor private. Aceasta este o instrucțiune pentru model, nu o garanție formală de anonimizare.
4. Răspunsul final combină informațiile și citează surse de trei feluri: document al profesorului, manual, internet. Citările sunt linkuri în text și în carduri.
5. Dacă internetul nu este disponibil, apare o notificare și se păstrează răspunsul posibil din informațiile disponibile. Parolele ori datele personale necunoscute nu devin interogări web.

Nu impunem un procent mecanic de informație din documente. Prioritatea surselor se aplică în funcție de relevanță. Citările verifică identitatea sursei, nu demonstrează automat fiecare afirmație. Alegerea surselor primare/educaționale este cerută modelului; nu există încă o listă exclusivă de domenii.

## Documentele profesorului

„Adaugă document” acceptă PDF, DOC, DOCX, PPTX, TXT, MD și HTML. Limită: 10 MB/fișier, 10 documente/conversație, 50/cont. Formatele declarate și semnăturile de bază PDF/Word sunt verificate. Documentele nu sunt executate și sunt descărcate ca atașamente.

Originalele sunt în R2; metadatele în D1; fiecare document are un index OpenAI separat. Identitatea este furnizată serverului de autentificarea Sites, nu de corpul cererii. Listarea, căutarea, descărcarea și ștergerea verifică utilizatorul și conversația. Fișierele nu sunt introduse în indexul comun al manualelor ori în GitHub.

Stări: încărcare, indexare, gata, eroare, ștergere de reîncercat. Chatul așteaptă indexarea înainte de trimitere din interfață. Fișierele cu eroare pot fi șterse. Originalul și indexul sunt păstrate până la ștergere; nu folosim stocarea browserului pentru fișiere.

Identificatorul conversației se păstrează în browser pentru a regăsi documentele după reîncărcare; nu include conținutul lor. Mesajele rămân numai în memoria paginii. „Conversație nouă” golește mesajele, dar păstrează documentele active. Bibliotecă de documente între dispozitive și istoric de conversații sunt etape separate.

Ștergerea exclude documentul imediat din căutările noi și șterge indexul, fișierul OpenAI, originalul R2 și metadatele. Un eșec păstrează starea pentru reîncercare. Nu șterge retroactiv textul deja afișat în conversație.

## API

- POST `/api/documents`: multipart `file` + `chatId` (UUID); 202 cu document și stare `indexing`.
- GET `/api/documents?chatId=UUID`: documentele utilizatorului și starea actualizată de indexare.
- GET `/api/documents/ID`: originalul, numai pentru proprietar.
- DELETE `/api/documents/ID`: ștergere completă, numai pentru proprietar.
- POST `/api/chat`: `messages` și opțional `chatId`; cu `chatId` necesită identitate. Răspunsul include `reply`, `sources`, `grounded`, `mode`, `webUsed`, `knowledgeUsed`, `warnings`.

`grounded` înseamnă existența unor surse citate, nu o certificare a corectitudinii. `mode`: `documents`, `mixed`, `web`, `general`. Timeout-ul chatului este de 90 secunde; cel mult 1.800 tokeni pentru răspuns.

## Limite

Manuscrisele/scanările, formulele, diagramele și tabelele pot fi extrase incomplet de indexarea fișierelor încărcate. OCR-ul local al importatorului de manuale nu se aplică automat acestor încărcări. Pentru documentele profesorului cităm fișierul și fragmentul, fără să inventăm pagina; manualele păstrează pagina PDF.

Modelul și serviciile de căutare/indexare sunt OpenAI; fișierele sunt trimise furnizorului pentru indexare, iar întrebările pentru răspuns. Datele originale ale documentelor sunt păstrate și în stocarea privată a site-ului. Responses utilizează `store:false`; acest parametru nu promite retenție zero pentru toate serviciile.

Site-ul rămâne privat. Accesul pentru mai mulți profesori, consumul controlat, evaluarea pedagogică și tratarea erorilor distribuite rămân de dezvoltat. Fișierele DOC, PPTX și HTML sunt acceptate pe baza formatelor documentate de furnizor; în această versiune s-au verificat practic TXT, PDF și DOCX.
