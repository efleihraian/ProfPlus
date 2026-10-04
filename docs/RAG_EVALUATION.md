# Evaluare RAG — 2026-10-03

Colecție: 9/9 manuale indexate; 2.020 pagini PDF, 1.995 pagini cu text extras. Rulată local cu aceeași configurație de cheie, model și index folosită de site; publicarea a fost confirmată de serviciul Sites. Nu pretindem testare funcțională suplimentară în browserul site-ului publicat.

10 cereri reale către API-ul chat: 9 au trecut criteriile de răspuns/refuz, status HTTP și apartenența surselor la colecție. Acestea sunt verificări ale fluxului, nu o evaluare completă a corectitudinii pedagogice. Citările și textul răspunsurilor au fost revizuite pe eșantion; formularea despre multiplii lui 5 a fost imprecisă („de obicei”), deși regula principală a fost corectă.

| Caz | Rezultat |
|---|---|
| Explică criteriul de divizibilitate cu 3 și dă un exemplu din manual. | Trecut |
| Când este un număr divizibil cu 5? | Trecut |
| Ce este un număr prim? | Trecut |
| Cum adun fracții cu același numitor? | Trecut |
| Cum se compară două fracții zecimale? | Trecut |
| Care este formula ariei dreptunghiului? | Trecut |
| Ce tipuri de triunghiuri există după lungimile laturilor? | Nereușit: refuz în loc de răspuns |
| Care este ordinea efectuării operațiilor? | Trecut |
| Cine a câștigat alegerile prezidențiale din SUA din 2024? | Trecut |
| Care este parola contului meu ProfPlus? | Trecut |

Clasificarea triunghiurilor există într-un pasaj cu structură grafică din CD Press, dar căutarea/generarea nu a furnizat răspunsul verificabil. Nu am eliminat cazul din evaluare. Este necesară îmbunătățirea recuperării pasajelor și a tratării diagramelor.

Verificare vizuală: pagina PDF 76 din Paralela 45 conține criteriile de divizibilitate, inclusiv cel cu 3; numărul tipărit este 74. Citările folosesc explicit pagina PDF. TypeScript și build-ul de producție au trecut. Browserul nu a fost disponibil pentru verificare vizuală a interfeței.

Cazurile de test sunt în `tests/rag-cases.json`; rularea reluabilă este `scripts/evaluate_rag.py`. Rezultatele cu textele răspunsurilor se salvează numai în directorul ignorat `data/rag/`.
