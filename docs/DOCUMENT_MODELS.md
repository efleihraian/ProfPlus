# P-068 — Modele de documente ale profesorilor

Cererea titularului din 2026-10-11: documentele generate trebuie să urmeze exemple reale, cu prioritate pentru modelele fiecărui profesor. Exemplele comune vor fi furnizate de titular ulterior. Codul nu pretinde că acestea au fost deja primite sau că modelul AI a fost antrenat.

## Folosire

În conversație, profesorul alege „Adaugă document”. După încărcare, deschide biblioteca, filtrează „Documente încărcate” și alege „Încadrează / folosește ca model”. Bifează unul sau mai multe tipuri: Test, Barem, Planificare, Proiect de lecție, Fișă de lucru; verifică materia și ciclurile și salvează. „Modelele mele” arată exemplele personale. Debifarea tuturor tipurilor oprește folosirea ca model; ștergerea documentului/contului folosește fluxul existent, fără copii suplimentare.

Modelele sunt folosite în toate conversațiile contului, inclusiv când documentul original aparține altei conversații. Nu trebuie bifate ca surse. Selecția automată factuală exclude modele; profesorul poate totuși selecta explicit documentul ca sursă în vederea consultării conținutului. Proveniența exercițiilor și copia pentru elevi rămân funcțiile P-067.

## Alegerea și prioritatea

Tipurile sunt identificate din cererea recentă, inclusiv cereri test + barem. Pentru fiecare tip se aleg maximum două modele personale recente, indexate și potrivite materiei/ciclului; maximum șase modele distincte. Dacă nu există exemplu personal utilizabil pentru acel tip, se consultă exemplele comune aprobate potrivite. Un barem personal nu înlocuiește o planificare comună. În lipsa oricărui exemplu, format standard sobru, fără emoji, introduceri conversaționale sau subtitluri decorative. Cererea profesorului decide conținutul și are prioritate față de exemple.

Textul extras ghidează antetul, ordinea secțiunilor, cerințele, numerotarea, coloanele tabelelor și punctajul. Nu este sursă factuală implicită, instrucțiune de sistem sau fine-tuning. Nu există reproducere garantată a fonturilor, siglelor și paginării originale ori a documentelor scanate ilizibile. Evaluarea fidelității pedagogice și vizuale pe exemplele titularului rămâne de făcut după primirea lor.

## Exemplele comune ale titularului

Registrul server `web/lib/common-document-models.json` este deocamdată gol, intenționat. Când titularul trimite aici teste, bareme sau planificări, agentul citește originalele păstrate privat și pregătește structuri/exemple anonimizate. În registru se adaugă numai referințele aprobate pentru folosire comună: id, title, type, subject, stages, text (maximum 6.000 caractere), approved=true. Nu se comit originale private, nume de elevi, note, contacte, secrete sau documente ale altor profesori. Modificarea este verificată și publicată direct pe main și pe site, conform instrucțiunii active. Doar existența approved=true nu echivalează cu verificarea umană: autorizarea titularului și drepturile de utilizare se documentează la adăugare.

Nu există promovare automată a documentelor încărcate în ProfPlus în modele comune. Un profesor obișnuit nu primește drept de curator din profil sau metadate de autentificare.

## Date și verificări

`modelTypes` este metadata JSON în tabelul existent document_labels: fără schemă/RLS noi, fără cache comun pentru modele personale. PATCH verifică identitatea, proprietarul, originea și valorile permise; invalid/duplicate respinse cu 400, document străin cu 404. Documentele se citesc prin interogarea existentă pe proprietar, apoi identificatorii fișierului și indexului se preiau exclusiv din rândul autorizat. Maximum 1 MiB/răspuns la extragere, 6.000 caractere/model (început + sfârșit pentru exemple lungi), două citiri concurente, buget 10 s de consultare; fără păstrarea fragmentelor în cache/transcript. Datele merg numai la furnizorul AI deja folosit, Responses store=false. Eșecurile și modelele în procesare produc avertismente, cu fallback explicit.

Verificări executate: TypeScript, build, modele private/personal-first per tip/materie/ciclu/fallback aprobat/guest/eroare furnizor; API real cu Auth/DB fixture pentru salvare, cont străin, CSRF, validări și excluderea factuală automată; suite cont/ștergere și bibliotecă/cache/Supabase/RAG/guest/proveniență/export. Browser: salvare Test+Barem, listă Modelele mele, desktop și 390×844, fără overflow orizontal. Nu au fost folosite documente reale ale elevilor sau apeluri AI reale pentru această evaluare. Build Site complete, fără rută QA. Audit dependențe: zero în producție, opt high existente în toolchain, controlul CI păstrat. Scanner Git/client și source/client Site fără detecții; limitele scannerului sunt păstrate.

## Livrare

P-065 și P-067 integrate în main la 08642f9; PR-urile #13/#15 sunt MERGED. Regula activă este livrarea directă pe main, fără PR/review independent, până când titularul anunță reluarea colaborării. Protecțiile datelor, verificările și push fără forțare rămân. Checkout-ul operațional cu import activ nu a fost sincronizat sau curățat; importul P-066 continuă separat.

Publicare confirmată succeeded la 2026-10-11T10:50:39Z: https://profos-chat.cosminsoames.chatgpt.site/, deployment appgdep_6acb69e78ac08191b4891de70867aa3f, source Site c35840059bbe9283f2476bbb1509092cbb577fdb, env revision 4; audiență owner-only păstrată. Cod integrat direct pe main la 25bce36, fără PR nou. Localhost:3000 servește noul worktree P-068, HTTP 200; proces local 34584. Preview-ul cu cont fictiv oprit, fără rută QA în build. Importul operațional a fost verificat separat: 22491/22492 erau active la fotografia anterioară; ulterior s-au oprit cu IMPORT_STOPPED. Reluat fluxul finit existent cu aceeași cheie și protecția ștergerii locale după confirmare cloud; codul operațional nu a fost modificat.

CI remote 38133353969: contracte import, scanner Git/client, TypeScript, build și toate suitele web (inclusiv modele) trecute; npm audit --audit-level=high eșuat exclusiv pentru cele 8 high preexistente braces/micromatch și lanțul toolchain. Zero alerte în producție în auditul local. Nu se dezactivează controlul și nu se declară CI complet verde. Scanner Git/client 1.462 fișiere/bloburi, source/client Site 282, zero detecții; limitele scannerului rămân.
