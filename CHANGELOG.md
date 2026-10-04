# Istoricul versiunilor

## Ne lansat încă

- Configurare externă P-033: Google activ în Supabase, callback Google corectat, Email dezactivat; Apple App ID/Services ID active și cheie dedicată creată. Apple activat cu cheia nouă salvată de titular; aplicația locală configurată și redirecturi oficiale verificate. Loginurile complete și sesiunile rămân în curs.

## 0.9.2 — 2026-10-04

- Rebranding ProfPlus în chat, cont/setări, bibliotecă, titlul paginii, etichete accesibile, asistent AI, indexuri noi și documentație.
- Repository privat redenumit ProfPlus; nume afișat organizație și titlu Sites actualizate. Supabase recunoaște repository-ul redenumit.
- Compatibilitate păstrată pentru sesiunile, preferințele, datele și adresele existente.
- Verificare dashboard Supabase și Apple Developer; pașii nefinalizați și limitele documentate. Google/Apple nu sunt încă activate/testate live.

## 0.9.1 — 2026-10-04

- Prima etapă cu Google/Apple; formularele de e-mail și parolă ascunse și operațiile aferente blocate implicit pe server.
- Ghid Supabase/Google/Apple, callbackuri distincte și configurarea viitoare Resend. Providerii externi așteaptă configurare.
- VERSION sincronizat cu versiunea aplicației.

## 0.9.0 — 2026-10-04

- Cerință GDPR/DPIA permanentă, inventar de date, evaluare preliminară și condiții explicite înainte de lansarea generală.

- Secțiune Cont și setări: profil, securitate, aspect și confidențialitate, accesibilă din bara laterală.
- Preferință temă luminos/întunecat/sistem, memorare opțională și resetare locală.
- Integrare opțională Supabase pentru e-mail verificat/parolă, înregistrare, recuperare, Google/Apple, editare profil/e-mail și deconectare. Metodele neconfigurate sunt dezactivate explicit; Sites păstrează autentificarea ChatGPT.
- Ghid complet de configurare Supabase + Resend și teste locale cu furnizor simulat. Serviciile externe nu sunt încă activate.

## 0.8.3 — 2026-10-04

- Mod întunecat/luminos cu buton accesibil în antet, pe desktop și mobil.
- Preferință păstrată local; la prima utilizare respectă tema sistemului, fără transmiterea preferinței unui serviciu extern.
- Culori adaptate pentru chat, navigare, bibliotecă, dialoguri și editor; exporturile păstrează culorile pentru tipărire.

- Cerințe permanente pentru website, Android și iOS: politici, consimțăminte, date minime, audit terți, transparență, accesibilitate, licențe și solicitări de ștergere. Înregistrate în instrucțiuni și backlog; implementarea rămâne separată.

## 0.8.2 — 2026-10-04

- Paletă globală: albastru #2563EB, emerald #10B981, fundal #F8FAFC, text #0F172A.
- Acțiuni și selecții albastre; progres și salvare emerald; suprafețe, contururi și text secundar în nuanțe slate.
- Aplicată în navigare, chat, documente, bibliotecă, dialoguri, editor și favicon; focus vizibil și culori semantice pentru erori.

## 0.8.1 — 2026-10-04

- Dialogul documentului centrat explicit orizontal și vertical, lățime mai echilibrată și spațiu egal față de marginile ecranului.
- Documentul păstrează centrarea în interior; spațiere adaptivă și editor pe tot ecranul pe mobil.

## 0.8.0 — 2026-10-04

- AI identifică documentele create și deschide automat editorul; card pentru redeschidere din conversație.
- Editare directă a titlului/conținutului, formatare de bază, previzualizare și salvare persistentă în istoric.
- Export PDF A4 cu paginare și diacritice, Word editabil cu tabele; sursele consultate incluse.
- Protecție pentru modificările nesalvate și validarea documentelor pe server.

## 0.7.0 — 2026-10-03

- Meniuri „···” pentru fiecare conversație și proiect; mutare prin listă de proiecte în dialog separat, fără înghesuirea titlului.
- Ștergere conversație cu confirmare: mesaje/citări eliminate, documentele păstrate în bibliotecă.
- Ștergere proiect cu confirmare: conversațiile rămân în istoric, fără proiect.
- Protecție împotriva accesului altor conturi, reapariției chatului din documentele vechi și salvărilor concurente după ștergere.

- Repository privat transferat în organizația GitHub ProfOS-Edu; conexiunea locală actualizată.

## 0.6.1 — 2026-10-03

- Proiecte și istoric direct în bara laterală, cu căutare, grupuri expandabile și creare proiect inline.
- Mutarea conversației în meniul „···”; eliminate istoricul din antet și selectorul de proiect din composer.
- Meniu lateral pe mobil, fundal de închidere și suport Escape.
- Simplificate antetul, ecranul de pornire și caseta de mesaj.

## 0.6.0 — 2026-10-03

- Proiecte și istoric persistent în contul Sites.
- Conversații noi distincte, căutare după titlu, filtrare după proiect și redeschidere cu mesaje, citări și documente.
- Mutarea conversațiilor între proiecte; selecția surselor se salvează pe server.
- Salvare înainte de apelul AI și salvarea răspunsului pe server înainte de trimitere; protecție la suprascriere între ferestre.
- Recuperarea grupurilor de documente anterioare; mesajele vechi nesalvate nu pot fi reconstruite.

## 0.5.0 — 2026-10-03

- Bibliotecă de surse: catalogul comun, materialele indexate, documentele profesorului din toate conversațiile și sursele web citate.
- Căutare după metadate, filtre, selecție/golire și linkuri la originale.
- Căutarea RAG aplică selecția verificată pe server; materialele neindexate și documentele altor utilizatori sunt respinse.
- Vizualizare PDF pentru documentele profesorului; revizuire a răspunsurilor documentare care omit citarea.
- Verificări documentate în docs/LIBRARY.md.

## 0.4.0 — 2026-10-03

- Documentele profesorului și manualele au prioritate; căutarea web completează informațiile lipsă.
- Încărcare documente în chat, stări de procesare, păstrare pe server și ștergere completă.
- Originale R2, metadate D1, indexuri OpenAI separate și acces verificat pe utilizator/conversație.
- Citări accesibile și surse distincte pentru documente, manuale și internet.
- Fluxuri reale verificate pentru TXT/PDF/DOCX, răspunsuri document/web/mixt, validări, izolare și ștergere. Limitele sunt în docs/HYBRID_EVALUATION.md.

## 0.3.0 — 2026-10-03

- Catalog general manuale.edu.ro și colecție activă de matematică pentru clasa a V-a: 9/9 volume indexate.
- Import reluabil cu stări SQLite, extracție pe pagini, OCR, metadate și reîncercări.
- Chat RAG cu căutare filtrată, citări și linkuri la paginile PDF; numărul manualelor afișat în interfață.
- Pilot privat publicat; 9/10 verificări ale fluxului au trecut. Recuperarea pentru triunghiuri și verificarea formulelor rămân deschise.

## 0.2.0 — 2026-10-01

### Adăugat

- Site de chat AI adaptat pentru telefon și desktop, cu interfață în română.
- Casetă de mesaj, conversație nouă, stare de așteptare, oprire și reîncercare.
- API server-side cu context conversațional și cheia păstrată ca secret.
- Validări, limitarea contextului și timeout; contract JSON documentat pentru viitoarele aplicații mobile.
- RAG-ul și aplicațiile mobile sunt planificate separat.

- Configurare locală a cheii OpenAI prin introducere ascunsă și test API cu timeout, erori și afișarea consumului. Apelul real a fost verificat cu succes.
- Folosirea certificatelor de sistem macOS când instalarea Python nu are un bundle disponibil, cu verificarea TLS activă.

## 0.1.0 — 2026-10-01

### Adăugat

- Documentație pentru scop, stare, MVP și arhitectură conceptuală.
- Backlog, roadmap, jurnal de lucru și registru de decizii.
- Reguli pentru actualizarea progresului și șabloane GitHub.
- Repository privat GitHub pentru versionarea proiectului.

Această versiune conține doar documentație.
