# ProfPlus

**ProfPlus** este un asistent educațional bazat pe AI, creat pentru profesorii din România. Ajută la pregătirea lecțiilor, testelor, fișelor și planificărilor pornind de la manualele oficiale, culegeri, subiecte de olimpiadă și concurs, dar și de la documentele proprii ale profesorului. Fiecare răspuns indică sursele folosite.

Aplicația web funcționează acum în pilot privat. Aplicația **Android** (Kotlin, Jetpack Compose) este în dezvoltare, în folderul [`android/`](android/); aplicația iOS este planificată.

> Versiunea curentă: **0.9.5**. Istoricul complet este în [CHANGELOG.md](CHANGELOG.md), iar starea la zi în [STATUS.md](STATUS.md).

---

## Ce face aplicația acum

### Asistentul virtual „Plusi”
- Conversații cu un asistent AI care răspunde pe baza surselor didactice, nu doar din cunoștințele generale ale modelului.
- **RAG (Retrieval-Augmented Generation):** caută fragmentele relevante din manuale și documente și le transmite modelului. Răspunsul conține trimiteri la document și pagină sau secțiune.
- Ordinea de prioritate a surselor este: documentele profesorului, apoi manualele și biblioteca comună. Căutarea pe internet completează doar informațiile lipsă, iar sursele web sunt afișate separat.
- **Alegerea modelului AI:** GPT-4.1 mini (implicit, mai rapid) sau GPT-6.1 Sol (raționament mai profund). Modelul folosit este afișat lângă fiecare răspuns.
- Proiecte și istoric de conversații sincronizate pe server: căutare, mutare între proiecte, ștergere.
- **Tururi ghidate cu Plusi:** la prima vizită pe fiecare pagină, mascota explică elementele interfeței. Tururile pot fi sărite, parcurse din tastatură sau reluate oricând.
- Vizitatorii pot trimite mesaje fără cont, folosind biblioteca comună și cu limite de utilizare.

### Generarea materialelor didactice
- Teste, bareme, fișe de lucru, planificări calendaristice, proiectări de unități de învățare și proiecte de lecție.
- **Controlul exercițiilor:** profesorul alege numărul de exerciții pe categorii (preluate, adaptate, originale), numărul de subpuncte și cerințe libere.
- **Proveniența fiecărui exercițiu:** se indică dacă exercițiul este preluat integral, adaptat după o sursă sau original. Pentru fiecare sursă se trec titlul, editura, clasa, anul și pagina, numai atunci când sunt cunoscute.
- **Copie pentru elevi:** un singur click ascunde sursele și citările.
- **Modele de documente:** profesorul poate încărca propriile modele (test, barem, planificare etc.), care au prioritate față de modelele comune anonimizate.
- Generarea respectă structura planificărilor, de exemplu regula „2 ore algebră + 2 ore geometrie” la matematică.

### Editorul de documente
- Documentele generate se deschid într-un editor cu formatare și se salvează în conversație.
- Export **PDF** și **Word (DOCX)**, cu paginare compactă și formule matematice (KaTeX/MathJax).
- **Editor LaTeX** cu previzualizare și export `.tex`, compatibil cu Overleaf.

### Biblioteca de surse
- Catalog cu **1.349 de manuale** inventariate (matematică, fizică, informatică/TIC și restul materiilor), plus culegeri, subiecte de olimpiadă și de concurs.
- Căutare, filtre după materie, clasă, ciclu și tip, selecție în bloc și deschiderea documentelor originale.
- Selecție automată a materialelor potrivite profilului didactic. Profesorul poate marca până la 10 surse prioritare.
- Extragere de text și **OCR** pentru paginile scanate.
- **Biblioteca personală:** documentele încărcate des de profesor devin surse automate în toate conversațiile.
- Încărcare de PDF, DOC, DOCX, PPTX, TXT, MD și HTML (maximum 10 MB pe fișier).

### Clasele mele
- Spații de lucru pentru fiecare clasă, cu secțiunile Planificări, Proiecte, Teste și Fișe.
- Observații generale despre clasă, pe care Plusi le ia în calcul la generare.
- Documentele unei clase sunt folosite automat ca surse în conversațiile acelei clase.

### Știri din educație
- Știri preluate automat din fluxuri RSS publice: Ministerul Educației, Edupedu, Digi24 Educație și Educație Privată.
- Pagina Acasă afișează o știre principală și trei secundare, recomandate după profilul didactic (disciplină, ciclu, olimpiade), cu motivul recomandării afișat.
- Recunoaștere precisă a disciplinelor; de exemplu, „Fizică” nu este confundată cu „Educație fizică”.

### Meditații
- Anunțuri publice de meditații, cu filtre după disciplină, nivel (primar, gimnaziu, liceu, Evaluarea Națională, Bacalaureat), mod de desfășurare (online, la elev, la profesor), localitate și preț.
- Datele de contact sunt vizibile numai utilizatorilor autentificați.
- Moderare: un anunț raportat de 3 ori este ascuns automat și ajunge în coada de moderare a administratorului.

### Cont, administrare și securitate
- Autentificare cu **Google** și **Apple**, profil didactic (rol, disciplină, cicluri), mod luminos/întunecat/sistem.
- Ștergerea contului elimină datele proprii: conversațiile, documentele, originalele și indexurile AI.
- Panou de administrare cu statistici agregate, editor de știri (ciornă, publicare, arhivare) și moderarea meditațiilor.
- Securitate: RLS în PostgreSQL, izolarea datelor pe utilizator, chei API păstrate numai pe server, headere HTTP stricte, scanare de secrete și audit de dependențe în CI. Detalii în [SECURITY_REQUIREMENTS.md](docs/SECURITY_REQUIREMENTS.md) și [SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md).

---

## Senzori

Versiunea web nu are acces la senzorii dispozitivului: camera, microfonul și geolocația sunt blocate explicit prin `Permissions-Policy`. Aplicația web folosește doar preferințele de sistem, cum ar fi tema luminoasă/întunecată și mișcarea redusă.

Aplicația **Android** folosește deja camera, biometria și senzorul de lumină (vezi [android/README.md](android/README.md)); ceilalți senzori și iOS sunt planificate. Aplicațiile vor folosi următorii senzori. Fiecare va fi activat numai cu permisiunea explicită a utilizatorului și numai pentru funcția care are nevoie de el, conform cerințelor GDPR din [PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md):

| Senzor | Utilizare în ProfPlus |
|---|---|
| **Camera** | Fotografierea paginilor de manual, a testelor scrise de mână sau a fișelor tipărite. Imaginile trec prin OCR și ajung în biblioteca personală sau într-o conversație. |
| **Microfonul** | Dictarea întrebărilor și a cerințelor către Plusi (speech-to-text), utilă când profesorul nu are tastatura la îndemână. |
| **Senzorul biometric** (amprentă / Face ID) | Deblocarea rapidă și sigură a aplicației, ca protecție suplimentară pentru datele elevilor și documentele private. |
| **Senzorul de lumină ambientală** | Comutarea automată între modul luminos și cel întunecat, în funcție de iluminarea din sală. |
| **Accelerometrul și giroscopul** | Orientarea automată a documentelor în editor și în previzualizare. Gestul „scutură pentru a raporta o problemă” trimite un raport de eroare. |
| **GPS / localizare aproximativă** (opțional) | Sugerarea localității la publicarea și căutarea anunțurilor de meditații față în față. Locația exactă nu se salvează. |

---

## Ce urmează

- **Aplicația Android** (schelet funcțional în `android/`: WebView, cameră, biometrie) extinsă cu ecrane native, și **aplicația iOS**, cu sincronizare completă a contului, a bibliotecii și a claselor, plus funcțiile bazate pe senzorii de mai sus.
- **Finalizarea importului bibliotecii:** toate manualele și originalele, OCR complet și calitate mai bună pentru formule și figuri.
- **Calitate pedagogică:** evaluarea răspunsurilor pe un set de întrebări reale, cu măsurarea costului și a latenței.
- **Roluri profesor, elev, părinte și școală**, cu izolare pe organizații (RLS), înainte de orice funcție pentru elevi.
- **Catalog și observații per elev**, numai după finalizarea DPIA.
- **Autentificare prin e-mail** (Supabase + Resend) și găzduire pe domeniu propriu.
- **Antiabuz și limite de cost:** rate limiting, sesiuni, MFA pentru administratori.
- **Uploaduri sigure:** scanare malware, pseudonimizare înainte de indexare, CSP strict.
- **Export complet al datelor**, audit log și politici de retenție.
- **Abonamente și plăți**, cu politici clare de rambursare și anulare pentru web, App Store și Google Play.
- Politică de confidențialitate, termeni, cookie-uri și audit de accesibilitate (contrast, tastatură, VoiceOver/TalkBack).
- Surse noi de știri (de exemplu ISJ-uri) și recomandări pe clasa exactă.

Planul pe etape este în [ROADMAP.md](ROADMAP.md), iar sarcinile detaliate în [BACKLOG.md](BACKLOG.md).

---

## Tehnologii

| Zonă | Tehnologie |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Găzduire / runtime | Cloudflare Workers (Vite + vinext, Wrangler) |
| Date și fișiere | Supabase (PostgreSQL cu RLS, Storage), Drizzle ORM |
| AI | OpenAI Responses API (GPT-4.1 mini, GPT-6.1 Sol), indexare vectorială pentru RAG |
| Documente | pdf-lib, docx, KaTeX, MathJax |
| Import și scripturi | Python (import manuale/concursuri, OCR, sincronizare cloud) |
| Mobil (Android) | Kotlin, Jetpack Compose, CameraX, BiometricPrompt, WebView |
| CI | GitHub Actions: build, TypeScript, teste, audit npm, scanare de secrete |

---

## Aplicația Android

Proiectul Android Studio este în [`android/`](android/). Deschide folderul în Android Studio și rulează pe un emulator sau telefon cu Android 8.0+. Detalii, arhitectură și limitări în [android/README.md](android/README.md).

---

## Pornirea locală

Necesită **Node.js 22.13** sau mai nou.

```bash
cd web
npm run install:ci
cp .dev.vars.example .dev.vars   # completează OPENAI_API_KEY și OPENAI_MODEL
npm run dev -- --host 127.0.0.1 --port 3000
```

`web/.dev.vars` este exclus din Git. Ghidul complet pentru colaboratori este în [DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md), iar regulile echipei în [TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md).

---

## Documentație

- [MVP](docs/MVP.md) · [Arhitectura](docs/ARCHITECTURE.md) · [Decizii](docs/DECISIONS.md)
- [RAG](docs/RAG.md) · [Chat hibrid](docs/HYBRID_CHAT.md) · [API chat](docs/CHAT_API.md)
- [Biblioteca](docs/LIBRARY.md) · [Biblioteca personală](docs/PERSONAL_LIBRARY.md) · [Import manuale](docs/MANUAL_IMPORT.md)
- [Editorul de documente](docs/DOCUMENT_EDITOR.md) · [Modele de documente](docs/DOCUMENT_MODELS.md) · [Generarea testelor](docs/TEST_GENERATION.md)
- [Clase](docs/CLASSES.md) · [Știri](docs/NEWS_FEED.md) · [Meditații](docs/TUTORING.md) · [Tururi Plusi](docs/PLUSI_TOURS.md)
- [Conturi](docs/ACCOUNT_LIFECYCLE.md) · [Stocare cloud](docs/CLOUD_STORAGE.md) · [DPIA](docs/DPIA.md)
- [Cerințe de produs](docs/PRODUCT_REQUIREMENTS.md) · [Cerințe de securitate](docs/SECURITY_REQUIREMENTS.md)
- [Jurnal de lucru](docs/WORKLOG.md) · [Reguli de contribuție](CONTRIBUTING.md)
