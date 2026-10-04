# ProfOS

ProfOS este un proiect în faza de definire pentru o aplicație AI care răspunde folosind documentele utilizatorului.

## Scop

Construim un AI wrapper: o aplicație proprie care gestionează conversația și apelurile către un model AI. Componenta RAG caută informații relevante în documente și le oferă modelului pentru răspunsuri cu surse verificabile.

Pilot educațional pentru profesori și elevi; pornim de la matematica de clasa a V-a și documentele proprii ale profesorului.

## Prima versiune funcțională

Un utilizator încarcă documente text sau PDF cu text, pune o întrebare și primește un răspuns cu trimiteri la document și pagină/secțiune. Dacă documentele nu oferă informația necesară, aplicația poate căuta surse web și le afișează separat. Extracția de text și OCR pentru paginile scanate sunt disponibile; formulele și figurile necesită verificare separată.

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

Versiune: **0.8.1**. Documentele profesorului și manualele au prioritate; internetul completează informațiile lipsă. Documente încărcate, indexate și șterse direct în chat. [Contractul API și limitele](docs/CHAT_API.md).

Organizație GitHub: [ProfOS-Edu](https://github.com/ProfOS-Edu). Repository privat: [ProfOS](https://github.com/ProfOS-Edu/ProfOS).

Site privat: [ProfOS](https://profos-chat.cosminsoames.chatgpt.site).

## Pornirea site-ului local

Necesită Node.js 22.13 sau mai nou. Din directorul web:

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 3000
```

Configurarea locală folosește web/.dev.vars cu OPENAI_API_KEY și OPENAI_MODEL. Fișierul este exclus din GitHub. Deschide URL-ul afișat de server. Conversațiile sunt salvate în D1 pentru identitatea autentificată Sites.

## Biblioteca RAG

Colecția activă include cele 9 manuale de matematică de clasa a V-a din catalogul ministerului: 7 în română, unul în maghiară și unul în germană. [Inventar și verificări](docs/RAG.md). Textele și starea importului sunt excluse din GitHub; sunt indexate în colecția OpenAI, cu cheia folosită exclusiv pe server.

## Documentele profesorului și completarea web

Butonul „Adaugă document” acceptă PDF, DOC, DOCX, PPTX, TXT, MD și HTML (maximum 10 MB/fișier, 10 documente pe conversație, 50 pe cont). Documentele sunt păstrate pe server până la ștergere, izolate după utilizator și conversație. „Conversație nouă” creează un chat separat; mesajele și documentele rămân accesibile în istoricul vechi. [Flux, acces și limite](docs/HYBRID_CHAT.md).

## Biblioteca de surse

Deschide „Bibliotecă de surse” pentru a vedea, căuta, filtra, selecta și deschide manualele și documentele disponibile pentru AI. Include catalogul comun și sursele web citate; starea diferențiază materialele indexate de cele doar inventariate. [Detalii](docs/LIBRARY.md).

## Proiecte și conversații

Proiectele și conversațiile sunt în bara din stânga. Creează un proiect cu butonul de lângă „Proiecte”, caută conversații și redeschide-le din listă. Meniul „···” al fiecărei conversații permite mutarea sau ștergerea ei. Proiectele pot fi șterse din propriul meniu. Pe telefon, deschide bara din butonul de meniu. Mesajele, citările și selecția surselor se salvează în contul Sites, pe server, și sunt disponibile pe alte dispozitive autentificate. [Comportament și limite](docs/HISTORY.md).

Documentele create de AI se deschid în editor, cu salvare în conversație și export PDF/DOCX. Vezi [editorul de documente](docs/DOCUMENT_EDITOR.md).
