# Lucrări rămase

Stări: TODO, IN PROGRESS, BLOCKED, DONE. ID-urile rămân stabile.

| ID | Prioritate | Stare | Sarcină | Criteriu de finalizare |
|---|---|---|---|---|
| P-001 | P0 | TODO | Definirea MVP | Utilizator, caz de utilizare și limite confirmate în docs/MVP.md |
| P-002 | P0 | IN PROGRESS | Set de evaluare | 10–20 întrebări reale, surse și răspunsuri așteptate, inclusiv întrebări fără răspuns |
| P-003 | P0 | IN PROGRESS | Alegerea tehnologiilor | Decizie cu costuri, găzduire, model, embeddings și stocare |
| P-004 | P0 | DONE | Schelet aplicație | Interfață și backend pornesc local; configurare documentată |
| P-005 | P0 | DONE | AI wrapper pentru primul chat privat | Apel server-side, chei protejate, timeout și erori tratate |
| P-006 | P0 | IN PROGRESS | Ingestie documente; pilot clasa V matematică 9/9 indexat, restul oprit | Text extras, împărțit în fragmente, indexat cu document și pagină/secțiune |
| P-007 | P0 | IN PROGRESS | Căutare RAG | Fragmente relevante returnate pentru setul de evaluare |
| P-008 | P0 | IN PROGRESS | Răspuns cu surse | Răspuns legat de fragmente și comportament verificat când lipsesc dovezi |
| P-009 | P0 | TODO | Protecția datelor | Acces limitat la documentele utilizatorului; ștergere document și index verificată |
| P-010 | P1 | TODO | Evaluare și costuri | Rezultate măsurate pe întrebările P-002, latență și cost per întrebare |
| P-011 | P1 | IN PROGRESS | Pilot | Flux complet verificat de utilizator; problemele trecute în backlog |
| P-012 | P0 | TODO | Acces public controlat | Autentificare utilizatori și limite de consum înainte de acces public |
| P-013 | P2 | TODO | Aplicații iOS și Android | Cerințe și autentificare mobilă definite, apoi aplicațiile implementate |
| P-014 | P0 | TODO | Recuperarea pasajelor despre triunghiuri | Cazul nereușit din docs/RAG_EVALUATION.md trece cu surse corecte |
| P-015 | P1 | TODO | Formule, figuri și calitate pedagogică | Eșantion verificat față de PDF; impreciziile răspunsurilor documentate și corectate |
| P-016 | P0 | DONE | Chat cu documente prioritare și completare web; încărcări proprii | Încărcare, indexare, izolare, ștergere și trei categorii de surse verificate |
| P-017 | P0 | TODO | Evaluarea completării web și anonimizării | Întrebări reale, surse primare, conflicte și interogări fără detalii private verificate |

| P-018 | P0 | DONE | Bibliotecă de surse pentru profesor | Catalog comun, documente, surse citate; căutare, filtre, selecție reală pentru RAG și deschidere originale |

## Finalizat

| ID | Data | Rezultat |
|---|---|---|
| D-001 | 2026-10-01 | Documentația inițială și regulile de lucru |

## P-019 — Proiecte și istoric — DONE

Criteriu: creare proiecte/conversații, istoric persistent privat pe utilizator, filtrare/căutare după titlu, redeschidere și continuare, păstrarea citărilor/documentelor și mutare între proiecte. Implementat în 0.6.0.

## P-020 — Layout simplificat — DONE

Proiectele și istoricul sunt exclusiv în stânga, grupate și accesibile direct. Eliminate scurtăturile duplicate din antet/composer; pe mobil, meniu lateral. Chat și casetă de mesaj aerisite. Versiune 0.6.1.

## P-021 — Organizație GitHub și colaboratori — IN PROGRESS

Organizația gratuită ProfOS-Edu creată; repository privat transferat și origin actualizat. Invitațiile și accesul colegilor așteaptă identificatorii lor GitHub. Integrarea Claude a colegilor nu este încă verificată.

## P-022 — Mutare lizibilă și ștergere — DONE

Titlurile nu se deplasează la deschiderea opțiunilor. Mutare disponibilă pentru orice conversație; ștergere chat/proiect cu confirmare, verificarea proprietarului și păstrarea documentelor. Ștergerea proiectului păstrează conversațiile fără proiect. 0.7.0.

## P-023 — Editor pentru documente generate — DONE

Documentele efectiv create de AI deschid automat dialogul; editare directă, titlu, formatare, salvare în conversație și redeschidere, export PDF și DOCX. Versiune 0.8.0. Limite și verificări în docs/DOCUMENT_EDITOR.md.

## P-024 — Centrare editor document — DONE

Dialog centrat în viewport, margini egale pe desktop, foaie centrată și spațiere adaptivă; mobil pe tot ecranul. 0.8.1.

## P-025 — Paletă albastru / emerald — DONE

Schema utilizatorului aplicată global, inclusiv bibliotecă, editor, dialoguri și favicon. Acțiuni albastre, progres verde, fundal și text conform paletei. 0.8.2.
