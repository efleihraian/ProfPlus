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
