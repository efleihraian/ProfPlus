# P-072 — Teste și șabloane de planificare, 2026-10-12

Responsabil Marcos Soames, issue #17. Cererile titularului: manualele înaintea surselor complementare, structura implicită păstrată, planificările completate în șablonul furnizat.

## Comportament

Pentru teste și planificări/proiectări de unități, căutarea în biblioteca autorizată este separată: manualele reale din catalog, apoi documentele comune complementare. Până la șase pasaje de manual rămân înaintea suplimentelor în contextul limitat la opt pasaje; dacă lipsesc suplimentele, se folosesc și celelalte pasaje de manual. Selecția și prioritățile explicite rămân respectate, fără adăugarea unor manuale deselectate. Metadatele serverului disting manualul de olimpiadă/concurs; scorul de similitudine al unui concurs nu înlocuiește automat manualele. Lipsa manualelor relevante nu justifică citări fabricate.

Modelele personale prevalează pentru tipul documentului; în absența lor se folosesc structurile comune aprobate P-070. Modelul comun de matematică are efectiv 40 minute și 90+10 puncte, trei părți de 30 puncte (șase grile, problemă structurată, trei cerințe). Cererea explicită a profesorului poate modifica aceste valori. Generarea testului include o revizie AI separată: rezolvarea itemilor, verificarea tuturor opțiunilor, convenția pentru zero, afirmații valide, punctaje, formatare și eliminarea răspunsurilor din copia elevului. Revizia nu reprezintă garanție matematică sau înlocuire a controlului profesorului.

Planificările au șablon fix: antetul, coloanele și ordinea provin din model, conținuturile sunt completate din sursele pertinente. Modelele comune păstrează cele șase coloane și distribuția 2 ore algebră + 2 geometrie; calendarele și codurile necunoscute rămân necompletate. Controlul verifică antetele tabelare exacte, rândurile complete și câmpurile antetului comun. O neconcordanță primește o singură corectare; persistența erorii returnează 503 înaintea salvării. Modificările structurii cerute explicit sunt exceptate. Modelele personale cu antet tabelar Markdown pot fi verificate la fel; textul Word extras fără tabel recuperabil primește instrucțiuni de fidelitate, fără promisiune de verificare structurală exactă.

Bugetul răspunsului este 8.000 tokenuri pentru șabloane tabelare și 4.000 pentru celelalte cereri, în termenul existent de 90 secunde. Limita existentă a documentului editabil este 20.000 caractere. Nu se promite reproducerea paginării, fonturilor, celulelor unite sau siglelor Word în editorul Markdown/PDF simplificat.

## Verificări și limite

TypeScript și build local trecute. Testele RAG verifică rezervarea manualelor, priorități, selecție goală, manuale fără rezultate și manual-only; testele modelelor verifică prevalența personală, structura comună, coloane/antet/rânduri și schimbări explicite. Probele rutei verifică proveniența și corectarea unică/refuzul salvării unui tabel invalid. Suite guest, bibliotecă, DTO, cont, disponibilitate/cache și export trecute. Verificările folosesc identități și conținut fictive, fără ștergerea conturilor reale.

Proba inițială cu AI real a găsit itemi ambigui/greșiți și antet de planificare incomplet; acestea au motivat etapa separată de revizie și controlul antetului. Nu se declară validare pedagogică completă. Auditul npm păstrează cele opt alerte high preexistente din toolchain; zero în producție. Importul rămâne paused și materialele locale eliminate nu sunt redescărcate; căutările folosesc indexurile cloud existente. Furnizorii, RLS, audiența și drepturile asupra documentelor private sunt păstrate.

Revizia testelor folosește OPENAI_REVIEW_MODEL dacă este configurat, implicit gpt-4.1 (acces verificat prin Models API), în locul modelului mini de redactare. Același furnizor și store=false; apelul suplimentar crește costul/latenta față de o singură generare. Controlul profesorului rămâne necesar.

Probele finale cu AI real au returnat 200 pentru test și planificare; tabelul are șase coloane și antet complet, cu 2+2 ore pentru S1/S2. Proba testului confirmă structura comună și proveniențe, inclusiv o referință conceptuală reală la manual. Controlul uman a identificat în continuare necesitatea explicitării convenției pentru zero/incluziune și a punctajelor pe subpuncte; regulile reviziei au fost întărite. Nu este o garanție de corectitudine a tuturor viitoarelor itemi.


Livrare P-072 confirmată: publicare privată succeeded la 2026-10-12T20:44:26Z (23:44 București), deployment appgdep_6acd4691628c8191a78d4f2953ac559a, source Site 5b810f02e912546f9fde9f3706b83fe8591f4326, env revision 4; audiența owner-only păstrată. TypeScript/build și suitele relevante trecute; scanner Git/istoric/client 1.566 fișiere/bloburi și scanner sursă/istoric/client Sites 699, fără detecții. Auditul păstrează 8 high toolchain existente, zero producție. Probele finale AI au returnat documente pentru test și planificare; controlul uman a întărit regulile pentru zero, notația incluziunii și punctajele subpunctelor. Nu se declară validare pedagogică completă. Importul rămâne paused; nu s-au redescărcat materiale locale.
