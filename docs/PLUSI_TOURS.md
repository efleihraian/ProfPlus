# Tururi ghidate cu Plusi — P-083

Responsabil: Marcos Soames (cerere explicită din 2026-10-15). Branch `feature/P-083-plusi-tours`, din `main` c6188aa.

## Comportament

- La prima intrare pe fiecare pagină (Acasă, Asistent virtual, Documente personale, Clasele mele, pagina unei clase, Cont) pornește un tur scurt. Fiecare pas evidențiază un element: restul paginii se întunecă, elementul rămâne luminat, cu un inel verde pulsatoriu, iar zona luminată alunecă de la un pas la altul.
- Plusi apare în bula turului, sare sau salută la fiecare pas și explică la persoana I. Bula are titlu, text, contor („Pasul 2 din 5”), puncte de progres și butoanele „Sari peste tur”, „Înapoi”, „Mai departe” / „Am înțeles!”.
- Pașii al căror element nu e vizibil (de ex. meniul lateral pe telefon, o clasă inexistentă) sunt săriți automat. Pe ecrane sub 640 px bula se fixează jos.
- Accesibilitate: dialog modal cu titlu și descriere, focus pe „Mai departe”, focus păstrat în bulă (Tab), Esc închide, săgețile stânga/dreapta navighează; focusul revine la elementul anterior. Cu „mișcare redusă” nu există animații, doar schimbarea pașilor.
- Turul se reține ca văzut numai în browser (`pp-tour-<pagină>`). Se reia din meniul lui Plusi plutitor („Arată-mi turul paginii”) sau din Cont → Aspect și preferințe → „Reia turul”; „Resetează preferințele locale” resetează și tururile.

## Implementare

`web/app/plusi-tour.tsx` (componenta), `web/app/tours.ts` (pașii, cu selectori stabili și atribute `data-tour`), stiluri în `globals.css` (bula e randată în `body`, funcționează și în paginile de cont). Nu se trimit date la server.

## Verificări (2026-10-15)

- `tests/plusi-tour.mjs` (nou, în CI): tur pentru fiecare pagină, texte scurte, ținte existente în cod, dialog accesibil.
- Harness cu componentele reale (Chromium): 1280 px luminos și 390 px întunecat — pașii Acasă, Esc, reluare din meniul lui Plusi, nereafișare după reîncărcare, turul Documente.
- localhost:3000 (aplicația reală): turul Acasă cu toți cei șase pași, marcat ca văzut la final.
- Build, TypeScript și suitele din CI trecute; ESLint fără erori noi.

## Limite

- „Văzut” este per browser, nu per cont: pe alt dispozitiv turul apare din nou.

## P-085 — Dimensiune stabilă, 2026-10-15

Caseta păstrează 380 × 300 px pe desktop, iar pe telefon lățimea urmează ecranul cu margini de 16 px. Înălțimea este limitată la spațiul vizibil, fără legătură cu lungimea mesajului. Textul lung se derulează în interior; Tab permite focusarea textului, apoi derularea cu tastatura. La schimbarea pasului, textul revine la început, butoanele rămân separate de zona derulabilă și containerul nu se remontează pentru animație. Probe: build/TypeScript, suitele web CI și audit strict trecute; CUA indisponibil, fără probă vizuală finală.
