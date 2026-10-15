# Meditații, animația taburilor și finisarea designului — P-087

Responsabil: Marcos Soames (cerere din 2026-10-15). Branch `feature/P-087-tutoring-design`, din `main` 06800a4. Livrare prin PR, **neintegrat**: integrarea, aplicarea migrației și publicarea cer autorizarea titularului.

## Tabul „Meditații”

- **Listă publică**: anunțurile profesorilor, cu disciplina, nivelurile (primar, gimnaziu, liceu, Evaluarea Națională, Bacalaureat), modul (online, la elev, la profesor), localitatea, prețul pe oră (sau „la cerere”), numele afișat și descrierea. Filtre: căutare, disciplină, nivel, mod, localitate; pe telefon, filtrele se deschid dintr-un buton.
- **Contact**: telefonul și e-mailul nu sunt în lista publică; apar numai utilizatorilor conectați, la cerere („Arată datele de contact”), pentru anunțuri active.
- **Publicare**: cont ProfPlus cu profil didactic, acord explicit pentru publicare; cel mult 3 anunțuri active per cont, fiecare valabil 60 de zile (prelungire, pauză, editare, ștergere din „Anunțurile tale”).
- **Reguli de conținut**: fără linkuri, adrese web sau date de contact în titlu/descriere (anti-spam și protecția datelor); localitatea e obligatorie pentru meditațiile față în față; preț 0–1000 lei/oră.
- **Moderare**: orice utilizator conectat poate raporta un anunț (o dată per anunț); după 3 raportări anunțul se ascunde automat. Admin → Meditații: lista raportărilor, „Ascunde” / „Restabilește” (restabilirea șterge raportările).
- **Ștergerea contului** elimină anunțurile și raportările contului; ștergerea anunțului elimină și raportările lui.
- Avertisment în pagină: ProfPlus nu verifică identitatea, calificările sau prețurile și nu intermediază plăți; pentru elevii minori, primul contact îl stabilește părintele.

## Date și infrastructură

- Migrație nouă `supabase/migrations/20261015200000_tutoring_ads.sql`: `profplus_tutoring_ads`, `profplus_tutoring_reports`, RLS activ, acces numai `service_role`, constrângeri pe lungimi/valori. **Neaplicată** — până la aplicare, tabul arată „Anunțurile de meditații vor fi disponibile în curând”, iar ștergerea contului nu este blocată de tabelul lipsă.
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

- Fără test cu baza reală (migrația nu e aplicată) și fără login real.
- Fără verificarea identității profesorilor și fără limită de frecvență pentru vizualizarea contactelor (doar autentificare); de evaluat la lansarea generală.
