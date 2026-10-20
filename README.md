# ProfPlus

ProfPlus este un asistent educațional pentru profesorii din România. Îi ajută să pregătească lecții, teste, fișe de lucru și planificări, pornind de la manualele oficiale și de la propriile documente. Fiecare răspuns indică sursele folosite.

Aplicația există ca platformă web și ca aplicație Android (folderul [`android/`](android/)).

## Ce face aplicația

- **Asistent virtual:** o mascotă care răspunde la întrebări și ajută la pregătirea materialelor, cu trimiteri la manual și pagină.
- **Materiale didactice:** teste, bareme, fișe, planificări și proiecte de lecție, exportabile în PDF și Word.
- **Bibliotecă de manuale:** peste 1.300 de manuale, culegeri și subiecte de concurs, cu căutare și filtre.
- **Documente:** profesorul își încarcă propriile documente (PDF, Word, PowerPoint, text), le editează în aplicație și le exportă în PDF sau Word. Documentele folosite des devin surse pentru asistent, iar fiecare utilizator le vede doar pe ale lui.
- **Documente legale:** politica de confidențialitate, termenii și condițiile și politica de cookie-uri, obligatorii prin lege (vezi secțiunea de mai jos).
- **Clasele mele:** spațiu de lucru pentru fiecare clasă, cu documentele și observațiile ei.
- **Știri din educație:** noutăți recomandate după disciplina profesorului.
- **Meditații:** anunțuri de meditații, cu filtre după materie, nivel și localitate.
- **Cont și securitate:** datele fiecărui utilizator sunt separate, iar contul se poate șterge oricând.

## Senzorii din aplicația Android

| Senzor | La ce folosește |
|---|---|
| **Camera** | Fotografiază o pagină de manual sau un test, pentru a o păstra sau a o trimite mai departe. |
| **Ecranul tactil** | Atingerea focalizează camera, iar ciupirea cu două degete face zoom pe pagina fotografiată. |
| **Microfonul** | Profesorul dictează întrebarea sau cerința, iar textul apare pe ecran și poate fi copiat în conversația cu asistentul. |
| **Senzor de lumină** | Măsoară lumina din sală (în prezent doar o afișează; trecerea automată între tema luminoasă și cea întunecată este planificată). |

Fiecare senzor este folosit doar pentru funcția lui, iar camera cere permisiunea la prima folosire. Alți senzori (de exemplu localizarea aproximativă pentru meditații) sunt planificați.

## Documente obligatorii prin lege

Aplicația prelucrează date personale (cont, documente încărcate, conversații), deci legislația (GDPR și legislația română privind protecția datelor) cere ca utilizatorul să fie informat și să își poată exercita drepturile. Documentele și mecanismele obligatorii sunt:

- **Politica de confidențialitate:** ce date sunt colectate, de ce, cât timp se păstrează, către cine sunt trimise și cum își exercită utilizatorul drepturile.
- **Termeni și condiții:** regulile de utilizare, limitele răspunsurilor generate de asistent și responsabilitățile.
- **Politica privind cookie-urile și bannerul de consimțământ:** utilizatorul alege ce tehnologii acceptă, iar alegerea poate fi schimbată oricând.
- **Consimțământ explicit** pentru fiecare scop distinct (de exemplu publicarea unui anunț de meditații) și pentru permisiunile telefonului (camera, microfonul).
- **Ștergerea datelor:** utilizatorul își poate șterge contul și toate datele asociate.
- **Evaluarea de impact asupra protecției datelor (DPIA)** și protecție specială pentru datele elevilor, înainte de orice funcție care le prelucrează.

Starea actuală: ștergerea contului și consimțământul pentru anunțurile de meditații sunt implementate. Textele finale ale politicii de confidențialitate, ale termenilor și ale politicii de cookie-uri, precum și DPIA, sunt în pregătire și trebuie aprobate de operator înainte de lansarea publică. Cerințele detaliate sunt în [docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) și [docs/DPIA.md](docs/DPIA.md).

## Rularea aplicației Android

Deschide folderul `android/` în Android Studio și rulează pe un emulator sau pe un telefon cu Android 8.0 sau mai nou.
