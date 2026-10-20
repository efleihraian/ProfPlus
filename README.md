# ProfPlus

ProfPlus este un asistent educațional pentru profesorii din România. Îi ajută să pregătească lecții, teste, fișe de lucru și planificări, pornind de la manualele oficiale și de la propriile documente. Fiecare răspuns indică sursele folosite.

Aplicația există ca platformă web și ca aplicație Android (folderul [`android/`](android/)).

## Ce face aplicația

- **Asistent virtual:** o mascotă care răspunde la întrebări și ajută la pregătirea materialelor, cu trimiteri la manual și pagină.
- **Materiale didactice:** teste, bareme, fișe, planificări și proiecte de lecție, exportabile în PDF și Word.
- **Bibliotecă de manuale:** peste 1.300 de manuale, culegeri și subiecte de concurs, cu căutare și filtre.
- **Clasele mele:** spațiu de lucru pentru fiecare clasă, cu documentele și observațiile ei.
- **Știri din educație:** noutăți recomandate după disciplina profesorului.
- **Meditații:** anunțuri de meditații, cu filtre după materie, nivel și localitate.
- **Cont și securitate:** datele fiecărui utilizator sunt separate, iar contul se poate șterge oricând.

## Senzorii din aplicația Android

| Senzor | La ce folosește |
|---|---|
| **Camera** | Fotografiază o pagină de manual sau un test, pentru a o păstra sau a o trimite mai departe. |
| **Senzor biometric** (amprentă / față) | Blochează aplicația, ca documentele profesorului să rămână private. |
| **Senzor de lumină** | Măsoară lumina din sală (în prezent doar o afișează; trecerea automată între tema luminoasă și cea întunecată este planificată). |

Fiecare senzor este folosit doar pentru funcția lui, iar camera cere permisiunea la prima folosire. Alți senzori (microfon pentru dictare, localizare aproximativă pentru meditații) sunt planificați.

## Rularea aplicației Android

Deschide folderul `android/` în Android Studio și rulează pe un emulator sau pe un telefon cu Android 8.0 sau mai nou.
