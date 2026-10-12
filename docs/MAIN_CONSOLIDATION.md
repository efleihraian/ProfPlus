# P-073 — Consolidarea pe main, 2026-10-12

Responsabil Marcos Soames, issue #18, cerere explicită a titularului: toate lucrările existente pe main, fără PR.

## Inventar și integrare

Verificate opt worktree-uri GitHub și copiile de sursă Sites P-065/P-072. Worktree-urile de dezvoltare P-065/P-067/P-068/P-069/P-070/P-072 sunt curate; P-071 are numai un symlink către buildul de verificare, nu cod nou. În checkout-ul operațional, 86 de fișiere marcate modified/untracked au fost comparate cu main și istoricul accesibil: 72 au un blob deja salvat în Git, iar 14 sunt fotografii generate/documentație operațională cu note istorice P-062/P-063 și fără implementare nouă. 51 din cele 86 sunt chiar identice cu main. Diferențele runtime rămase sunt versiuni vechi supersedate de P-065/P-067/P-068/P-069/P-070/P-071/P-072; copierea lor peste main ar elimina remedieri existente.

Două commituri rămase în afara istoricului main au fost integrate prin merge explicit:

- 8977bda — proveniența exercițiilor și simplificarea exportului. Cerința permanentă de publicare, sourceOnlyProvenance, metadatele de citare și testele există deja pe main; P-067 a adăugat copia pentru elevi, P-069 LaTeX, P-072 manuale/șabloane. Cele 11 conflicte au fost verificate pe fișier și au păstrat implementările/documentația noi; nu s-a folosit un merge de tip ours/theirs.
- 2fdfbc2 — izolarea fixture-urilor concursurilor de Storage real. setUp/cloud_active și nota de audit sunt deja prezente, iar verificările P-071/P-072 sunt păstrate. Cele cinci conflicte de documentație au păstrat auditul complet P-060–P-072.

Ambele merge-uri păstrează arborele runtime, testele și schemele exacte ale main-ului verificat 1c50602; adaugă istoricul lipsă. Sursa Sites P-072 nu are diferențe runtime față de web: doar teste vechi de cont/guest/bibliotecă/Storage și tsbuildinfo generat, care nu înlocuiesc testele mai noi din GitHub. Nu se include buildinfo în GitHub. Notele operaționale vechi repetitive nu sunt recopiate ca stare actuală; starea finală este rezumată fără conținut privat în catalog/library-checkpoint-summary.json.

## Ce nu intră în GitHub

Cheile și configurația protejată, originalele profesorilor, datele/checkpointurile private SQLite, jurnalele brute ale furnizorilor, indexurile/materialele Supabase, dependențele, buildurile și one-off-urile de administrare din data/ rămân în afara Git. Scripturile de produs pentru import/migrare/recuperare/ștergere și schemele Supabase sunt deja versionate. Nu se execută/importă automat scripturile operaționale de ștergere, nu se resetează/pull/clean checkout-ul operațional și nu se modifică sursele sincronizate read-only.

## Verificări

61 teste Python offline trecute. Suitele RAG comun, modele, proveniență/șablon, guest, priorități/export, proveniență simplificată și adaptor Supabase rerulate. Arborele web/scripts/tests/supabase este identic cu 1c50602: buildul P-072 deja verificat este reutilizat pentru scanare, fără alt build/deploy declarat. Scanner Git/istoric/client fără detecții. Audit npm: 8 high preexistente toolchain, zero în producție; controalele CI nu sunt dezactivate. Importul rămâne paused; materialele locale eliminate nu sunt redescărcate. Site-ul privat P-072 rămâne publicarea runtime curentă, source 5b810f02e912546f9fde9f3706b83fe8591f4326, deployment succeeded appgdep_6acd4691628c8191a78d4f2953ac559a.
