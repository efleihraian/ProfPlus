# Recuperarea PDF-urilor originale ale manualelor

PDF-ul original, textul extras și indexarea pentru AI sunt trei stări separate. Un manual poate fi disponibil pentru AI, iar originalul să fie încă la sursa oficială. Rapoartele importului nu trebuie folosite ca dovadă că toate PDF-urile sunt în Storage.

La cererea titularului din 9 octombrie 2026, recuperăm toate originalele oficiale care se încadrează în limita Supabase de 50 MB. Organizația este Pro; spend cap rămâne activ. Nu sunt cumpărate add-onuri. Pro include 100 GB Storage și 8 GB disk per proiect; biblioteca are un prag operațional de 75 GB, cu spațiu rămas pentru documentele profesorilor. Conturile/conversațiile/metadatele merg în PostgreSQL, nu în fișiere PDF. Limita existentă pentru uploadul profesorului este 10 MB pe document.

## Transfer reluabil

Din copia operațională, cu configurația server protejată existentă:

```bash
.venv/bin/python scripts/recover_manual_originals.py \
  --operational-root /cale/absoluta/profos --file-limit-mb 50
```

Transferul are cel mult șase lucrători (implicit șase, `--workers 1..6`); indexarea/OCR păstrează limitele separate. SIGTERM/SIGINT opresc coada și lasă transferurile deja începute să se încheie. Reluarea nu redescarcă un document deja identificat ca prea mare dacă URL-ul nu s-a schimbat, iar un PDF local păstrat este verificat din nou față de limita aleasă.

Scriptul procesează catalogul complet, circular pe disciplină și clasă înaintea editurilor suplimentare din aceeași grupă. Descarcă numai de la manuale.edu.ro, verifică redirectul și semnătura PDF, respinge dimensiunea prea mare înainte de download când Content-Length este disponibil și limitează și fluxurile fără lungime. Transferul privat folosește upload reluabil; recitește toate bytes din Storage, verifică SHA-256/dimensiune, manifest și înregistrarea PostgreSQL înaintea ștergerii locale. Originalele rămase după eșec de upload sunt păstrate pentru reluare. Erorile temporare de rețea/5xx au retry limitat; 413 nu se retrimite repetitiv.

O singură recuperare de originale poate rula simultan. Pentru continuare după pasul deja activ:

```bash
.venv/bin/python scripts/run_manual_recovery.py --operational-root /cale/absoluta/profos
```

Acesta așteaptă lock-ul pasului activ și execută încă un pas finit, cu versiunea curentă a regulilor de retry. Nu este automatizare periodică. Procesele folosesc copia operațională; checkout-urile temporare de review/publicare pot fi eliminate după push fără oprirea importului.

## Rapoarte și documente rămase

În `data/rag/original-recovery/`, ignorat de Git:

- `progress.txt`: JSON cu starea transferului, dimensiuni și rezultat pe UID; nu conține secrete sau textul manualelor.
- `remaining.csv`: lista originalelor neîncărcate, cu disciplină/clasă, sursă, dimensiune sau motiv; generată la terminarea pasului curent al scriptului nou. Dacă pasul este oprit, include și `not_attempted`.
- `controller.json`: PID/starea continuării, fără credentiale.
- `run.log` și `controller.log`: rezultate și coduri de eroare, fără text/credențiale.

Raportul progresului este și un checkpoint privat Supabase, family `checkpoints`, UID `manual-original-recovery`, kind `text`, după terminarea pasului. Lista prea mare/404/NOT_PDF/timeout trebuie evaluată separat; o recuperare care a terminat parcurgerea poate avea materiale rămase. Nu înseamnă că toate originale au fost transferate.

## Indexul AI

Cele 1.303 manuale confirmate la începutul P-060 sunt în indexul AI existent. Recuperarea PDF nu le dublează în index. Retry pentru celelalte, respectând limita originalului:

```bash
.venv/bin/python scripts/import_manuals.py --workers 3 --max-pdf-mb 50 --export-report
```

OCR explicit, după terminarea oricărui import activ:

```bash
.venv/bin/python scripts/import_manuals.py --ocr --only-ocr \
  --workers 2 --max-pdf-mb 50 --export-report
```

Pragul rămâne 90% pagini lizibile. Volumele cu pagini predominant ilustrate, fragmente/preview-uri, URL-uri moarte sau prea mari nu sunt declarate ready. Catalogul și raportul pe disciplină/clasă permit alegerea alternativelor deja indexate; nu se elimină automat cele neîncărcate înaintea evaluării titularului.

## Protecții și limite

Storage rămâne privat, cu acces prin aplicație. RLS/ownership rămân active. SSL obligatoriu și deny-all pentru conexiuni directe PostgreSQL/pooler sunt aplicate; REST/Storage/Auth și SQL administrativ funcționează. Pentru un viitor client DB direct trebuie o permisiune de rețea explicită și SSL, nu allow-all.

Backupurile zilnice PostgreSQL Pro au retenție 7 zile și **nu includ fișierele Storage**. Backup și restaurare pentru documentele private trebuie pregătite separat înainte de producție. PITR, CAPTCHA, integrarea MFA în aplicație, malware/quarantină și auditul complet nu sunt considerate rezolvate de trecerea la Pro.

Google are deja App name ProfPlus; aplicația OAuth este Testing, fără branding verificat. Titularul nu are încă domeniu. Afișarea adresei proiectului în Google rămâne de remediat după domeniu, pagini publice și verificare; site-ul privat nu este făcut public pentru acest scop.

Surse oficiale: [limite fișier](https://supabase.com/docs/guides/storage/uploads/file-limits), [capacități Pro](https://supabase.com/docs/guides/platform/billing-on-supabase), [sesiuni](https://supabase.com/docs/guides/auth/sessions), [backupuri](https://supabase.com/docs/guides/platform/backups), [Google branding](https://supabase.com/docs/guides/auth/social-login/auth-google).
