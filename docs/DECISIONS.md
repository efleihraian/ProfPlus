# Registrul deciziilor

## DEC-001 — Începem cu un flux RAG restrâns

Data: 2026-10-01
Stare: propusă

Propunere: primul MVP răspunde la întrebări din documente și afișează surse. Motiv: permite verificarea utilității și corectitudinii înainte de extindere.

De confirmat: utilizatorul țintă, corpusul și bugetul. Nicio tehnologie nu este aprobată prin această propunere.

## DEC-002 — Test local OpenAI API

Data: 2026-10-01. Stare: acceptată pentru testul de conexiune.

Utilizatorul a creat o cheie OpenAI. Pregătim un test Python fără dependențe externe, cu Responses API și modelul configurabil gpt-4.1-mini. Această alegere nu stabilește tehnologiile aplicației finale. Cheia este păstrată local și exclusă din GitHub.

## Șablon pentru decizii viitoare

## DEC-003 — Site-ul de chat înaintea RAG-ului

Data: 2026-10-01. Stare: acceptată.

Utilizatorul a cerut amânarea documentelor și începerea site-ului, cu o casetă de conversație AI. Implementăm React/TypeScript cu Vinext și un API JSON server-side, compatibil cu găzduirea Sites. Prima versiune este privată și folosește gpt-4.1-mini. Nu persistăm conversațiile și nu introducem încă documente sau RAG. Viitoarele aplicații mobile vor avea nevoie de autentificare proprie peste contractul API.

## Format pentru decizii noi

- ID și titlu:
- Data:
- Stare: propusă / acceptată / înlocuită
- Context:
- Opțiuni analizate:
- Decizie și motiv:
- Consecințe și compromisuri:
- Înlocuiește / este înlocuită de:

## DEC-004 — Pilot RAG: toate manualele de matematică, clasa a V-a

Data: 2026-10-03. Stare: acceptată.

Utilizatorul a ales toate manualele de matematică pentru clasa a V-a. Păstrăm catalogul general, oprim importul general și selectăm cele 9 volume corespunzătoare, inclusiv traducerile. Folosim temporar OpenAI Vector Stores pentru index și SQLite local pentru import reluabil. Căutarea serverului este filtrată explicit după ID-urile colecției. Acest flux nu antrenează modelul. Păstrăm paginile PDF ca metadate repetate în text; formulele și figurile rămân o limită a extracției.

Referință API pentru filtrare: https://developers.openai.com/api/reference/python/resources/vector_stores/methods/search.

## DEC-005 — Documente prioritare, completare web și documente proprii

Data: 2026-10-03. Stare: acceptată, înlocuiește restricția exclusivă a DEC-004.

Utilizatorul a cerut folosirea preponderentă a documentelor și căutare internet când informația lipsește, plus încărcări proprii ale profesorului în chat. Păstrăm căutarea prioritară în documente, evaluăm suficiența pasajelor, apoi căutăm web separat prin Responses. Generarea finală are surse distincte. D1 păstrează metadate cu identitatea Sites și conversația, R2 păstrează originale, fiecare document are index OpenAI propriu. Documentele rămân până la ștergere și sunt disponibile în conversația curentă după reîncărcare.

Interogarea web este generată separat și nu primește direct documentele ori istoricul; anonimizarea este cerută prin prompt și necesită evaluare suplimentară. Preferăm surse primare, fără listă exclusivă. Nu pretindem pagini pentru documentele indexate nativ.

Referințe: https://developers.openai.com/api/docs/guides/tools-web-search și https://developers.openai.com/api/docs/guides/tools-file-search.

## DEC-006 — Biblioteca include sursele comune și selecția reală

Data: 2026-10-03. Stare: acceptată.

Utilizatorul cere navigarea surselor încărcate și posibile, nu doar a documentelor proprii sau a unui contor. Afișăm catalogul comun și starea reală a indexării, documentele profesorului și sursele citate. Numai sursele indexate pot fi selectate pentru căutare; cele inventariate au linkuri la originale. Selecția este aplicată server-side după verificarea stării și accesului. Documentele private ale altor profesori nu devin comune automat. Sursele web citate se deschid și pot fi discutate fără a pretinde indexarea lor permanentă.

## DEC-007 — Istoricul se păstrează în cont

2026-10-03. Acceptată. D1 stochează proiecte și transcripturi pe identitatea Sites; browserul reține doar chatul curent. Reviziile împiedică suprascrierile concurente. Proiectele organizează conversații și documentele acestora; nu copiază indexurile. Documentele vechi sunt adoptate fără inventarea mesajelor lipsă.

## DEC-008 — Navigarea se concentrează în stânga

2026-10-03. Acceptată. Conform cererii utilizatorului, proiectele și istoricul devin liste direct în bara laterală. Eliminăm dialogul de istoric și accesările duplicate. Pe mobil aceeași navigare apare într-un panou lateral; mesajele și sursele păstrează comportamentul existent.

## DEC-009 — Repository într-o organizație

2026-10-03. Acceptată. Transferăm repository-ul privat în organizația gratuită ProfOS-Edu pentru colaborare. Numele ProfOS era ocupat; utilizatorul a aprobat ProfOS-Edu și termenii. Nu schimbăm vizibilitatea. Invitațiile se trimit după identificarea colegilor.

## DEC-010 — Ștergere cu limite explicite

2026-10-03. Acceptată. Dialog separat pentru mutare și confirmare înainte de ștergere. Ștergerea proiectului păstrează conversațiile; ștergerea chatului elimină transcriptul, dar păstrează documentele disponibile în bibliotecă. Un marcaj minim împiedică reapariția chatului din documentele vechi; reviziile și verificarea deleted împiedică salvările concurente.
