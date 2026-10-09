# Pornirea ProfPlus pentru colaboratori

`main` este baza comună a proiectului. Conține aplicația web, exportul PDF/Word și proveniența exercițiilor, adaptoarele cloud, schemele/migrațiile Supabase, importerele manualelor și concursurilor, testele, catalogul public și documentația. Android și iOS sunt planificate; nu există încă aplicații mobile de descărcat.

## Instalare dintr-o clonă curată

Necesită Git, Node.js 22.13 sau mai nou și npm. Pentru import/testele Python este necesar și Python 3.11 sau mai nou.

```bash
git clone https://github.com/ProfOS-Edu/ProfPlus.git
cd ProfPlus
git switch main
git pull --ff-only
cd web
npm run install:ci
cp .dev.vars.example .dev.vars
npm run dev -- --host 127.0.0.1 --port 3000
```

Deschide `http://localhost:3000`. Într-o clonă fără configurare externă poți lucra la cod, interfață, documentație și teste simulate. Conversațiile AI, verificarea indexului și loginurile reale necesită configurarea serviciilor. Păstrează aceeași adresă în APP_ORIGIN și în URL-ul deschis; callbackul OAuth trebuie autorizat pentru mediul de dezvoltare.

`.dev.vars` este numai pe server și este ignorat de Git. Exemplul versionat are valorile cheilor goale. Pentru scripturile Python, exemplul separat este `.env.example` din rădăcină; nu copia niciun secret într-un fișier versionat.

## Manualele deja indexate și accesul cloud

PDF-urile sunt în Supabase Storage privat, iar indexul comun existent este la OpenAI. Clonarea repository-ului nu acordă acces la acestea și nu descarcă datele conturilor/conversațiilor. Accesul se acordă separat de administrator, printr-un canal protejat, de preferat într-un mediu de test.

Pentru biblioteca comună, serverul folosește OPENAI_API_KEY și OPENAI_VECTOR_STORE_ID autorizate pentru indexul existent. Pentru Auth/Storage/PostgreSQL, configurează valorile Supabase autorizate în `.dev.vars`; DATA_BACKEND=supabase și PROFPLUS_CLOUD_LIBRARY=true activează adaptoarele existente. Cheia secretă Supabase conferă acces privilegiat serverului; nu este cheia de distribuit în Git sau în browser. Nu copia configurația de producție fiecărui colaborator ca parte a instalării.

Nu reindexa biblioteca pentru fiecare clonă. Importul operațional are un singur responsabil/coadă/checkpoint. Nu rula importerele, migrarea istoricului sau migrațiile Supabase pe proiectul comun fără atribuirea explicită a sarcinii. Cele două migrații SQL din Supabase sunt deja aplicate pe proiectul ProfPlus existent; prezența lor în Git nu cere reaplicare. Consultă [stocarea cloud](CLOUD_STORAGE.md), [recuperarea manualelor](MANUAL_RECOVERY.md) și [importul concursurilor](COMPETITION_IMPORT.md).

## Verificări locale

După instalarea dependențelor, din `web/`:

```bash
npx tsc --noEmit
npm run build
npm run test:account
node tests/guest-chat.mjs
npm run test:manual-library
node tests/library-availability.mjs
node tests/common-resources.mjs
node tests/common-rag.mjs
node tests/supabase-storage.mjs
node tests/exercise-provenance.mjs
node tests/export-provenance.mjs
npm audit --audit-level=high
```

Testele de cont folosesc provideri simulați; nu șterg conturi reale. Din rădăcina repository-ului, pentru testele offline Python:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/requirements-rag.txt
.venv/bin/python -m unittest tests.test_manual_recovery tests.test_cloud_library tests.test_manual_import tests.test_competition_import
.venv/bin/python scripts/security_scan.py --history --client
```

Auditul complet are alerte cunoscute în uneltele de dezvoltare, urmărite în P-046 și [raportul de securitate](SECURITY_REVIEW.md). Nu confunda trecerea testelor cu un CI integral verde și nu dezactiva controlul.

## Împărțirea lucrului

Fiecare colaborator pornește din `main`, folosește propria clonă/worktree și o ramură pentru sarcina atribuită. Alege un ID/responsabil și criterii de acceptare în BACKLOG sau în template-ul GitHub de sarcină. Componente: conturi, conversații/RAG, bibliotecă/import, editor/export, mobil. Contractele API, schema bazei și fișierele comune se coordonează înainte de editare.

Livrarea obișnuită rămâne prin PR și review independent, conform [regulilor comune](TEAM_WORKFLOW.md). Publicarea consolidată P-061 în main este cerută explicit de titular și nu elimină regula pentru sarcinile viitoare. `main` pe GitHub și aplicația publicată sunt livrări distincte. Importul lung în curs nu este declarat complet de publicarea codului.
