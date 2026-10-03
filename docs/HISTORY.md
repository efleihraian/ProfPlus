# Proiecte și istoric — 0.6.0

„Proiecte și istoric” este accesibil în bara laterală și în antet, inclusiv pe mobil. Creează proiecte, filtrează conversațiile după proiect, caută după titlu și redeschide un chat. Titlul implicit provine din primul mesaj. Selectorul „Proiect” organizează conversația curentă; proiectele sunt grupuri de conversații, nu indexuri RAG independente. Documentele rămân atașate conversației; biblioteca permite selectarea documentelor proprii din alte conversații.

D1 păstrează proiectele și conversațiile pe identitatea furnizată de Sites. LocalStorage păstrează numai identificatorul ultimului chat. Transcriptul include mesajele, sursele și avertismentele. Selecția explicită a surselor este salvata pe server. Conversațiile nu sunt partajate cu alte conturi; site-ul rămâne privat.

Mesajul utilizatorului este salvat înainte de apelul AI. Răspunsul este adăugat de server înainte de trimitere; clientul poate reîncerca salvarea dacă nu a fost confirmată. Revizia numerică previne suprascrierea între ferestre. La conflict, poți reîncerca sau renunța explicit la modificările locale și redeschide versiunea salvată. Schimbarea conversației este blocată cât timp există modificări nesalvate. Închiderea unei cereri AI poate opri generarea; mesajul utilizatorului rămâne salvat.

GET /api/history listează proiectele și titlurile; GET ?id=UUID returnează un transcript deținut de utilizator. POST creează un proiect (kind=project, name) sau conversație (projectId opțional). PUT salvează id, revision, messages, selection, projectId și titlu opțional. Toate folosesc identitatea Sites; mutările verifică proprietarul proiectului. 401 fără identitate, 403 origine externă, 404 acces indisponibil, 409 revizie concurentă. Limite: 100 caractere/proiect, 1 MB/transcript și 1.000 mesaje; modelul primește ultimele 20 mesaje, maximum 6.000 caractere fiecare.

Migrarea 0001 adaugă tabelele fără a modifica migrarea aplicată 0000. Grupurile existente de documente sunt adoptate ca „Documente anterioare”. Mesajele din versiunile anterioare nu au fost salvate și nu pot fi reconstruite. Nu există încă ștergere/export al conversațiilor sau redenumire a proiectelor.

Verificări locale: TypeScript și lint pentru fișierele schimbate, build de producție, CRUD proiecte/chat, salvare/redeschidere cu citări și selecție, mutare, revizie concurentă, autentificare, origine și izolare între conturi. Datele sintetice sunt șterse. QA vizual în browser indisponibil. Lint general are două erori preexistente în library-panel.tsx privind efectele React.
