# Documente educaționale editabile — 0.8.0

Când răspunsul creează efectiv un test, barem, planificare, fișă sau alt document reutilizabil, evaluarea AI returnează indicatorul și titlul documentului. Interfața deschide automat un dialog cu previzualizare. Explicațiile despre documente și întrebările de clarificare rămân mesaje obișnuite.

Profesorul poate modifica titlul și conținutul direct, aplica aldin/cursiv, titluri și liste, apoi salva în conversație. Cardul documentului redeschide editorul, inclusiv din istoric. Editarea folosește HTML sigur randat din Markdown și serializare înapoi în Markdown; lipirea acceptă text simplu. HTML arbitrar și imagini externe nu sunt randate. Închiderea cu modificări nesalvate cere salvare sau renunțare explicită.

Exportul folosește versiunea curentă din editor, chiar înainte de salvare. PDF: A4, font Noto Sans inclus cu licență SIL, diacritice, titluri, tabele, paginare și numere de pagină. Word: DOCX editabil cu paragrafe, titluri, formatare și tabele native. Sursele originale sunt anexate când există. Generarea fișierelor se face în browser, fără un serviciu extern de conversie.

Date: obiect `{title, content}` în mesajul asistentului din transcriptul D1, fără migrare SQL. Salvarea actualizează și textul mesajului folosit pentru contextul AI. Se păstrează verificările de proprietar, revizie și ștergere. Titlu maximum 200 caractere; conținut maximum 20.000 caractere. Bugetul răspunsului AI este 4.000 tokeni.

## Verificări executate

- TypeScript și build de producție.
- Trei apeluri OpenAI reale: test cu barem → document; explicație despre barem → mesaj obișnuit; barem generat din UI → dialog deschis automat.
- Documentul salvat de server, editare și recuperare la redeschidere, alt cont respins, document invalid respins.
- PDF și DOCX generate din conținut modificat: diacritice, tabele și text editat verificate; PDF de 4 pagini, prima pagină inspectată vizual.
- UI locală cu identitate sintetică injectată exclusiv de un proxy loopback temporar: deschidere card, editare titlu/conținut, salvare, previzualizare, meniu și export PDF fără eroare vizibilă. Nu s-a modificat autentificarea aplicației.

## Limite

Editorul oferă formatare de bază, nu toate funcțiile Word. Formula matematică nu are încă editor specializat; imagini/diagrame nu se exportă. PDF simplifică formatarea inline; titlurile sunt aldine. Nu există istoric separat de versiuni ale documentului. Previzualizarea se derulează continuu; paginarea efectivă se face la export PDF. Detectarea documentului este o decizie AI și trebuie evaluată pe mai multe cereri pedagogice. Responsive-ul este implementat, dar nu a fost testat pe dispozitive fizice.


### Export cu sursa simplificată

Bifează în meniul Export „Doar sursa, fără detalii de proveniență” pentru PDF sau Word. Copia exportată păstrează sursele disponibile, fără clasificarea preluat/adaptat/original și fără datele marcate neprecizate. Documentul din editor păstrează proveniența completă. Opțiunea este implicit dezactivată.
