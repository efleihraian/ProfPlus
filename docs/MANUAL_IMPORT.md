# Importul extins al manualelor — 0.9.5 local

Solicitare 2026-10-05: restul manualelor, în ordinea matematică → fizică → informatică/TIC → celelalte materii, cu actualizări pe parcurs.

## Acoperire și stare verificabilă

Catalogul ministerului a fost recitit la 2026-10-05: 1.341 înregistrări sursă, 1.349 volume, aceleași ID-uri ca inventarul anterior. Sunt 113 volume de matematică (inclusiv matematică și explorarea mediului), 36 de fizică, 52 de informatică/TIC și 1.148 la celelalte materii. Grupele includ traducerile și normalizează diacriticele. Două URL-uri cu slash codificat au fost verificate în ambele reprezentări: HTTP 206 și semnătură PDF; nu s-au schimbat linkuri funcționale.

Acesta este catalogul disponibil pe manuale.edu.ro, nu dovada că au fost găsite toate edițiile sau toate manualele aprobate. Unele clase/discipline nu apar în catalog; nu inventăm fișiere pentru ele.

[Raportul pe volume](../catalog/manual-import-status.json) este o fotografie datată a importului, cu titlu, materie, clasă, editură, original, hash PDF, pagini și stare. Nu conține cheia, ID-ul indexului, ID-urile fișierelor OpenAI sau textele. Raportul se actualizează la milestone-uri; indexul real stabilește disponibilitatea în aplicație. `indexed` înseamnă confirmat completed de OpenAI; `pending`, `downloading`, `extracting`, `extracted`, `uploaded` și `indexing` nu înseamnă disponibil. `needs_ocr` și `failed` sunt lipsuri explicite.

## Coada și reluarea

`run_manual_import.py --start` lansează un proces local separat și reluabil. Blocări de fișier împiedică două cozi/importuri simultane. O coadă pornită în timpul unui import existent îl așteaptă. Ultima instrucțiune a utilizatorului: import text pentru toate materiile înainte de OCR; matematică → fizică → informatică/TIC → celelalte materii, apoi OCR în aceeași ordine. Volumele scanate rămân explicit incomplete până la etapa OCR. Trecerea cu text folosește trei lucrători și cel mult două reluări suplimentare ale erorilor/indexărilor neterminate. OCR folosește un singur lucrător, pentru consum controlat. Starea și logul sunt în `data/rag/run.json`, `progress.json`, `queue.log`, excluse din Git.

La fiecare reluare se citește indexul existent: finalizările remote sunt reconciliate, iar o atașare dispărută nu rămâne un succes local fals. UID-urile indexate sunt omise; referințele de upload/atașare se păstrează pentru reluare. Hash-ul PDF este înregistrat pentru auditul conținutului; deduplicarea automată a unor UID-uri diferite cu același conținut nu este încă implementată. O eroare de transport după un upload poate lăsa un fișier orfan la furnizor; inventarierea/curățarea lor trebuie verificată, fără a șterge documentele private.

Erorile globale tranzitorii de rețea/API sunt reluate cel mult de două ori în etapa de text, cu pauză de 30 secunde și erori redactate. Erorile de acces/cotă OpenAI și spațiul liber sub 1 GB opresc coada cu stare blocked. Erorile unui PDF sunt înregistrate și celelalte continuă. Nu se afișează excepții brute care ar putea conține credențiale sau text. Dacă Mac-ul este oprit/suspendat, progresul stocat permite reluarea; nu există încă un worker găzduit permanent.

```sh
.venv/bin/python scripts/run_manual_import.py --start
.venv/bin/python scripts/run_manual_import.py
.venv/bin/python scripts/import_manuals.py --status --export-report
.venv/bin/python scripts/verify_manual_search.py --group matematica
```

Verificarea remote cu `--status --reconcile --export-report` se rulează când blocarea importului este liberă; nu se lansează un import duplicat pentru verificare. Pentru un lot separat se poate folosi `--subject-group matematica|fizica|informatica_tic|alte_materii`. `--ocr --only-ocr` reia numai fișierele identificate pentru OCR.

## Calitate și resurse

Fiecare PDF este procesat într-un subprocess separat: 180 secunde pentru extracție obișnuită, maximum două ore pentru un volum cu OCR și 90 secunde pentru o pagină OCR. Un PDF dificil nu blochează celelalte fire de download/indexare. Se păstrează paginile prin marcaje `[[PAGE:n]]`, apoi fragmente de 500 tokeni cu suprapunere 100.

Pragul pentru volume noi este minimum 90% pagini cu cel puțin 60 caractere extrase. Sub prag nu se încarcă textul parțial în index; volumul este separat pentru OCR. Este un filtru tehnic, nu validare pedagogică: nu garantează că toate paginile, formulele, fracțiile, diagramele sau tabelele sunt reprezentate corect. Pagini de copertă/albe pot scădea acoperirea. Pilotul anterior își păstrează dovezile istorice.

OCR folosește Tesseract și modele oficiale tessdata_fast, local, cu licența păstrată. Sunt disponibile ron/eng/hun/deu/fra/ita/spa/hrv/rus/srp/slk/tur/ukr/lat; disciplina indică modelele suplimentare, nu un ID de limbă presupus. Pentru romani nu există în configurația actuală un model verificat: scanările respective sunt marcate cu eroare, fără a pretinde indexare corectă. Eșantioanele de formule și traduceri necesită verificare separată.

Download numai prin HTTPS de la manuale.edu.ro/www.manuale.edu.ro, inclusiv verificarea fiecărui redirect înainte de request. Maximum 250 MB/PDF, semnătură PDF verificată și fără execuție. Originalele temporare sunt șterse după extracție/identificarea pentru OCR; pentru OCR se descarcă din nou. Textul extras, starea completă și credențialele sunt în directoare ignorate. Nu se redistribuie PDF-uri în Git sau prin site; citările deschid originalul ministerului. Accesul public nu este prezentat ca licență de redistribuire; drepturile utilizării extinse/comerciale rămân de verificat înainte de producție.

Fișierele text sunt trimise numai în indexul OpenAI existent, deja autorizat. Nu se trimit date ale elevilor sau conturi în acest import. Extinderea poate crește stocarea facturată de furnizor; nu se modifică abonamente ori limite de cont. Cheia rămâne pe server.

## Biblioteca și verificări

Contorul principal și API `/api/library/status` acoperă acum toate manualele din catalog, nu doar pilotul de nouă. Pagina verifică periodic disponibilitatea; biblioteca recitește indexul la deschidere. După indexare, sursele potrivite profilului intră automat în RAG, fără modificarea selecțiilor personalizate. Variantele neindexate rămân deschise la original, fără selecție pentru AI. Același index comun este accesibil site-ului privat existent; codul online rămâne versiunea publicată anterior și nu este redeployat în această sarcină locală.

Teste offline: prioritate inclusiv diacritice/TIC, surse/redirecturi permise, PDF fără text neîncărcat, timeout izolat, reluare fără reupload normal, reconciliere remote și raport fără identificatori de furnizor. Test de bibliotecă paginată: matematică în afara pilotului, fizică/informatică, excludere UID necunoscut și autentificare. [Verificările reale de căutare](../catalog/manual-search-verification.json) păstrează UID, pagini și număr de rezultate, fără textul manualului; copia internă este în `data/rag/search-verification.json`. Se folosește pragul 0,25 și rescrierea interogării ca în aplicație. Ele verifică proveniența și marcajele de pagină, nu corectitudinea răspunsurilor AI.

Urmărire în acest chat la 15 minute, cu update la milestone, minimum 20 volume noi, trecerea la OCR ori eroare. Automatizarea `importul-manualelor-profplus` trebuie încheiată după raportul final sau la oprirea de către utilizator. Pentru verificările locale, Mac-ul și aplicația Codex trebuie să rămână active. Nu anunța finalizarea întregului catalog până când raportul diferențiază toate succesele și lipsurile.


Ultima instrucțiune: fără scheduled task sau update-uri intermediare. Coada execută numai text și verificare, apoi se oprește în awaiting_ocr. OCR este etapă separată, pornită ulterior. Nu există mecanism de notificare automată în chat după încheierea turei fără o automatizare activă.
