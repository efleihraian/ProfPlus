# Copia locală și curățarea ProfPlus

La cererea titularului, 9 octombrie 2026, se păstrează un singur checkout operațional: directorul `profos` al proiectului ProfPlus din Codex. Aplicația locală și importul olimpiadelor pornesc din această copie. Modificările locale existente au fost păstrate; nu s-a executat reset, pull sau clean peste ele.

## Ce rămâne local

- Codul aplicației, documentația, catalogul de metadate și istoricul Git. Branch-urile și PR-urile rămân pe GitHub; un checkout eliminat poate fi refăcut din commitul publicat.
- Runtime-urile necesare: dependențele Node/Python, modelele OCR, configurația protejată și cache-ul de lucru al importului activ. Checkpointurile și evidențele importului sunt verificate în Supabase.
- Configurația serverului în `web/.dev.vars`; credențialele originale Google/Apple în `data/provider-credentials/`, ignorat de Git, cu director 0700 și fișiere 0600. Nu se includ în documente, Git, browser ori biblioteca profesorilor.
- Datele de lucru încă necesare proceselor. Originalele se șterg numai după transfer, download, SHA-256/dimensiune și evidență cloud confirmate.

## Ce este păstrat în cloud

Biblioteca și inventarele: Supabase Storage privat; metadatele, istoricul și documentele generate: PostgreSQL; checkpointurile: `profplus-import-state`. Indexul de căutare OpenAI existent rămâne funcțional. Vezi [CLOUD_STORAGE.md](CLOUD_STORAGE.md).

Cele două logo-uri originale au fost arhivate împreună, fără modificarea imaginilor, în `profplus-library`, family `references`, uid `profplus-brand-originals`, kind `reference`. Arhiva ZIP și conținutul ei au fost verificate înaintea eliminării imaginilor locale. Restaurare într-un fișier nou:

```bash
python scripts/restore_cloud_material.py \
  --operational-root /cale/catre/profos \
  --family references --uid profplus-brand-originals --kind reference \
  --output /cale/noua/profplus-brand-originals.zip
```

Resturile de fișiere ale importului nereușit au fost păstrate separat ca `references/import-recovery-<hash>/original`, marcate `recovery-unverified`; nu sunt declarate surse didactice verificate.

## Verificarea înaintea eliminării copiilor

Copiile de publicare/GitHub au fost verificate fără modificări necomise și cu commit exact disponibil pe branch-ul remote. Copia sursei Sites corespunde versiunii salvate 17 și arhivei sursă persistate. Copia importului a fost oprită între loturi: fișierele/starea SQLite au fost copiate și verificate, căile documentelor mutate în checkout-ul principal, integritatea și numărul rândurilor confirmate, apoi checkpointul verificat în Supabase și procesul reluat din directorul principal.

Au fost eliminate copiile suplimentare, dependențele temporare și artefactele de build/publicare/test regenerabile. Fișierele sincronizate `sources/` ale proiectului ChatGPT sunt read-only și nu au fost modificate. Raportul operațional local este `data/cleanup/local-consolidation.json`, fără conținutul documentelor ori secrete. Implementarea cloud și această documentație sunt integrate în main prin PR #9; regula normală de review pentru sarcini viitoare rămâne. Site-ul privat existent păstrează funcțiile și audiența publicate.

Capturile de verificare și rapoartele istorice de test/migrare sunt păstrate într-o arhivă privată verificată în profplus-import-state; manifest checkpoint local-operational-evidence/text. Copiile locale de dovezi și vechiul publish intern (Sites versiunea 14, sursă/arhivă confirmate) au fost eliminate. Restaurarea dovezilor folosește scriptul cloud cu family checkpoints, uid local-operational-evidence, kind text și un output ZIP nou.

## P-062

Cache-ul originalelor peste 50 MB poate fi eliminat după verificarea referinței, conform cererii explicite a titularului. Celelalte originale se elimină numai după transferul verificat. Detalii și rapoarte: [IMPORT_CONTINUATION.md](IMPORT_CONTINUATION.md).

## P-063 — renunțare la materialele cu erori, 2026-10-10

Titularul a autorizat omiterea materialelor cu erori: referință verificată în Supabase înainte de eliminarea cache-ului local, fără redescărcare automată. Cele 10 PDF-uri rămase după erori (394.205.365 bytes) au fost eliminate. Importul valid al concursurilor continuă; companionul păstrează și linkurile pentru erorile lui. [Flux, dovezi și limite](FAILED_MATERIALS.md).
