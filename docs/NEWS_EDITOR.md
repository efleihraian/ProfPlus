# P-079 — Dashboard și știri, 2026-10-14

Cererea titularului: dashboard practic, știri intuitive pentru citire, așezare și adăugare. Issue #23, responsabil echipa. Interfața păstrează paleta, profilul normal și apartenența admin P-078.

## Pentru editor

1. Admin → Știri → Adaugă știre.
2. Completează titlul, rezumatul și articolul. Rândurile libere separă paragrafele. Poți publica un rezumat și un link către sursă, fără text integral.
3. Verifică previzualizarea; pe mobil comută între Redactare și Previzualizare. Nu publică prin simpla previzualizare.
4. Alege știrea principală, unul dintre cele trei locuri secundare sau numai lista știrilor. Pentru o știre nouă este propus primul loc liber, altfel lista completă. Locul ocupat indică titlul articolului înlocuit.
5. Salvează ciorna sau Publică știrea. Ciorna cere titlu; publicarea cere și rezumat, plus text ori sursă HTTPS. Imaginea/sursa sunt câmpuri opționale într-o secțiune secundară. Nu există upload de imagini ori editor HTML.

După salvare editorul rămâne deschis cu revizia actualizată. La publicare se păstrează statusul și apare legătura la articol; pentru o știre publicată acțiunile devin Actualizează și Arhivează. Ciorna poate fi reluată din lista filtrată. Navigarea din editor și setări avertizează pentru modificări nesalvate; înainte de reîncărcare se folosește și protecția browserului. Fără autosave ascuns.

Dashboardul are Privire de ansamblu, Știri, Activitate. Trei indicatori importanți, detalii agregate separat și scurtături către ciorne/publicate. Filtrare după stare și căutare după titlu pe server, cu 250 ms după tastare, pagini de 20 și Mai multe știri; ciornele și știrile vechi nu depind de primii 100 itemi ai snapshotului dashboard. Snapshotul adaugă explicit cele patru poziții active pe Acasă, chiar dacă sunt vechi. Reîncarcă permite recuperarea după erori sau conflict.

## Pentru cititor

Acasă păstrează un articol principal și trei secundare: principalul pe lățime completă, apoi trei coloane pe desktop și o coloană pe mobil. Titlu, categorie, dată, rezumat și legătură clară; tot cardul deschide articolul. Imaginile sunt opționale, iar imaginile care nu se încarcă sunt omise fără blocuri artificiale.

Toate știrile este o listă de carduri, nu toate textele integrale pe aceeași pagină. Căutare după titlu, filtre pe categoriile uzuale, pagini de 20 și Mai multe știri. Articolul are titlu unic, rezumat, paragrafe la o lățime de lectură, timp estimat (200 cuvinte/minut) și întoarcere la listă. Text simplu escape-uit, fără HTML executabil. Categoriile personalizate pot fi introduse de editor; filtrul public oferă categoriile uzuale, iar căutarea după titlu rămâne disponibilă.

## Publicare, păstrare și securitate

`slot=4` reprezintă articol public numai în lista completă. O înlocuire pe Acasă mută automat articolul anterior la slot 4, păstrând statutul published, textul, data publicării și crescând revizia. Nu cere arhivare manuală și nu șterge știrea. Arhivarea explicită retrage articolul din ambele suprafețe. Alegerea este explicată înainte de publicare.

Migration `news_editor_flow`: index unic pentru sloturile 0–3 publicate, slot 4 reutilizabil. RPC-ul verifică membership, serializează modificarea pozițiilor cu un advisory lock pe tranzacție și înregistrează înlocuirea/salvarea în același flux. Revizia învechită întoarce 409; mutarea și auditul se anulează împreună cu scrierea eșuată. [Semantica lockurilor PostgreSQL](https://www.postgresql.org/docs/17/explicit-locking.html#ADVISORY-LOCKS). Proba executată este de conflict/revizie și rollback, nu un stress test cu mai mulți clienți simultan.

Membership, getUser, refuz cont neconfirmat/deleting/Sites și granturile server-only rămân identice. `GET /api/admin/news` este protejat; verifică starea, pagina 1–1000 și titlul <=100 caractere. API public impune published și data <=acum; `home=1` impune slot<4. Paging 20, citiri de 21 pentru hasMore, sortare stabilă după data publicării și ID. Filtrele sunt parametri PostgREST fixați, nu SQL primit din client. Persistență, timeouturi, CSRF/JSON/limitele POST, URL-uri HTTPS, audit minim și retenția P-078 păstrate. Fără furnizori/date de profil/chei/acces noi; Site rămâne owner-private.

## Dovezi și limite

Node admin-news: validare publicare și câmpuri, paginare public/admin și filtre, slot numai-listă, ajutoare de citire, refuz membership/metadata/CSRF/actor falsificat. SQL real `tests/admin_news.sql`: publicare, păstrarea articolului deplasat și revizia lui, conflict de revizie cu rollback inclusiv al deplasării, actor absent și anon/authenticated deny; toate fixture-urile și auditul testului sunt anulate prin ROLLBACK. Migration aplicată; advisor numai 8 INFO server-only RLS/no-policy preexistente, fără WARN/ERROR. API local: home gol real, pagină invalidă 400, dashboard/listă admin anonim 403.

UI cu API proxy sintetic strict loopback, separat de aplicația reală: 1360×1000 și 390×844, dashboard/editor, ciornă→publicare, previzualizare, poziție ocupată explicată, toate știrile/căutare/paginare și lectură pe mobil. Fixture-ul a păstrat 27 știri publicate la salvarea ciornei, apoi 28 la publicare, păstrând știrea înlocuită. Ajustare unică după inspecție: preview cu aceeași tipografie, Acasă principal+trei dedesubt, protecția ieșirii din formular/setări. Capturile exemplifică articole de test, fără publicarea lor în baza reală. Contul real nu a fost impersonat; nu se pretinde login OAuth complet ori audit de securitate complet.

TypeScript/build main și Site, suitele relevante și scanarea Git/client se consemnează în WORKLOG; publicarea se declară numai după confirmare. Copia operațională veche și backupul P-078 rămân intacte. Preview QA se închide la livrare; localhost:3000 rămâne aplicația reală.


Livrare confirmată în 2026-10-15: main `f09ff47`, Site source `f5df7b01f8e9b96284b635542fdf7659985cdfe1`, deployment `appgdep_6acfee54a3508191afa0004aa4b6f834` succeeded; env revision 5 și audiență păstrate. Local: http://localhost:3000/admin. Proxy-ul de verificare nu este aplicația de producție și este oprit la livrare.
