# Profil didactic și ștergere cont — ProfPlus 0.9.3 local

## Utilizare

După prima conectare prin Google/Apple, profesorul completează profilul didactic. Învățător: toate materiile, clasele 0–4. Profesor: o disciplină din catalog și unul sau mai multe cicluri 0–4, 5–8, 9–12. Alegerile se modifică ulterior din Cont și setări → Profil didactic. Se păstrează numai aceste alegeri în metadata Supabase, fără școală, adresă sau informații despre elevi.

Conversațiile noi preselectează manualele potrivite din colecția activă. Pentru Matematica, 5–8 sunt 7 manuale în română; cele în germană/maghiară au discipline distincte în catalog. Învățătorii și celelalte discipline nu primesc automat manualele de matematică V. Colecția are încă numai cele 9 manuale V; un profil fără surse indexate începe fără manuale selectate. Catalogul se poate consulta în continuare, filtrele se pot dezactiva și sursele se pot selecta manual. Selecțiile explicite ale conversațiilor existente se păstrează. Documentele proprii rămân vizibile, fără clasificarea lor prin presupuneri.

Delogarea este disponibilă în bara laterală și în pagina contului. Încheie sesiunea browserului și curăță preferințele ProfPlus locale; nu șterge conținutul salvat pe server. Opțiunea pentru toate dispozitivele rămâne în Conectare și securitate.

## Ștergere

Cont și setări → Șterge contul → confirmare STERGE. Serverul cere autentificare recentă (15 minute, timpul amr verificat după getUser), validează originea și derivează proprietarul exclusiv din identitatea autentificată. Un ID trimis de client nu poate selecta alt cont. Este ștergere definitivă, nu dezactivare.

1. Marchează ștergerea în D1 și blochează accesul la chat/documente și noi rezervări de încărcare/istoric. O încărcare recentă în curs cere reîncercare după finalizare; operația de blocare este ordonată atomic față de rezervări.
2. Pentru fiecare document propriu: index OpenAI, fișier OpenAI, original R2, apoi metadata D1. HTTP 404 de la furnizor înseamnă deja eliminat. Un eșec păstrează referințele pentru reluare.
3. Elimină conversațiile, inclusiv marcajele conversațiilor șterse anterior, și proiectele proprii.
4. Elimină definitiv utilizatorul Supabase și metadata de profil; elimină marcajul de ștergere și cookie-ul local.

Dacă un furnizor eșuează înainte de eliminarea identității, pagina permite reluarea. Contul nu mai poate accesa datele rămase. Confirmarea de succes nu este afișată la eșec. Dacă identitatea a fost eliminată, dar ultima curățare D1 eșuează, reluarea necesită intervenția operatorului; automatizarea/monitorizarea acestei situații rămâne P-039.

Ștergerea nu elimină manualele comune, conturile Google/Apple, descărcările deja salvate de utilizator sau automat datele separate ale vechiului pilot Sites. În cazul Apple, linkul și instrucțiunile de oprire a autorizării sunt afișate înainte și după ștergere, fără a bloca ștergerea ProfPlus. Nu există încă revocare Apple automată; aceasta este necesară în pregătirea aplicației iOS.

## Configurare server local

În web/.dev.vars se păstrează SUPABASE_SECRET_KEY, numai pe server, cu permisiuni 0600 și exclus din Git. Cheia administrativă este folosită exclusiv pe ruta de ștergere a contului autentificat. DB, DOCUMENTS și cheia OpenAI pentru fișiere/indexuri trebuie să fie disponibile. Lipsa configurației dezactivează confirmarea și API-ul nu pretinde ștergerea. La găzduire se folosește managerul de secrete al platformei; cheia nu trebuie adăugată în frontend.

Migrarea D1 0003 adaugă account_deletions. Inițializarea idempotentă susține pilotul local existent. Nu migrează identități Sites/Supabase pe baza e-mailului. Versiunea online 0.9.2 nu este modificată de această sarcină.

## Dovezi și limite

- TypeScript și build trecute; npm run test:account verifică validarea/preselecția, stadiile școlare, eșec/reluare și proprietarul în pipeline.
- Testele Auth folosesc furnizor sintetic și D1/R2 izolate: autentificare recentă, origine, confirmare, eroare admin, cont blocat, retry, țintă derivată de server, conversații/proiecte/original șterse și datele altui cont păstrate.
- API-ul administrativ Supabase real verificat numai prin citire. Contul titularului nu este șters; alegerile didactice din QA browser nu sunt salvate pe contul lui.
- UI desktop și 390px: controale, validări, dialog anulabil și lipsa depășirii orizontale. Capturile sunt locale, ignorate de Git.
- Probele nu demonstrează ștergerea copiilor de siguranță, logurilor sau tuturor stocărilor furnizorilor. Contractele, retențiile, drepturile, monitorizarea reluărilor, testele reale dedicate și evaluarea GDPR/DPIA completă rămân deschise.

[Supabase deleteUser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser), [Supabase user data](https://supabase.com/docs/guides/auth/managing-user-data), [Apple account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj). Aplicația folosește R2, nu Supabase Storage; înainte de introducerea acestuia trebuie tratate obiectele deținute de utilizator.
