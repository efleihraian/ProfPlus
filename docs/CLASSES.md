# Clasele mele — P-081

Responsabil: Marcos Soames (cerere explicită din 2026-10-15). Branch `feature/P-081-classes-darkmode`, pornit din `main` 3d9e807. Include și favicon-ul verde și corecturile modului întunecat cerute în aceeași sesiune.

## Ce poate face profesorul

- **Clase în cont**: adaugă (clasa P–XII și litera A–J, fără duplicate, maximum 30) și șterge clase. Pentru conturi, clasele sunt salvate pe server; clasele create anterior numai în browser se mută automat în cont la prima deschidere. Vizitatorii păstrează lista doar în browser și văd invitația de conectare.
- **Documente pe secțiuni** (Planificări, Proiecte de lecție, Teste și evaluări, Fișe de lucru):
  - **Generează cu Plusi**: deschide Asistentul într-o conversație nouă a clasei, cu cererea completată din secțiune, tema opțională și personalizările clasei. Documentul generat se editează și se exportă (PDF/Word/.tex) ca până acum.
  - **Încarcă**: aceleași formate și limite ca restul documentelor (10 MB; 10 documente pe secțiune; 50 pe cont în total), cu stare, deschidere și ștergere cu confirmare.
  - Lista „Generate cu Plusi în această clasă” deschide conversațiile clasei în Asistent.
- **Observații**: jurnalul clasei cu dată, tip (Lecție, Evaluare, Organizare, Altele), text de cel mult 1.000 de caractere, filtre și ștergere; maximum 200 de observații. Interfața cere observații generale, fără nume, note sau alte date personale ale elevilor.
- **Personalizări**: disciplina, nivelul clasei, numărul de elevi (doar număr), manualul și preferințe pentru documente. Plusi le primește în cererile generate din clasă.
- **Chatul ține cont de clasă**: documentele gata încărcate în clasă sunt surse automate numai în conversațiile acelei clase (nu primesc etichetele profilului, deci nu apar automat în alte conversații). Pot fi alese manual din „Alege sursele”.
- Ștergerea unei clase elimină definitiv documentele încărcate în ea (original, index, etichete), observațiile și personalizările; conversațiile generate rămân în istoricul Asistentului, fără proiect.

## Implementare (fără migrare)

- O clasă este un proiect al contului cu numele standard (ex. „Clasa a V-a B”); în Asistent apare ca proiect și grupează conversațiile clasei. Proiectul unei clase nu se șterge din meniul de proiecte al Asistentului, ci din „Clasele mele”, ca documentele clasei să fie șterse corect.
- Documentele pe secțiuni și jurnalul folosesc grupuri interne UUID derivate pe server din identitatea verificată și proiectul clasei (`web/lib/class-workspace.ts`), cu tabelele și operațiile SQL aprobate existente. Grupurile interne (inclusiv biblioteca personală P-080) sunt ascunse din istoric și refuzate ca conversații la deschidere, salvare, ștergere, chat și încărcare.
- Jurnalul se salvează cu control de revizie (409 la conflict între ferestre).
- API: `GET/POST /api/classes`, `GET/PUT/DELETE /api/classes/[id]`, încărcare `POST /api/documents` cu `scope=class`, `classId`, `section`.

## Mod întunecat și favicon

- Favicon-ul folosește logo-ul verde din antet.
- Shell-ul (Acasă, Documente personale, Clasele mele, Plusi, Asistent) folosește jetoane de culoare `--pp-*` cu valori proprii în modul întunecat (verde închis, text deschis); culorile fixe din componente au fost înlocuite cu jetoane. Paleta întunecată globală (Cont, Admin, știri, dialoguri) trece de la albastru la aceeași identitate verde.

## Verificări executate (2026-10-15)

- `tests/class-workspace.mjs` (nou): titluri și grupuri derivate per cont, limite de validare, context pentru Plusi; rute cu bază de date simulată — 401 fără cont, 404 pentru alt cont la citire/ștergere, duplicate/invalide refuzate, proiectele obișnuite nu sunt clase, jurnal cu revizie și conflicte, jurnalul nu apare ca conversație, ștergerea elimină documentele și jurnalul și păstrează conversațiile; încărcare în secțiune cu grup derivat și fără etichete de profil, secțiune invalidă/clasă străină/grup intern refuzate; selecție automată numai în conversațiile clasei. Adăugat în CI.
- Build, TypeScript, `test:account` și toate suitele din CI trecute pe Linux; ESLint fără erori noi (avertismentele/erorile preexistente din `assistant.tsx` rămân 7, ca pe main).
- Probă vizuală: aplicația locală reală (localhost:3000, fără cont) în modul luminos și întunecat pe toate taburile și în Cont; harness cu componentele reale și API simulat pentru clasa autentificată (documente, observații, personalizări) la 1280 și 390 px, luminos și întunecat.

## Limite

- Nu s-a testat cu un cont real autentificat (generare în proiectul clasei, încărcări reale, jurnal salvat în Supabase); se verifică de titular după publicare.
- Numărul de documente este limitat de operațiile existente (10 pe secțiune, 50 pe cont); creșterea cere o migrare.
- Fără catalog de elevi, note sau observații individuale: acestea cer rolurile/izolarea P-043 și o actualizare DPIA înainte.
