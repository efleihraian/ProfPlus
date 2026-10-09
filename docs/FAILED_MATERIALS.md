# Materialele omise după erori — P-063, 2026-10-10

Titularul a decis să renunțe la materialele care au dat erori de import și să păstreze doar linkurile sursă pentru acestea, eliminând copiile locale. Aceasta este distinctă de omiterea originalelor peste 50 MB. Nu se mai încearcă recuperarea automată a materialelor omise.

## Ordinea verificată

1. Se identifică UID-ul, URL-ul oficial și eroarea din catalog/ledger/raportul de recuperare. Nu se caută sau șterge în `sources/` sincronizat.
2. Se salvează referința în Storage privat și `library_materials`, kind `reference`, `sourceOnly=true`, `omissionReason=IMPORT_FAILED`, cu eroarea originală. Se recitesc bytes/SHA, manifestul și înregistrarea PostgreSQL. Referința nu este un PDF și nu acordă disponibilitate AI.
3. Numai apoi se șterg fișierele acelui UID din directoarele de cache permise. Se verifică amprenta și faptul că fișierul nu s-a schimbat. Symlinkurile, căile din afara copiei operaționale, UID-urile necunoscute și fișierele parțiale active sunt protejate.
4. Materialul este marcat `omitted` în importul AI de manuale, `omitted_failed` în recuperarea originalelor sau `skipped` în ledgerul concursurilor. Rândurile indexate cu succes și datele conturilor rămân intacte. Un eșec la recuperarea unui original deja indexat nu șterge indexul/textul existent.

Comenzile de reluare respectă omiterea: reconcile/importul manualelor nu reactivează un rând omis, recuperarea originalelor nu redescarcă UID-ul, iar recuperarea concursurilor citește și referințele `sourceOnly` din Supabase. Omiterea manualelor este citită și din catalogul Supabase, astfel încât se respectă și pe o clonă nouă, fără jurnalul local. Nu este necesară reindexarea bibliotecii.

## Rulare și rapoarte

```bash
.venv/bin/python scripts/omit_failed_materials.py --operational-root /cale/absoluta/profos
```

Cu `--follow-active-import`, companionul urmărește finit controllerul existent al concursurilor și tratează și erorile apărute până la terminarea lui. Nu creează automatizare periodică. Referințele se verifică cu maximum patru lucrători; jurnalul, modificările SQLite și ștergerile sunt serializate. Lockurile protejează importul manualelor și recuperările de originale; importul activ al concursurilor continuă. Nu se șterg fișierele acestuia aflate în procesare.

Jurnalul necesar, fără conținutul documentelor sau credențiale, este `data/cleanup/failed-materials.txt`. Conține referințele verificate și amprentele/dimensiunile fișierelor șterse. Checkpoint privat Supabase: family `checkpoints`, UID `omitted-failed-materials`. La încheiere se publică și checkpointurile SQLite. Un eșec la salvarea referinței păstrează materialul local și oprește operația; nu se declară că linkul sau ștergerea au fost confirmate.

Listele de participanți/rezultate excluse prin filtrele de confidențialitate nu sunt reintroduse ca surse. Fișierele Word `~$` și sidecar-urile macOS `._` sunt metadate inutile, nu documente educaționale de importat. Doar surse HTTPS fără credențiale sunt acceptate; salvarea unui link nu garantează că site-ul sursă funcționează.

## Dovezi

Cele 10 PDF-uri de manuale rămase după erori, însumând 394.205.365 bytes, au fost eliminate după verificarea referințelor în Supabase. Cache-ul permanent de PDF-uri manuale și folderul de recuperare nu mai conțin PDF-uri. Referințele celorlalte erori și ale URL-urilor de arhive sunt sincronizate în continuare; importul valid al concursurilor este încă activ.

57 de teste Python offline au trecut, inclusiv eșec cloud înainte de ștergere, protecția symlinkurilor/fișierelor active, păstrarea indexului reușit și lipsa redescarcării după omitere. Build web trecut și scanner Git/client fără detecții. Nu s-a modificat codul aplicației web, identitatea, audiența, politicile RLS sau furnizorii. Datele/referințele sunt în proiectul Supabase folosit deja de site și de copia locală. Auditul dependențelor are în continuare cele 8 high cunoscute în toolchain; controlul rămâne activ.
