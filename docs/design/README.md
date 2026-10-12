# ProfPlus – design de referință

Folderul conține designul complet al platformei ProfPlus, realizat ca prototip interactiv. Este **referința vizuală și de comportament** pentru implementarea în aplicația din `web/` (Next.js). Nu e cod de producție.

## Fișiere

- `Main.dc.html` – tot designul: antet, cele 4 tab-uri, mascota Plusi, chatul, portofoliul, clasele, popup-urile, animațiile.
- `canvas.json` – metadatele planșei (dimensiune 1440 × 1500, pagină fluidă).

## Cum se citește `Main.dc.html`

Formatul e HTML + un mic motor de șabloane (nu rulează direct în browser):

- `<x-dc>…</x-dc>` – markup-ul paginii. Stilurile sunt inline; CSS-ul global (animații, hover) e în `<helmet><style>`.
- `{{ nume }}` – valoare din `renderVals()` (scriptul de la final).
- `<sc-if value="{{ cond }}">` – randare condiționată.
- `<sc-for list="{{ lista }}" as="x">` – listă repetată.
- `onClick="{{ fn }}"` – handler de eveniment.
- Scriptul `class Component extends DCLogic` – echivalentul unei componente React de tip clasă: `this.state`, `setState`, iar `renderVals()` întoarce datele pentru șablon.

Conversie directă: fiecare `sc-if` → `{cond && …}`, fiecare `sc-for` → `.map()`, stilurile inline → clase Tailwind / CSS din `globals.css`, `state` → `useState`.

## Identitate vizuală

- **Font:** Roboto (400, 500, 600, 700).
- **Paletă (regula 60-30-10):**
  - 60% fundal: crem `#FBF8F3`, suprafețe albe `#FFFFFF`, chenare `#ECE6DC`
  - 30% structură: verde `#2F7D5B` (hover `#24654A`), mentă `#E8F3EC` / `#D6EBDD` / `#BFDDCB`
  - 10% acțiuni principale: verde închis `#1B4D36`, text alb
  - Text: `#1F2A24`, secundar `#55605A`, discret `#6B746F`
  - Status: verde `#047857` / `#ECFDF5` (adăugat), roșu `#B91C1C` / `#FEF2F2` (lipsește)
- **Logo:** pătrat verde cu „P” alb și „+” mentă `#86D9AE`, apoi „Prof**Plus**” (Plus cu greutate 400).
- **Hover:** toate butoanele primesc contur verde moale + umbră + ridicare 1px; tab-urile primesc fundal mentă.

## Structura

**Antet fix (sticky)** – logo, tab-uri (Acasă, Asistent virtual, Documente personale, Clasele mele), buton „Intră în cont”.

**Acasă** (două variante, prop `homeVariant`: `chat` – implicit, `mascota`)
1. Caseta asistentului: foca Plusi animată + casetă de mesaj („Cu ce te pot ajuta?”). Trimiterea face tranziția animată spre Asistentul virtual și trimite mesajul.
   - Varianta `mascota`: foca mare + text despre Plusi și platformă + buton „Vorbește cu Plusi”.
2. Documente personale: explicație portofoliu (OMEC nr. 3.858/2026), buton „Mergi la Documente personale”, bară de progres (gri la 0).
3. Știri: o știre mare + 2 mici + „Citește toate știrile”.

**Asistent virtual** – reproduce pagina de chat existentă din `web/app/page.tsx` (bara laterală cu Bibliotecă, Conversație nouă, căutare, Proiecte, Conversații; bun venit; „Alege sursele”; compozitor cu „Adaugă document”). Răspunsurile apar ca venind de la Plusi (avatar focă, „Plusi · foca ProfPlus”), cu indicator „Plusi caută prin manuale…”.

**Documente personale** – portofoliul profesional din structura-cadru (Anexa 1, OMEC 3.858/2026): 39 de documente în 5 secțiuni (A–E), acordeon.
- Obligatorii: evidențiate, cu eticheta „Lipsește” / „Adăugat” deasupra numelui.
- „După caz” (5): estompate, cu „+ Adaugă la obligatorii”; odată adăugate intră în progres și au „−” pentru scoatere.
- Ordinea butoanelor: link extern (ex. „Editor Europass”) → „Generează cu Plusi” → „Încarcă” (mereu ultimul din dreapta).
- Progres total și pe secțiuni, doar pe documentele active. „Descarcă opisul”, „Exportă portofoliul”.

**Clasele mele**
- Gol la început; „Adaugă clasă” deschide popup cu clasa (P, I–XII) și litera (A–J), previzualizare și verificare de duplicate.
- Grilă de carduri ordonate; click → meniul clasei (Planificări, Proiecte de lecție, Teste și evaluări, Fișe de lucru, Personalizări).
- „Șterge clase” (roșu): mod de selecție cu bife, „Anulează” / „Șterge (n)”.

**Plusi plutitor** (pe Documente personale și Clasele mele) – balon „Ai nevoie de ajutor?” care se sparge după 3,5 s (reapare la fiecare intrare pe pagină, nu și după click). Click → meniu: „Deschide Asistentul virtual” sau „Întreabă-l aici” (mini-chat cu ajutor despre funcțiile ProfPlus).

**Mascota Plusi** – focă SVG (corp gri-albăstrui, toc de absolvent cu ciucure verde închis, ochi mari, mustăți). Animații CSS: plutire + salt, coadă, ambele înotătoare, clipit, mustăți, ciucure, bule. Rulează mereu (nu sunt oprite de `prefers-reduced-motion`).

## De legat la date reale

Tot ce e între paranteze drepte (`[Titlu știre]`, `[data]`, `[nr.] manuale indexate`, `[Titlu conversație]`) e placeholder. Răspunsurile focii și ale mini-chatului de ajutor sunt fixe în prototip; în aplicație trebuie legate la API-ul de chat existent. Încărcarea documentelor, exportul și clasele trebuie persistate pe server.

## Prompt sugerat pentru Claude Code

> Citește `docs/design/README.md` și `docs/design/Main.dc.html`. Implementează designul în aplicația din `web/`, păstrând logica existentă de chat, autentificare și bibliotecă din `web/app/page.tsx`. Lucrează pe pași și fă un plan înainte: 1) tokenii de culoare și fontul Roboto în `globals.css`; 2) antetul cu tab-uri; 3) componenta `Plusi` (SVG + animații); 4) Acasă; 5) adaptarea paginii de chat; 6) Documente personale; 7) Clasele mele; 8) Plusi plutitor și mini-chatul de ajutor. Verifică în browser după fiecare pas.
