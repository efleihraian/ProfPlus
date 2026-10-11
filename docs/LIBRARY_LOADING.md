# Încărcarea bibliotecii

## P-065 — încărcarea bibliotecii, 2026-10-11

La deschiderea bibliotecii, aplicația nu mai parcurge serial fiecare pagină a indexului OpenAI. Backendul Supabase citește numai proiecția comună a importurilor și inventarul originalelor, în paralel și cu paginare stabilă de 1.000 de înregistrări. Un material este disponibil pentru AI numai dacă importul este `indexed`, are `file_id` și `attached=1`. Fișierele extrase, originale sau referințele omise nu devin indexate prin simpla prezență în cloud.

Snapshotul comun este reutilizat 60 de secunde; cererile simultane folosesc aceeași încărcare. Datele personale și selecțiile profilului sunt calculate separat, pentru fiecare cerere autentificată. Cheia Supabase rămâne pe server, furnizorii și audiența rămân aceiași; fără migrare sau schimbare RLS. În backendul anterior este păstrată verificarea indexului OpenAI.

Măsurare HTTP locală: înainte, GET /api/library nu a returnat date în 60 s; după, 2,738 s cold și 0,040 s warm la portul de test, apoi 4,760 s cold după repornire la localhost:3000. Răspunsul verificat conține 4.663 materiale, dintre care 4.650 ready și 13 failed; fără avertismente. Cifrele sunt o fotografie, importul activ continuă. Browserul arată biblioteca populată și 40 de carduri inițiale; guest + chatId privat este refuzat cu 401. Nu s-a testat un login real nou pentru fiecare cont.

Teste trecute: cloud-library (peste 1.200 înregistrări, cache/coalescing/TTL, rotație cheie, erori/retry, două conturi simultane fără amestec și guest fără documente private), supabase-storage (1.001 înregistrări paginate, ordine/filtru/proiecție), manual-library, library-availability, guest-chat, common-resources, common-rag, TypeScript și build. CI include cele două suite cloud. Scanner Git/client: 1.323 fișiere/bloburi, fără detecții. Audit npm: aceleași 8 high existente în toolchain (P-046); controlul nu este dezactivat.

Responsabil: Marcos/Cosmin Soames (marcossoames), issue #12, branch fix/P-065-library-loading. Checkout izolat: ~/dev/profplus-P-065-library-loading. localhost:3000 rulează acum codul verificat din acest checkout, cu referință ignorată la configurația existentă, fără modificarea copiei operaționale. Log: web/.sites-runtime/local-server.log. Procesele importului 10665/10666 au fost păstrate. Review uman independent necesar înainte de integrarea în main.

Limită: cache-ul expiră la 60 s; importurile apar după checkpointul lor cloud și următoarea reîncărcare. Disponibilitatea citește confirmările importului, fără reconciliere nouă cu furnizorul la fiecare deschidere. Nu se declară transferul complet, calitate OCR perfectă sau audit complet.

## Publicare confirmată

Sites a confirmat `succeeded` la 2026-10-11T08:56:51Z, deployment `appgdep_6acb4f3c63c481918940e91aa92ccc65`, source `f7e292b8c94bff10f57c58023b2dc10b4d49c007`, versiune `appgprj_6abec66261108191a46809aef0d505ad~appgver_0948be1ef6fc8191a482b3d1597040bf`, env revision 4. Adresă: https://profos-chat.cosminsoames.chatgpt.site. Operația privată a păstrat accesul exclusiv al proprietarului. Scannerul buildului Sites: 305 fișiere/bloburi fără detecții. Publicarea pilotului este separată de review și integrarea PR-ului în main.
