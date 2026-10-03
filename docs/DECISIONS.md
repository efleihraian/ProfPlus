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
