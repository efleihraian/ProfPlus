# ProfOS

ProfOS este un proiect în faza de definire pentru o aplicație AI care răspunde folosind documentele utilizatorului.

## Scop

Construim un AI wrapper: o aplicație proprie care gestionează conversația și apelurile către un model AI. Componenta RAG caută informații relevante în documente și le oferă modelului pentru răspunsuri cu surse verificabile.

Publicul țintă și cazul concret de utilizare trebuie confirmate. Numele proiectului nu presupune automat o anumită profesie sau industrie.

## Prima versiune funcțională

Un utilizator încarcă documente text sau PDF cu text, pune o întrebare și primește un răspuns cu trimiteri la document și pagină/secțiune. Dacă documentele nu oferă informația necesară, aplicația explică acest lucru. Extracția de text și OCR pentru paginile scanate sunt disponibile; formulele și figurile necesită verificare separată.

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

Versiune: **0.3.0**. Chat cu RAG pentru manualele de matematică de clasa a V-a; răspunsuri cu surse și pagini PDF. [Contractul API și limitele](docs/CHAT_API.md).

Site privat: [ProfOS](https://profos-chat.cosminsoames.chatgpt.site).

## Pornirea site-ului local

Necesită Node.js 22.13 sau mai nou. Din directorul web:

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 3000
```

Configurarea locală folosește web/.dev.vars cu OPENAI_API_KEY și OPENAI_MODEL. Fișierul este exclus din GitHub. Deschide URL-ul afișat de server. Conversațiile se șterg la reîncărcarea paginii.

## Biblioteca RAG

Colecția activă include cele 9 manuale de matematică de clasa a V-a din catalogul ministerului: 7 în română, unul în maghiară și unul în germană. [Inventar și verificări](docs/RAG.md). Textele și starea importului sunt excluse din GitHub; sunt indexate în colecția OpenAI, cu cheia folosită exclusiv pe server.
