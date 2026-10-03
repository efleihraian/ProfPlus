# Biblioteca de surse — 0.5.0

Profesorul deschide „Bibliotecă de surse” din bara laterală, antet sau „Alege sursele” deasupra casetei de mesaj.

## Materiale disponibile

- Manualele din catalogul comun al ministerului: 1.349 volume, cu titlu, clasă, disciplină, editură și link oficial PDF. Catalogul complet nu este indexat integral.
- Manualele încărcate/indexate în colecția comună: starea este citită din indexul OpenAI, nu dedusă dintr-un contor sau din catalog. În verificarea acestei versiuni au fost 21 disponibile, inclusiv cele 9 din pilot.
- Documentele încărcate de profesor în oricare dintre conversațiile sale, cu originalul protejat prin identitatea Sites. Documentele private ale altor utilizatori nu sunt expuse.
- Sursele web citate în conversația curentă: linkuri și acțiunea „Întreabă despre sursă”. Nu devin documente indexate prin simpla afișare.

Căutarea ignoră diferențele de majuscule și diacritice și caută în titlu, clasă, disciplină și editură. Filtre: manual/document/web, clasă, materiale încărcate/tot catalogul/surse selectate. Rezultatele sunt afișate treptat, câte 40.

## Selectarea pentru AI

Casetele selectează materialele folosite în căutarea RAG la următorul mesaj. Numai materialele indexate pot fi adăugate; manualele neindexate se pot deschide direct. Limite: 50 manuale și 10 documente. Selecția poate fi golită și este afișată lângă chat.

Selecția explicită este transmisă serverului în `selection.manualIds` și `selection.documentIds`. Serverul verifică starea actuală a manualelor și proprietarul/starea fiecărui document, apoi filtrează efectiv căutarea. Un document poate fi ales din altă conversație a aceluiași profesor. Un ID privat al altui utilizator este respins.

Fără selecție explicită rămâne comportamentul anterior: cele 9 manuale din pilot și documentele conversației curente. Preferința selecției (numai ID-uri) se păstrează în browser. Internetul poate completa informațiile lipsă chiar și când selecția este goală.

Linkurile din bibliotecă deschid PDF-urile originale oficiale, documentele profesorului ori paginile web citate. PDF-urile profesorului sunt servite pentru vizualizare în browser; alte formate se descarcă. Tipul materialului și starea indexării sunt afișate separat.

## Verificare

TypeScript și build trecute. API-ul bibliotecii a returnat toate cele 1.349 volume și stările reale. Alegerea numai a manualului Intuitext a produs citări numai din acel manual; un volum neindexat a fost respins cu 409. O fișă sintetică din altă conversație a aceluiași profesor a fost folosită cu citare. Un alt utilizator nu a primit fișa în bibliotecă și nu a putut-o selecta (409). Fișierele/indexurile de test au fost șterse.

În prima probă modelul a omis citarea pentru fișă; am adăugat o revizuire a răspunsurilor documentare fără citări și am reverificat fluxul. QA vizuală în browser rămâne indisponibilă din cauza restricției întâlnite anterior. Pagini/fraze/documente întregi nu sunt indexate doar prin apariția în catalog; starea „În catalog · încă neindexat” exprimă această limită.
