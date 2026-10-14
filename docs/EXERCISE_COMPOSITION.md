# P-077 — Compoziția exercițiilor și sursele

Cererea titularului din 2026-10-14: control asupra exercițiilor originale, copiate textual și din surse cu numere schimbate. A ales explicit numărul de exerciții pe categorie, nu procente; a cerut ulterior câmp liber și precizarea că tipul se poate scrie în prompt.

## Utilizare

Butonul „Exerciții” permite editarea totalului (1–30) și, opțional, a numărului pe categorie. Totalul redistribuie proporțional valorile; editarea unei categorii recalculează totalul. Cele trei câmpuri sunt: Originale ProfPlus; Preluate exact din surse; Din surse, cu numere schimbate. Numere întregi 0–30, total 1–30. Prima deschidere propune 3/4/3, fără a activa aceste valori înainte de „Aplică”. Totalul numără exercițiile principale, nu subpunctele/opțiunile grilei sau răspunsurile baremului. Compoziția aleasă ajustează numărul de itemi în structura modelului și nu adaugă bonusuri peste total. Punctajele se recalculează prin fluxul AI existent.

„Ce fel de exerciții vrei?” permite până la 800 de caractere: tip, temă, dificultate, excluderi. Indică explicit că aceeași cerință poate fi scrisă în prompt. Opțiunea „Urmează doar promptul” dezactivează numerele și golește descrierea în formular; „Aplică” salvează. Poți dezactiva categoriile și păstra numai totalul, ori dezactiva toate numerele și păstra numai descrierea liberă.

„Specifică exercițiile cu subpuncte” permite reguli pe exercițiu: de exemplu 2 cu 3 subpuncte și 5 cu 2. Exercițiile neenumerate sunt fără subpuncte; „Fără subpuncte la toate” aplică explicit lista goală. Fără bifare, structura este aleasă automat. Numerotare globală 1–total, fără reluare pe secțiuni; 1–10 subpuncte a), b), etc. Opțiunile A–D nu sunt subpuncte. Sursele exacte/numerice trebuie să aibă deja structura solicitată. Se aplică testelor/fișelor/exercițiilor; celelalte răspunsuri nu primesc o compoziție forțată.

Preferințele sunt în `selection.exerciseOptions`, JSON-ul existent al conversației. Sunt păstrate în mod automatic/manual și la schimbarea surselor; o conversație nouă începe fără ele. Vizitatorii păstrează numai starea paginii, ca anterior. Fără schemă sau stocare nouă; limite validate în API chat și istoric.

## Surse și verificare

Când sunt cerute exerciții din surse, interogarea existentă de căutare adaugă intenția de a găsi enunțuri complete. Nu extinde selecțiile sau accesul: aceleași ID-uri confirmate, priorități și ownership. Contextul de manuale/documente rămâne cel autorizat, cu aceleași limite de fragmente; rezumatele web nu sunt enunțuri pentru preluare exactă.

Răspunsul structurat cu compoziție are un plan intern (nu expus/persistat): categorie, enunț propus, enunț-sursă, ID numeric și număr de subpuncte. Totalul, numărul pe fiecare exercițiu și ordinea literelor sunt validate; adaptările ample sunt permise numai fără numere pe categorie. Verificarea serverului confruntă planul cu exercițiile numerotate și liniile de proveniență, distribuția cerută și pasajele selectate. Preluarea exactă trebuie să coincidă cu candidatul textual extras; varianta numerică păstrează aceeași semnătură după înlocuirea numerelor și are cel puțin o valoare schimbată. Se ignoră numai spațierea, aldinele/delimitatorii matematici și punctajele adăugate în enunțul documentului. Nu se acceptă schimbări de formulare pentru categoria numerică. Eticheta este „Adaptat prin schimbarea numerelor din ...”, cu citarea reală. Originalele păstrează eticheta existentă.

Revizia testelor existentă este păstrată; fișele cu compoziție primesc și ele o revizie fără a impune format/punctaj de test. Bugetul răspunsului cu compoziție crește la maximum 8.000 de tokeni pentru document și plan; timeoutul rămâne 90 s, același furnizor, store=false. Nu există buclă de retry pentru compoziție. Dacă modelul explică lipsa surselor, nu creează document; dacă planul unui document rămâne invalid, API returnează 422 cu motiv, înainte de salvare/livrare. Nu înlocuiește pe ascuns copiile cu originale.

Verificarea textuală nu dovedește singură că AI a extras întregul exercițiu din pagina originală, nu repară OCR/formule și nu dovedește echivalența pedagogică ori rezolvarea corectă. Alegerea candidatului complet și a unui nivel adecvat este cerută modelului și se verifică de profesor. Nu se extind drepturile de distribuire a originalelor; limitele existente privind preluarea excesivă rămân. Documentele existente nu se reclasifică retroactiv.

## Biblioteca

Implicit: numai materiale disponibile/indexate pentru AI, cu filtre existente de tip, clasă, categorie, căutare și profil. „Toate materialele” rămâne disponibil. „Deselectează concursurile” și „Deselectează olimpiadele” elimină toate ID-urile din categoria respectivă, inclusiv documente personale încadrate astfel; acționează indiferent de filtrele curente. Elimină și prioritățile ID-urilor scoase, păstrând celelalte surse și preferințele exercițiilor. Acțiunile pe rezultate filtrează toate rezultatele, nu numai primele 40 afișate. Selectarea adaugă numai materiale ready fără etichetă de model și respectă 10.000 surse comune / 50 documente. Deselectarea permite scoaterea ID-urilor deja selectate. Trec în mod manual; „Folosește toate materialele potrivite” revine explicit la automatic.

Pe mobil, dialogul întregii biblioteci se derulează și butonul de revenire rămâne vizibil. Se pot accesa lista și filtrele chiar dacă setările ocupă mult din ecran.

## Verificări

Teste de limite, persistență automatic/manual și validare prin istoric cu Auth/DB simulate; compoziție validă și refuz API fără document pentru una invalidă; preluare schimbată, schimbare de formulare, sursă absentă/web, exerciții suplimentare ori metadate necorespunzătoare refuzate. Selectare a 85 rezultate, categorie în ambele namespace-uri, păstrarea celorlalte surse/preferințelor, curățarea priorităților și plafon de 50 documente. Suitele existente de cont/guest/proveniență/LaTeX/formule completează verificarea.

UI verificată la 1280×900 și 390×844 cu fixture local, fără cont/API reale: setare 2/2/2 și cerință liberă; 48 concursuri deselectate dintr-un clic într-o listă de 55 materiale (40 vizibile inițial); filtrare pe manuale și acces prin derulare; cererea trimisă a păstrat cele șase surse rămase și opțiunile 2/2/2, descrierea. Fără apel AI live sau certificat pedagogic. Detectorul Impeccable a semnalat numai fonturile Inter/Roboto preexistente; identitatea existentă este păstrată. Rezultatele finale și publicarea sunt în WORKLOG.
