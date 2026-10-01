# ProfOS

ProfOS este un proiect în faza de definire pentru o aplicație AI care răspunde folosind documentele utilizatorului.

## Scop

Construim un AI wrapper: o aplicație proprie care gestionează conversația și apelurile către un model AI. Componenta RAG caută informații relevante în documente și le oferă modelului pentru răspunsuri cu surse verificabile.

Publicul țintă și cazul concret de utilizare trebuie confirmate. Numele proiectului nu presupune automat o anumită profesie sau industrie.

## Prima versiune funcțională

Un utilizator încarcă documente text sau PDF cu text, pune o întrebare și primește un răspuns cu trimiteri la document și pagină/secțiune. Dacă documentele nu oferă informația necesară, aplicația explică acest lucru. Documentele scanate și OCR sunt amânate.

## Documentație

- [Starea actuală](STATUS.md) — unde am ajuns; se actualizează la fiecare versiune.
- [Istoricul versiunilor](CHANGELOG.md) — ce s-a schimbat.
- [Lucrări rămase](BACKLOG.md) — sarcini și criterii de finalizare.
- [Planul de dezvoltare](ROADMAP.md) — etapele proiectului.
- [MVP](docs/MVP.md) — primul pas și limitele primei versiuni.
- [Arhitectura](docs/ARCHITECTURE.md) — fluxul AI wrapper + RAG.
- [Decizii](docs/DECISIONS.md) — alegeri și motivele lor.
- [Jurnal de lucru](docs/WORKLOG.md) — ce s-a lucrat efectiv.
- [Reguli de contribuție](CONTRIBUTING.md) — cum menținem evidența.
- [Configurarea API](docs/API_SETUP.md) — introducerea locală a cheii și testul conexiunii.

## Stare

Versiune: **0.1.0**. Configurarea locală și testul API sunt pregătite. Aplicația și RAG-ul nu sunt încă implementate; apelul real așteaptă cheia salvată local.
