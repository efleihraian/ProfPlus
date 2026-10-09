# ProfPlus

Reguli comune pentru toți oamenii și agenții: [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md). Verifică remote-ul înainte de sarcină, lucrează izolat și livrează prin PR.

ProfPlus este un asistent educațional AI pentru profesori, cu conversații, manuale și documente proprii. Website-ul funcționează în pilot privat; aplicațiile Android și iOS sunt planificate.

## Colaborare — cod consolidat în main

Întregul cod operațional este în `main`: aplicația web, biblioteca/RAG, importerele, stocarea Supabase, schemele, testele, cataloagele și documentația. Pornește din [ghidul pentru colaboratori](docs/DEVELOPMENT_SETUP.md) și atribuie lucrul prin [regulile echipei](docs/TEAM_WORKFLOW.md). Cheile și accesul la serviciile externe se acordă separat. Recuperarea originalelor manualelor de maximum 50 MB continuă; publicarea codului nu reprezintă finalizarea transferului.

[Importul curent și politica de omitere fișierelor peste 50 MB](docs/IMPORT_CONTINUATION.md) documentează reluarea, rapoartele, curățarea și limitele. Fișierele mari rămân accesibile prin sursa oficială.

[Materialele omise după erori](docs/FAILED_MATERIALS.md): păstrăm linkul în Supabase și eliminăm cache-ul, conform deciziei titularului.

## Scop

Construim un AI wrapper: o aplicație proprie care gestionează conversația și apelurile către un model AI. Componenta RAG caută informații relevante în documente și le oferă modelului pentru răspunsuri cu surse verificabile.

Pilot educațional pentru profesori și elevi; pornim de la matematica de clasa a V-a și documentele proprii ale profesorului.

## Prima versiune funcțională

Un utilizator încarcă documente text sau PDF cu text, pune o întrebare și primește un răspuns cu trimiteri la document și pagină/secțiune. Dacă documentele nu oferă informația necesară, aplicația poate căuta surse web și le afișează separat. Extracția de text și OCR pentru paginile scanate sunt disponibile; formulele și figurile necesită verificare separată.

## Documentație

- [Starea actuală](STATUS.md) — unde am ajuns; se actualizează la fiecare versiune.
- [Recuperarea originalelor manualelor](docs/MANUAL_RECOVERY.md) — transferul limitat la 50 MB, starea originalelor versus index și protecțiile Pro.
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

Versiune locală: **0.9.5**. Documentele profesorului și manualele au prioritate; internetul completează informațiile lipsă. Documente încărcate, indexate și șterse direct în chat. [Contractul API și limitele](docs/CHAT_API.md).

Organizație GitHub: [ProfPlus (identificator ProfOS-Edu)](https://github.com/ProfOS-Edu). Repository privat: [ProfPlus](https://github.com/ProfOS-Edu/ProfPlus).

Site privat: [ProfPlus](https://profos-chat.cosminsoames.chatgpt.site).

## Pornirea site-ului local

Pentru o clonă nouă și împărțirea lucrului: [ghidul colaboratorilor](docs/DEVELOPMENT_SETUP.md).

Necesită Node.js 22.13 sau mai nou. Din directorul web:

```bash
npm run install:ci
cp .dev.vars.example .dev.vars
npm run dev -- --host 127.0.0.1 --port 3000
```

Configurarea locală folosește web/.dev.vars cu OPENAI_API_KEY și OPENAI_MODEL. Fișierul este exclus din GitHub. Deschide URL-ul afișat de server. Stocarea poate folosi D1/R2 local sau adaptoarele Supabase configurate pe server. Copia operațională și site-ul privat folosesc Supabase pentru date, iar site-ul păstrează identitatea Sites.

## Biblioteca RAG

Importul extins este în curs: matematică, fizică, informatică/TIC și apoi celelalte materii, din cele 1.349 de volume inventariate. Pilotul inițial de nouă manuale este păstrat. [Flux și limite](docs/MANUAL_IMPORT.md), [raport datat pe manual](catalog/manual-import-status.json). PDF-urile, textele și starea internă rămân excluse din GitHub; cheia OpenAI este folosită numai pe server.

## Documentele profesorului și completarea web

Butonul „Adaugă document” acceptă PDF, DOC, DOCX, PPTX, TXT, MD și HTML (maximum 10 MB/fișier, 10 documente pe conversație, 50 pe cont). Documentele sunt păstrate pe server până la ștergere, izolate după utilizator și conversație. „Conversație nouă” creează un chat separat; mesajele și documentele rămân accesibile în istoricul vechi. [Flux, acces și limite](docs/HYBRID_CHAT.md).

## Biblioteca de surse

Deschide „Bibliotecă de surse” pentru a vedea, căuta, filtra, selecta și deschide manualele și documentele disponibile pentru AI. Selecția automată include toate materialele potrivite indexate, inclusiv culegeri/olimpiade/concursuri, pe măsură ce sunt încărcate și încadrate. Include catalogul comun și sursele web citate; starea diferențiază materialele indexate de cele doar inventariate. [Detalii](docs/LIBRARY.md).

## Proiecte și conversații

Proiectele și conversațiile sunt în bara din stânga. Creează un proiect cu butonul de lângă „Proiecte”, caută conversații și redeschide-le din listă. Meniul „···” al fiecărei conversații permite mutarea sau ștergerea ei. Proiectele pot fi șterse din propriul meniu. Pe telefon, deschide bara din butonul de meniu. Mesajele, citările și selecția surselor se salvează în contul Sites, pe server, și sunt disponibile pe alte dispozitive autentificate. [Comportament și limite](docs/HISTORY.md).

Documentele create de AI se deschid în editor, cu salvare în conversație și export PDF/DOCX. Vezi [editorul de documente](docs/DOCUMENT_EDITOR.md).

[Cerințe permanente pentru web, Android și iOS](docs/PRODUCT_REQUIREMENTS.md): confidențialitate, transparență, accesibilitate, licențe și controlul datelor.

## Conturi și setări

Secțiunea **Cont și setări** reunește profilul, profilul didactic, securitatea, tema, preferințele locale, delogarea și ștergerea contului. Local, Google și Apple sunt active; la prima conectare profesorul alege rolul, disciplina și ciclurile. Biblioteca preselectează materialele potrivite indexate. E-mail și Resend rămân amânate. Site-ul publicat continuă să folosească ChatGPT. [Profil didactic și ștergere](docs/ACCOUNT_LIFECYCLE.md). [Pașii de activare Supabase + Resend](docs/ACCOUNT_SETUP.md).

Protecția datelor: [DPIA preliminară și condiții de lansare](docs/DPIA.md). Conformitatea completă se validează pe baza proceselor și dovezilor reale, nu a existenței documentului.

[Rebranding și compatibilitate](docs/BRANDING.md) · [Verificarea configurației externe](docs/AUTH_CONFIGURATION_REVIEW.md).

[Securitate: reguli permanente](docs/SECURITY_REQUIREMENTS.md) · [Stare verificată și lipsuri](docs/SECURITY_REVIEW.md). Obligatorii pentru orice contributor și pentru web, Android și iOS.

## Stocare cloud a bibliotecii

Supabase Storage/PostgreSQL este activ pentru materialele bibliotecii, originale private, metadate, documente generate și istoric. Materialele locale disponibile au fost transferate și verificate. Copiile locale sunt eliminate numai după transfer și verificare completă; configurațiile și fișierele necesare proceselor sunt păstrate. [Structură, activare, reluare și limite](docs/CLOUD_STORAGE.md). Migrarea a fost verificată separat pe site și local; indexul de căutare existent rămâne la OpenAI.

## Copia operațională și curățarea locală

Aplicația și importul rulează dintr-un singur checkout. Originalele verificate ale bibliotecii sunt în Supabase; recuperarea celorlalte manuale continuă. Configurația, runtime-urile și starea importului activ rămân local. [Structură, restaurare și reguli de curățare](docs/LOCAL_WORKSPACE.md).
