# Biblioteca de surse — 0.9.5 local

Profesorul deschide „Bibliotecă” din bara laterală sau „Alege sursele” deasupra mesajului. Biblioteca permite căutare, filtre, selecție, încadrarea documentelor proprii și deschiderea originalelor.

## Selecție automată

Profilul didactic stabilește disciplina și ciclurile 0–4/5–8/9–12; învățătorul acoperă toate materiile 0–4. În modul automat sunt incluse **toate materialele accesibile și indexate care corespund profilului**, indiferent dacă sunt manuale, culegeri, olimpiade, concursuri sau alte documente. Serverul recalculează lista la fiecare mesaj folosind identitatea și profilul verificate, starea actuală a indexurilor și metadatele materialelor. Un material nou intră după finalizarea indexării, fără recrearea conversației.

Sunt eligibile sursele comune și documentele proprii din toate conversațiile; niciun document al altui profesor. Documentele vechi fără etichete nu sunt clasificate prin presupunerea conținutului: pot fi încadrate manual, selectate explicit, iar cele atașate conversației curente rămân în contextul implicit. Materia generală Matematica include variantele de manual în germană și maghiară; alegerea unei discipline explicit într-o anumită limbă rămâne specifică acelei variante.

O bifare/debifare sau golirea selecției activează **Selecție personalizată**, salvată cu conversația. Aceasta se păstrează inclusiv după schimbarea profilului. „Folosește toate materialele potrivite” reactivează modul automat. Persistarea modului automat nu îngheață ID-urile surselor; serverul ignoră orice listă de ID-uri trimisă împreună cu acest mod și rezolvă din nou accesul.

Dacă verificarea indexurilor nu reușește, aplicația afișează eroarea; nu prezintă o selecție parțială drept completă. Sursele manuale sunt reverificate pe server înainte de RAG. Căutarea acoperă sursele selectate și trimite modelului numai pasajele relevante, nu toate documentele simultan.

## Încadrarea documentelor proprii

Documentele noi primesc inițial materia și ciclurile profilului, cu tipul „Alt document”. Acestea sunt etichete propuse din profil, nu rezultatul unei clasificări AI a conținutului. Profesorul verifică și modifică din „Încadrează materialul”: Manual / Culegere / Olimpiadă / Concurs / Alt document, materia și clasele. Documentul rămâne privat.

Metadatele sunt stocate în D1 `document_labels`, separat de original, și validate pe server. API PATCH verifică identitatea, originea, formatul JSON, valorile permise și proprietarul. Etichetele se șterg cu documentul sau contul; alte conturi sunt păstrate. Nu se adaugă nume de școală/elevi ori trackere.

## Sursele comune și limitele reale

Catalogul ministerului este în `web/lib/manual-catalog.json`; apariția în catalog nu înseamnă indexare. Pilotul documentat are 9 manuale de matematică V. Starea reală citită din index decide ce poate participa; lista `active-collection.json` servește contorul pilotului, nu plafonează selecția automată.

Registrul pentru alte materiale comune este `web/lib/educational-resources.json`, momentan gol. Pentru fiecare material comun nou se adaugă UID, titlu, `subject`, `stages`, `category`, URL original și opțional clasă/editură, după verificarea drepturilor de utilizare. Același UID trebuie să fie în atributul fișierului indexat. Registrul singur nu importă/indexează fișiere; nu inventăm culegeri sau concursuri deja încărcate. Încărcarea privată și încadrarea sunt disponibile profesorului; nu există încă un panou de administrare pentru importuri comune.

Limite actuale: 10 MB/fișier, 10 documente/conversație și 50/cont; selecția explicită permite până la 50 documente și 5.000 ID-uri de surse comune. Indexurile private sunt căutate cu maximum 4 cereri simultane. La creșterea colecției comune trebuie evaluată scalarea filtrării și costul; limita de validare nu constituie o probă de performanță pe mii de materiale.

Sursele web citate se pot deschide și discuta, dar nu devin automat documente indexate. Linkurile private trec prin verificarea identității și proprietarului; nu există URL public permanent. PDF-ul poate fi vizualizat inline, celelalte formate se descarcă.

## Verificări 0.9.4

Teste pentru toate cele cinci categorii, surse nou indexate, excluderea disciplinei/ciclului greșit, învățător, variante de limbă, persistență dinamică/manuală, documente proprii din alte conversații, respingerea ID-ului altui cont, CSRF/format/validare, eliminarea etichetelor la ștergerea contului. D1/R2 și Auth de test sunt izolate; niciun cont real nu a fost șters. QA de interfață folosește un document fictiv, fără apeluri reale AI. Nu a fost repetată evaluarea pedagogică a răspunsurilor AI în această schimbare.

## Import extins 0.9.5

Importul întregului catalog a fost reluat în ordinea matematică, fizică, informatică/TIC și restul. Contorul principal acoperă acum toate UID-urile de manuale confirmate, nu doar pilotul. Disponibilitatea din index și selecția după profil rămân decisive; simpla inventariere sau descărcare nu activează AI-ul. Raportul, OCR și limitele sunt în [MANUAL_IMPORT.md](MANUAL_IMPORT.md). Nu s-au inventat culegeri sau concursuri suplimentare.


## Acces actual — P-051

Catalog comun vizibil tuturor, inclusiv vizitatori; numai sursele indexate sunt selectabile pentru AI. Documentele conturilor nu sunt publice. Viitor: abonament verificat pe server pentru selecții specifice, vizibilitate catalog păstrată.

## Verificarea indexului și erori — P-059

Verificare completă până la 120 secunde; cache server 5 minute, cereri simultane reunite. Eșecul sau configurația absentă afișează starea indexării neverificată și exclude selecția AI. Numai o verificare completă poate confirma catalog/neindexat. Cache-ul include exclusiv surse comune; documentele private sunt autorizate separat.

Limita cache-ului P-059: snapshotul de 5 minute este în memoria instanței serverului. În pilotul Sites, a doua cerere separată a durat 42,69 secunde; reutilizarea între instanțe nu este garantată. Corectitudinea online a trecut în ambele cereri, dar nu se declară o accelerare persistentă a găzduirii. Local, reutilizarea a fost 0,03 secunde.
