# Verificare 0.4.0 — 2026-10-03

Testele au folosit API-ul local al build-ului de producție, baza D1 și bucket-ul R2 locale, plus apeluri reale OpenAI. Identități de test separate au fost trimise direct serverului local. În producție identitatea este furnizată de Sites; nu s-a pretins testare în browser ori testarea manuală a mai multor conturi publicate.

| Verificare | Rezultat |
|---|---|
| Manuale: criteriul cu 3 | Citări din manuale, fără căutare web |
| Internet: exoplanete și James Webb | Căutare reală, trei surse NASA, mode=web |
| Fișă TXT: durata și materialele activității | 18 minute și materialele din fișă, sursă document, fără web |
| Document + completare NASA | Durata din fișă și definiție de pe web; două surse distincte, mode=mixed |
| Parolă necunoscută | Fără căutare web și fără surse fabricate |
| Încărcare TXT, PDF, DOCX sintetice | 202, apoi ready pentru toate |
| Descărcarea propriului document | 200 |
| Alt utilizator: descărcare / ștergere | 404 pentru ambele |
| Lipsă identitate | Listare 401 |
| Executabil / PDF fals / fișier gol | 415 / 415 / 413 |
| Origine străină | 403 |
| Ștergere trei documente | 200, lista goală, originale inaccesibile (404) |

Indexurile și fișierele OpenAI ale documentelor de test au fost șterse prin fluxul aplicației. Testele nu au folosit documente reale ale unui profesor.

TypeScript și build-ul de producție au trecut; schema generată are tabelul documents și indexul user_id/chat_id, fără modificări de date în migrare. Arhiva și fișierele pregătite pentru Git au fost verificate pentru a exclude cheia API. Verificarea vizuală în browser rămâne indisponibilă din cauza restricției întâlnite anterior.

Limite: aceste probe confirmă fluxul și izolarea prin interogările aplicației. Nu constituie o evaluare completă a corectitudinii pedagogice, a anonimizării interogărilor web, a scanărilor, a formulelor ori a tuturor formatelor acceptate. DOC, PPTX și HTML necesită probe suplimentare. Cazul istoric despre triunghiuri nu a fost rerulat în această etapă.
