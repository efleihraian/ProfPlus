# Starea proiectului

Ultima actualizare: 2026-10-04
Versiune: 0.9.2
Etapă: cont și setări; integrare autentificare independentă pregătită

## Finalizat

- 0.9.2: rebranding ProfPlus implementat; repository privat și nume afișat organizație actualizate. Configurația Supabase/Apple inspectată; raport în docs/AUTH_CONFIGURATION_REVIEW.md. Activarea loginurilor externe rămâne P-033.

- 0.9.1: conectare Google/Apple în interfață; fluxurile de e-mail ascunse și blocate implicit pe server. Configurarea efectivă a providerilor și găzduirii independente rămâne în P-033. Resend amânat până la domeniu.

- Cont și setări: profil curent, conectare/securitate, temă, memorare și resetare preferințe locale. Integrare Supabase pregătită pentru Google/Apple/e-mail, verificare adresă și recuperare parolă; activarea externă rămâne în P-033. Pilotul păstrează identitatea ChatGPT.

- Mod întunecat/luminos activabil din antet; alegerea se păstrează local, implicit tema sistemului.

- Cerințele permanente pentru web/Android/iOS înregistrate și incluse în regulile de dezvoltare; implementarea integrală urmărită în P-027–P-030.

- Paletă unitară albastru / emerald, fundal #F8FAFC și text #0F172A în toate suprafețele aplicației.

- Editorul documentului centrat în pagină, cu margini egale și lățime limitată pe desktop.

- Documente generate de AI: deschidere automată în dialog, editare directă cu formatare, salvare și redeschidere din conversație, export PDF A4 și Word editabil.

- Mutare în proiect din dialog cu listă lizibilă; ștergere conversații și proiecte cu confirmare. Conversațiile se păstrează la ștergerea proiectului; documentele se păstrează în bibliotecă la ștergerea chatului.

- Navigare doar în stânga pentru proiecte și istoric; proiecte expandabile, căutare și meniu contextual de mutare. Pe mobil, panou lateral cu fundal și închidere prin Escape.

- Proiecte, istoric în cont, căutare după titlu, redeschidere și mutarea conversațiilor. Mesaje, citări și selecții salvate în D1.

- Repository privat în organizația GitHub ProfOS-Edu și evidența lucrărilor/versiunilor.
- Invitațiile colegilor așteaptă username-urile GitHub.
- Pilot: 9 manuale de matematică de clasa V, 2.020 pagini PDF, 1.995 pagini cu text extras.
- Căutare prioritară în documentele profesorului și manuale; completare prin căutare web când informațiile lipsesc.
- Surse distincte și citări accesibile: documente proprii, manuale, internet.
- Încărcare, indexare, listare, descărcare și ștergere documente direct în chat.
- Metadate D1, originale R2 și indexuri OpenAI separate pentru documente; verificarea utilizatorului și conversației pe server.
- Limită 10 MB/fișier, 10 documente/conversație și 50/cont.
- Versiune publicată privat, confirmată de Sites.

- Bibliotecă pentru catalogul comun, manualele indexate, documentele profesorului din toate conversațiile și sursele web citate.
- Căutare, filtre, selecție pentru RAG și linkuri la originale. Serverul verifică starea și accesul.

## Verificare

0.9.2: publicare privată ProfPlus confirmată de Sites. TypeScript și build trecute; browser local pentru branding, pagina contului și tema persistentă după reload. GitHub repository privat redenumit, Supabase recunoaște noul nume; App ID Apple redenumit vizual cu salvare confirmată. Browser live confirmă noul nume și accesul la istoricul/documentul existent. Configurația externă inspectată, fără test real Google/Apple. Raportul diferențiază configurarea existentă de pașii nefinalizați.

0.9.1: publicare privată confirmată de Sites. TypeScript/build și teste Auth simulate trecute în ambele moduri. Modul social refuză toate operațiile de e-mail și token hash fără apeluri către furnizor; PKCE Google/Apple verificat. UI verificat pentru lipsa formularelor de e-mail, inclusiv acces direct la vechea pagină register. Nu sunt configurate loginuri externe reale.

0.9.0: publicare privată confirmată de Sites. TypeScript și build trecute. API Sites: identitate, protecție acces, origine și izolare istoric verificate. Teste cu Auth simulat pentru verificarea e-mailului, cookie-uri HttpOnly/Lax, login/register/logout, profil/e-mail, recuperare parolă, OAuth PKCE, redirect sigur și sesiune falsificată. UI verificat desktop și 390px, temă persistentă/opțională. Loginurile reale Google/Apple și livrarea Resend nu sunt încă testate/configurate.

0.8.3: build, comutare luminos/întunecat, persistență după reload, Enter și verificare vizuală desktop trecute. Contrastul perechilor principale depășește 4,5:1. Publicare privată confirmată.

0.8.2: build și verificare vizuală desktop pentru paleta globală trecute; culorile calculate confirmă exact cele patru valori cerute. Publicare privată confirmată.

0.8.1: build trecut, centrarea editorului verificată vizual în browser local pe desktop; publicare privată confirmată.

0.8.0: TypeScript și build trecute; trei apeluri AI reale verifică document vs explicație, persistență/editare/izolare/validare. Exporturi verificate pentru diacritice, tabele, editări și PDF de 4 pagini, prima pagină inspectată vizual. Interfață locală: generare cu deschidere automată, deschidere, editare, salvare, previzualizare și meniu/export PDF verificate. Publicarea privată 0.8.0 confirmată de Sites.

0.7.0: TypeScript, lint fișiere modificate și build trecute; ștergere testată local cu izolare, păstrarea conversațiilor/documentelor și respingerea salvărilor vechi. Publicare privată confirmată.

Layout 0.7.0: TypeScript, lint fișiere modificate și build trecute; publicare privată confirmată. QA vizual în browser indisponibil.

Istoric: CRUD și mutare, recuperare transcript/citări/selecție, izolare conturi, conflict de revizie; răspuns OpenAI real salvat pe server și recuperat la redeschidere. TypeScript, lint fișiere modificate și build trecute; publicare 0.7.0 confirmată. Vezi docs/HISTORY.md.

TypeScript și build trecute. Teste reale: TXT/PDF/DOCX, răspuns din document, răspuns din manual, răspuns web și mixt, validări, izolare între identități locale, ștergerea completă a documentelor de test. Vezi docs/HYBRID_EVALUATION.md. QA în browser nu a fost disponibil. Biblioteca: catalog complet, selecție doar Intuitext, respingere neindexat, document din altă conversație cu citare, izolare între utilizatori și ștergere test — vezi docs/LIBRARY.md.

## Urmează și limite

- P-033 în lucru: Google activ în Supabase și callback Google corectat; Email dezactivat. Apple activ în Supabase cu cheia nouă salvată local și secret semnat. Aplicația locală localhost:3000 configurată; redirecturi oficiale Google/Apple verificate. Google și Apple confirmate pe același cont Supabase după loginurile titularului; sesiune validă după reload. Logout, refresh la expirare și izolare între conturi rămân de verificat; site-ul găzduit nu a fost modificat.

- Evaluare preliminară DPIA și inventar în docs/DPIA.md; P-034 urmărește finalizarea și aprobarea. Conformitatea GDPR integrală nu este încă demonstrată.

- P-033: domeniu/găzduire cu autentificare proprie, Supabase, Resend, Google Cloud și Apple Developer; verificări reale și migrare controlată a identității înainte de activare. Vezi docs/ACCOUNT_SETUP.md.

- Politici și informații reale despre operator; audit de consimțământ/date/terți, accesibilitate și flux complet de solicitare a ștergerii. Lista înregistrată nu certifică implementarea sau conformitatea juridică.

- Evaluare pedagogică și calitatea căutării, inclusiv cazul istoric despre triunghiuri.
- Verificarea anonimizării interogărilor web, formulelor și scanărilor; DOC/PPTX/HTML nu au încă probe reale.
- Consum controlat și aplicații mobile.
- Importul general al manualelor este oprit; colecția activă rămâne matematica de clasa V.

Documentele sunt păstrate până la ștergere; „Conversație nouă” creează un chat separat; mesajele și documentele vechi rămân accesibile în istoric. Fișierele și metadatele sunt stocate pe server, identificatorul conversației în browser. Site-ul rămâne privat: https://profos-chat.cosminsoames.chatgpt.site.

P-037 implementat local: asocierea Google/Apple afișată din identitățile Supabase verificate, cu mesaj explicit de conectare. Salvarea profilului real reușită; build/TypeScript/suite Auth trecute. Nicio publicare online în această sarcină.
