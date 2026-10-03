# Proiecte și istoric — 0.7.0

Proiectele și istoricul sunt exclusiv în bara din stânga. Butonul de lângă „Proiecte” deschide formularul pentru un proiect nou. Proiectele se extind pentru a arăta conversațiile; fiecare are „Conversație în proiect”. „Conversație nouă” din partea de sus creează un chat fără proiect. Căutarea filtrează titlurile, inclusiv fără diacritice. Meniul „···” al fiecărei conversații deschide un dialog pentru mutare sau ștergere. Proiectele au meniu de ștergere. Titlurile au spațiu separat de butonul de opțiuni. Pe telefon, bara se deschide din meniu și se închide cu fundalul, butonul X sau Escape. Zona centrală este dedicată chatului. Proiectele grupează conversațiile și documentele acestora, fără indexuri RAG separate. Biblioteca permite selectarea documentelor proprii din alte conversații.

D1 păstrează proiectele și conversațiile pe identitatea furnizată de Sites. LocalStorage păstrează numai identificatorul ultimului chat. Transcriptul include mesajele, sursele și avertismentele. Selecția explicită a surselor este salvata pe server. Conversațiile nu sunt partajate cu alte conturi; site-ul rămâne privat.

Mesajul utilizatorului este salvat înainte de apelul AI. Răspunsul este adăugat de server înainte de trimitere; clientul poate reîncerca salvarea dacă nu a fost confirmată. Revizia numerică previne suprascrierea între ferestre. La conflict, poți reîncerca sau renunța explicit la modificările locale și redeschide versiunea salvată. Schimbarea conversației este blocată cât timp există modificări nesalvate. Închiderea unei cereri AI poate opri generarea; mesajul utilizatorului rămâne salvat.

GET /api/history listează proiectele și titlurile; GET ?id=UUID returnează un transcript deținut de utilizator. POST creează un proiect (kind=project, name) sau conversație (projectId opțional). PUT salvează id, revision, messages, selection, projectId și titlu opțional. Toate folosesc identitatea Sites; mutările verifică proprietarul proiectului. 401 fără identitate, 403 origine externă, 404 acces indisponibil, 409 revizie concurentă. Limite: 100 caractere/proiect, 1 MB/transcript și 1.000 mesaje; modelul primește ultimele 20 mesaje, maximum 6.000 caractere fiecare.

Migrarea 0001 adaugă tabelele fără a modifica migrarea aplicată 0000. Grupurile existente de documente sunt adoptate ca „Documente anterioare”. Mesajele din versiunile anterioare nu au fost salvate și nu pot fi reconstruite. Exportul conversațiilor și redenumirea proiectelor nu sunt încă disponibile.

Verificări locale: TypeScript și lint pentru fișierele schimbate, build de producție, CRUD proiecte/chat, salvare/redeschidere cu citări și selecție, mutare, revizie concurentă, autentificare, origine și izolare între conturi. Datele sintetice sunt șterse. QA vizual în browser indisponibil. Lint general are două erori preexistente în library-panel.tsx privind efectele React.

## Ștergere

DELETE /api/history?kind=chat|project&id=UUID necesită identitate Sites, aceeași origine și proprietarul elementului. Conversația este marcată deleted=1, iar messages, selection și titlul sunt golite/înlocuite. Înregistrarea minimă previne adoptarea din nou a documentelor ca „Documente anterioare”. Listele, încărcarea chatului, salvarea și completarea AI exclud conversațiile șterse. Documentele și indexurile lor rămân accesibile în bibliotecă și se șterg separat. Nu există restaurarea transcriptului din aplicație.

Ștergerea proiectului mută conversațiile la project_id=NULL și mărește reviziile într-un batch D1 atomic înainte de eliminarea proiectului. Conversațiile și documentele sunt păstrate. Confirmarea UI explică diferența. Migrarea 0002 adaugă deleted fără a modifica migrările aplicate.

Verificări 0.7.0: TypeScript, lint fișiere modificate, build; DELETE 401/403/404/400, proprietar, proiect eliminat cu transcript păstrat, chat eliminat cu transcript golit, metadate documente păstrate, chatul nu reapare după listări, salvarea veche respinsă. Datele de test locale șterse. QA vizual/interactiv în browser nu a fost executat.
