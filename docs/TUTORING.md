# Meditații, animația taburilor și finisarea designului — P-087

Responsabil: echipa (cerere din 2026-10-15). Branch `feature/P-087-tutoring-design`, din `main` 06800a4. PR #25 integrat și publicat cu autorizarea explicită a titularului; confirmarea livrării este mai jos.

## Tabul „Meditații”

- **Listă publică**: anunțurile profesorilor, cu disciplina, nivelurile (primar, gimnaziu, liceu, Evaluarea Națională, Bacalaureat), modul (online, la elev, la profesor), localitatea, prețul pe oră (sau „la cerere”), numele afișat și descrierea. Filtre: căutare, disciplină, nivel, mod, localitate; pe telefon, filtrele se deschid dintr-un buton.
- **Contact**: telefonul și e-mailul nu sunt în lista publică; apar numai utilizatorilor conectați, la cerere („Arată datele de contact”), pentru anunțuri active.
- **Publicare**: cont ProfPlus cu profil didactic, acord explicit pentru publicare; cel mult 3 anunțuri active per cont, fiecare valabil 60 de zile (prelungire, pauză, editare, ștergere din „Anunțurile tale”).
- **Reguli de conținut**: fără linkuri, adrese web sau date de contact în titlu/descriere (anti-spam și protecția datelor); localitatea e obligatorie pentru meditațiile față în față; preț 0–1000 lei/oră.
- **Moderare**: orice utilizator conectat poate raporta un anunț (o dată per anunț); după 3 raportări anunțul se ascunde automat. Admin → Meditații: lista raportărilor, „Ascunde” / „Restabilește” (restabilirea șterge raportările).
- **Ștergerea contului** elimină anunțurile și raportările contului; ștergerea anunțului elimină și raportările lui.
- Avertisment în pagină: ProfPlus nu verifică identitatea, calificările sau prețurile și nu intermediază plăți; pentru elevii minori, primul contact îl stabilește părintele.

## Date și infrastructură

- Migrație nouă `supabase/migrations/20261015200000_tutoring_ads.sql`: `profplus_tutoring_ads`, `profplus_tutoring_reports`, RLS activ, acces numai `service_role`, constrângeri pe lungimi/valori. **Aplicată la 2026-10-15 23:11:38 București**, înregistrare Supabase `20261015201138 tutoring_ads`. Fallback-ul pentru tabel lipsă rămâne disponibil pentru alte medii.
- Acces numai prin API-ul server (`/api/tutoring`, `/api/tutoring/mine`, `/api/tutoring/[id]`, `/contact`, `/report`, `/api/admin/tutoring`), cu Origin verificat la scrieri și filtrare pe `user_id` din identitatea verificată.

## Animația dintre taburi

Plusi care înota între taburi (P-080) a fost eliminat: nu arăta bine și distrăgea atenția. Rămâne doar bara tabului activ, care alunecă scurt (320 ms) și apare instant cu mișcare redusă. Trecerea între pagini este o estompare de 180 ms.

## Finisarea designului (ghidul de design frontend instalat)

- Fără etichete cu majuscule deasupra titlurilor și fără un singur cuvânt colorat în titluri (Acasă, Documente, Clase, Asistent).
- Interacțiuni discrete: butoanele nu se mai ridică și nu primesc inel la hover; doar schimbarea fundalului; taburile își schimbă culoarea textului, cu focus vizibil la tastatură.
- Mișcare doar la acțiunea utilizatorului: Plusi plutește calm (fără salturi periodice), balonul de pe Acasă nu mai oscilează continuu.
- Pe telefon, cele cinci taburi sunt o bandă derulabilă orizontal, cu tabul activ centrat, în locul grilei 2×2.
- Meditațiile folosesc o listă cu separatoare (nu carduri identice), prețul aliniat la dreapta cu cifre tabulare și detalii extinse în loc.

## Verificări (2026-10-15)

- `tests/tutoring.mjs` (nou, în CI): validare; PostgREST simulat — rânduri cu `user_id` din server, limita de 3, lista publică fără contact, modificări doar de proprietar, contact doar pentru anunțuri active, expirare, raportări (unică per cont, ascundere automată, moderare), ștergerea contului (inclusiv tabel lipsă vs. pană reală); rute — autentificare, profil didactic, acord, Origin, erori pe câmpuri, vizitatori fără contact.
- `tests/plusi-tour.mjs` actualizat cu turul „Meditații”.
- Instalare curată din lockfile, TypeScript, build, toate cele 22 de comenzi web din CI și `npm audit --audit-level=high` (0 vulnerabilități) trecute pe Linux; ESLint fără erori noi.
- Harness cu componentele reale (Chromium, API simulat): Meditații la 1280 px luminos/întunecat și 390 px (listă, detaliu, contact, „Anunțurile tale”, formularul), Acasă după finisare.

## Limite

- Baza reală a fost verificată cu date sintetice eliminate după probă; loginul și fluxul UI complet cu cont real rămân pentru acceptanța titularului.
- Fără verificarea identității profesorilor și fără limită de frecvență pentru vizualizarea contactelor (doar autentificare); de evaluat la lansarea generală.

## Livrare confirmată — 2026-10-15

Merge `956b7c084c9428f7bc4d350e2ae2ddf1b0e20bd3`, CI PR și main verzi; instalare curată, build/TypeScript, 22 comenzi web, 61 teste Python, audit strict zero. Migrație aplicată, RLS/privilegii verificate, probă reală prin store-ul/PostgREST al aplicației (inserare, proiecție publică fără contact, raportare, ștergere și cascadă); zero date de test rămase. Advisorii nu au WARN/ERROR noi; cele două INFO RLS fără politici sunt intenționate pentru tabele service_role-only, iar indexurile noi pot apărea INFO ca neutilizate.

Site v36, source `51decb670a33ab910c136b90d30658eb03fe0ec6`, deployment `appgdep_6ad134317b4c81919fab51699a5571f1`, succeeded la 23:15:08 București, env revision 5 și public păstrate. HTTP live: /, /api/account, /api/tutoring 200; mine și contact fără cont 401. Browser: tab Meditații și pagina se încarcă; schimbare la Clase și înapoi, un indicator și zero mascote în navigare. Prima încărcare a browserului a rămas pe SSR; reîncărcarea a pornit hidratarea și interacțiunile au fost confirmate.

Acceptanță rămasă pentru titular: creează un anunț din contul propriu (profil/acord), vezi contactul din alt cont autentificat, raportează din alt cont și șterge anunțul din contul proprietar. Nu s-a șters niciun cont real.
