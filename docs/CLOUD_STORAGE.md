# Stocarea ProfPlus în Supabase

P-057, cererea titularului din 9 octombrie 2026. Transferul materialelor disponibile pe disc și cutoverul aplicației au fost confirmate. Originalele șterse anterior de vechiul importer necesită recuperare separată din sursele oficiale; importul complet al arhivelor este P-056.

## Structura

- `profplus-library`: materiale comune, text extras, originale disponibile și inventarele de surse; obiecte private, adresate prin SHA-256, fără suprascrierea conținutului.
- `profplus-private-documents`: originalele încărcate de profesori; ID document, acces exclusiv prin server după verificarea proprietarului.
- `profplus-import-state`: evidența verificată a transferurilor și checkpointuri de import. Fără credențiale; acces administrativ, fără URL public.
- PostgreSQL: documents, document_labels, conversations (inclusiv documentele generate), projects, account_deletions, guest_chat_budget, library_materials, library_import_documents și library_import_urls. Schema/RLS au fost aplicate și verificate pe proiectul ProfPlus după reconectarea conectorului administrativ, la 9 octombrie 2026.

Supabase Storage păstrează fișierele binare; PostgreSQL păstrează metadatele și starea. Indexul AI OpenAI existent este păstrat pentru funcționarea căutării; transferul fișierelor nu reconstruiește automat indexul în pgvector. Cheile sunt folosite numai pe server și nu intră în Git, browser sau rapoarte.

Identitățile existente rămân distincte: `supabase:<uuid>` pentru conturile locale și identificatorul Sites pentru pilotul publicat. Nu se asociază automat conturi/istorice. Politicile RLS au ownership pentru identitățile Supabase, dar privilegiile directe anon/authenticated sunt revocate; operațiile aplicației sunt executate doar pe server după autorizarea existentă. Operația RPC acceptă exclusiv ID-uri ale unor interogări fixe, parametrizate, cu liste permise; nu acceptă SQL din client. Batch-ul este atomic, iar rezervările de upload și blocarea ștergerii contului folosesc aceeași blocare pe proprietar.

## Transfer și ștergere locală

`cloud_library.py` descarcă obiectul după upload și compară dimensiunea și SHA-256. Confirmă și evidența în cloud înainte de a elimina copia locală. Dacă fișierul s-a schimbat în timpul transferului, uploadul/verificarea/evidența eșuează sau limita furnizorului este atinsă, copia locală este păstrată. Reluarea este idempotentă.

Comanda de migrare folosește numai rădăcinile explicite ale importurilor ProfPlus. Nu scanează sau curăță global discul. Textele indexate ale importului activ se pot muta; textele încă neindexate sunt păstrate până la confirmare. Checkpointul este salvat consistent, inclusiv când SQLite folosește WAL. Copiile de lucru SQLite rămân necesare importului activ până la verificarea restaurării/cutoverului; nu sunt șterse orbește.

Exemplu, fără credențiale în argumente:

```bash
export PROFPLUS_OPERATIONAL_ROOT=/cale/catre/copia-operationala
python scripts/migrate_library_storage.py \
  --operational-root /cale/catre/copia-operationala \
  --competition-root /cale/catre/importul-olimpiadelor \
  --delete-verified
```

Opțional, `--references-root /cale/ProfPlus/Surse` include inventarele originale; `sources/` sincronizat al proiectului ChatGPT rămâne read-only și nu se șterge. Originalele pe care vechiul importer le-a eliminat deja după OCR nu există pe disc pentru transfer; recopiile complete necesită recuperarea din sursele oficiale și capacitate suficientă în planul Supabase. Nu se declară arhiva completă după mutarea textelor disponibile.

`PROFPLUS_CLOUD_LIBRARY=true` activează retenția cloud în importerele actualizate: originalul este confirmat în Storage înainte de eliminare, textul este eliminat local după indexare și copie cloud verificată. La o eroare cloud, originalul local este păstrat și fluxul olimpiadelor se oprește. Modelele Tesseract, configurațiile, fișierele de cod și datele încă folosite de procese sunt necesare, nu fișiere inutile.

## Activare PostgreSQL și aplicație

1. Reconectează contul Supabase prin Settings → Plugins → Supabase → Connect/Reconnect, cu acces la proiectul ProfPlus existent.
2. Aplică migrarea creată de Supabase CLI în `supabase/migrations/`. Verifică advisors și accesul negativ anon/autentificat; repetă probele pe două conturi reale de test, fără date reale ale elevilor.
3. Rulează `sync_cloud_catalog.py` cu aceleași două rădăcini. Scriptul citește evidențele private din Storage, scrie tabelele și verifică fiecare rând. Dacă schema lipsește, se oprește fără să declare succes.
4. Pentru site: deschide sursa publicată prin workflow-ul Sites, integrează modificările, execută verificările/buildul și publică privat. Configurează SUPABASE_URL/SUPABASE_SECRET_KEY exclusiv ca valori de runtime protejate. Păstrează autentificarea și audiența existente.
5. Transferă istoricul complet din server, nu din proiecția limitată a conectorului. Proiecția Sites avea un mesaj trunchiat și nu poate servi drept backup fidel. Endpointul temporar `POST /api/admin/migrate-storage` funcționează numai cu DATA_MIGRATION_LOCK=true, secret administrativ dedicat de minimum 40 caractere, termen de expirare și Origin corect. Nu returnează conținuturi; verifică fiecare rând și fiecare original, păstrând sursa. Nu se generează o cheie persistentă pentru această operație.
6. După confirmarea migrării și testelor pe infrastructura reală, setează DATA_BACKEND=supabase și elimină blocarea, cheia și termenul endpointului temporar. Dacă Supabase e indisponibil, aplicația refuză operația; nu scrie automat în vechea bază.
7. Migrează și verifică separat cache-ul local D1 (un istoric local existent), apoi elimină doar fișierele de cache ale stocării vechi. Păstrează copiile cloud de rollback până la confirmarea cutoverului și aplică retenția documentată. Nu considera un build drept dovadă că datele au fost migrate.

## Verificări și limite

Verificarea tranzacțională pe proiectul Supabase real a trecut pentru două identități sintetice, ownership, refuz direct anon/autentificat, parametrizare și rollback. Restaurarea inventarului Word din Storage a trecut prin verificarea hashului și a dimensiunii. Nu s-au creat sau șters conturi reale. Opt teste pentru transfer/ștergere/TUS/restaurare, 11 teste import olimpiade, șapte teste import manuale, test adaptor Supabase și verificare TypeScript au trecut. PostgreSQL în WASM a executat toate cele 43 operații fixe și a verificat RLS/ownership, refuz anon, injecție SQL, rollback atomic și limita de documente. Aceste probe nu înlocuiesc verificarea proiectului Supabase real, advisors sau concurența din rețea.

Nu s-a schimbat planul de abonament. Capacitatea, mărimea maximă pe fișier și costurile bibliotecii complete se verifică înainte de recuperarea tuturor originalelor. Importul și migrarea existente rulează încă pe Mac; un server de procesare independent nu este încă provisionat. Confidențialitatea, drepturile materialelor, backupul și retenția furnizorilor se evaluează separat; acest transfer nu reprezintă o certificare GDPR.

## Restaurare verificată

Folosește `scripts/restore_cloud_material.py` cu `--operational-root`, `--family`, `--uid`, `--kind` și `--output`. Destinația trebuie să fie un fișier nou; nu suprascrie date existente. Pentru un checkpoint: `--family checkpoints --uid manuals --kind text`; pentru inventarul Word: `--family references --uid reference-96f618a88e8e8b13146c26e2 --kind reference`. Cheile rămân în configurația serverului.

Importerele păstrează acum și fiecare evidență de material în PostgreSQL înaintea ștergerii locale; checkpointul consistent actualizează tabelele de stare/URL-uri. Copiile SQLite sunt cache de lucru regenerabil, nu singura evidență. Cheile OAuth din folderul Site și fișierele sursă necesare aplicației sunt păstrate; nu sunt materiale inutile.

## Rezultatul verificat, 9 octombrie 2026

DATA_BACKEND=supabase activ pe site și local. Cele patru conversații din Sites și istoricul local au fost transferate integral, rând cu rând; copiile locale vechi au fost eliminate după backup/verificare. Endpointul administrativ temporar este dezactivat, secretele sale au fost eliminate. Site-ul a păstrat audiența privată. Ultimul PDF mare a folosit [uploadul TUS oficial](https://supabase.com/docs/guides/storage/uploads/resumable-uploads), în bucăți de 6 MB, apoi download/hash complet. Directorul PDF și directoarele text locale erau goale la finalul transferului; importul reluat creează doar copii de lucru temporare și le elimină după confirmare.

Cele două baze SQLite de import sunt cache necesar procesului activ, cu checkpointuri private verificate și evidență relațională în Supabase. Se pot restaura cu scriptul dedicat înainte de reluarea într-un checkout nou; nu se pornește un import cu o bază goală în locul checkpointului. Pentru materiale încă neindexate, --include-pending cere blocarea exclusivă a importurilor înainte de transfer; restaurarea textului din cloud este automată la indexare.

Migrațiile din Git corespund exact istoricului serverului (20261009074150 profplus_cloud_library, 20261009074413 restrict_internal_rls_trigger). Fișierele au fost create prin CLI și redenumite numai pentru alinierea versiunilor returnate de aplicarea nativă. Generatoarele sunt instrumente de redactare inițială; nu regenera sau modifica migrații deja aplicate. Pentru schimbări ulterioare creează o migrație nouă. Variabilele necesare fără valori secrete sunt în .env.example; pe site se configurează ca valori runtime protejate.

## Copia operațională unică — 9 octombrie 2026

Importul și aplicația sunt consolidate în directorul principal; checkout-urile suplimentare pot fi eliminate după verificarea publicării și a transferului. Logo-urile originale sunt în arhiva privată references/profplus-brand-originals/reference; credențialele Google/Apple au fost reunite în data/provider-credentials, ignorat și protejat. [Reguli și restaurare](LOCAL_WORKSPACE.md).
