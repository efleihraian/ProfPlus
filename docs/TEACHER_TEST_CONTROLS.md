# P-067 — Surse prioritare, copie pentru elevi și formule

Cererea titularului, 2026-10-11; responsabil echipa. Branch izolat bazat pe P-065 deja publicat, păstrând checkout-ul operațional și importul activ. P-065 și P-067 integrate pe main la `08642f9`, 2026-10-11, conform noii instrucțiuni explicite: livrare direct pe main fără PR până la reluarea colaborării.

## Comportament

„Folosește toate materialele potrivite” rămâne selecție automată după profil. Steaua se aplică exclusiv materialelor selectate și indexate: cel mult 10 comune și 10 proprii. Debifarea unui material elimină și prioritatea. Selectarea automată păstrează prioritățile încă eligibile; preferințele sunt salvate în JSON-ul conversației fără migrare de schemă. Sursele noi pot deveni eligibile la refresh. Identificatorii prioritari care nu mai sunt în selecția autorizată sunt eliminați server-side.

RAG face o căutare distinctă în subsetul comun prioritar și una în selecția completă: până la patru pasaje prioritare rezervate, până la opt comune în total, fără duplicate. Documentele proprii rămân autorizate pe cont și căutate cu maximum patru cereri concurente; până la cinci pasaje, prioritățile relevante înaintea restului. Instrucțiunile modelului folosesc prioritatea pentru temă, tip, stil și dificultate; nu permite inventarea/certificarea provenienței și nu echivalează cu citirea integrală a fiecărui document. Limita requestului crește la 600.000 caractere pentru selecții manuale mari; validările mesajelor, limitele identificatorilor și plafonul de bytes rămân.

„Ascunde proveniența” schimbă reversibil previzualizarea și ambele exporturi, fără să rescrie documentul salvat: elimină liniile etichetate Proveniență/Sursă/Referință conceptuală, secțiunile de referințe/surse și citările cunoscute. Nu elimină enunțurile/baremul; protejează codul și valorile între paranteze pătrate din formule. Butonul este dezactivat în timpul editării, pentru a evita salvarea involuntară a copiei fără proveniență. „Arată proveniența” restaurează vizualizarea. Nu pretinde identificarea tuturor notelor scrise liber fără etichetele definite.

Chat și editor: Markdown + matematică KaTeX locală, fără raw HTML, trust=false, macro-expansiune/dimensiuni limitate. Repară delimitatorii vechi \(…\), \[…\] și formulele între paranteze din variantele exemplului furnizat. Nu modifică răspunsurile intenționat greșite. Formulele sunt păstrate prin serializarea editării; variantele nu au simultan bulină și literă. Documentele noi primesc instrucțiuni pentru delimitatori matematici, numerotare și separarea variantelor.

PDF/Word: motorul SVG MathJax se încarcă numai la export; formulele devin imagini PNG la rezoluție de trei ori dimensiunea afișată, cu diacritice, aliniere și paginare. Word păstrează enunțul editabil; formulele sunt imagini cu text alternativ, nu ecuații Word native editabile. Formulele neacceptate blochează exportul cu mesaj, nu se exportă silențios ca LaTeX defect. Rezultatul rămâne local în browser. Fără CDN, resurse externe sau relaxare CSP; imaginile SVG intermediare folosesc data URI. Limite pentru lungime, macro-uri și suprafața canvasului.

## Verificări executate

- TypeScript; suite cont/auth/izolare, guest, proveniență, bibliotecă/cache/Supabase și metadate comune trecute cu furnizori simulați.
- Teste noi pentru salvarea automată a priorităților, subseturi invalide/document străin, limită, conservarea enunțurilor/baremului/matematicii, delimitatori vechi și SVG sigur; căutarea prioritară distinctă și menținerea selecției largi.
- Browser local: selecția automată păstrează 4.757 materiale când unul devine prioritar; contorul devine 1. Preview desktop și 390×844 cu formule, fracții, rădăcină și variante; un click ascunde proveniența, referințele și lista surselor.
- Descărcări reale: PDF o pagină / șase imagini de formule; Word șapte fișiere media. Enunțurile prezente și nicio proveniență/listă de surse în textul PDF sau XML-ul Word. PDF inspectat vizual.
- Detector UI: numai avertismentul fontului Inter existent, păstrat în această schimbare restrânsă.
- Audit npm complet: 8 high deja existente în instrumentele de build/lint. Alertele introduse de dependențele matematice sunt remediate prin KaTeX 0.19.0 și xmldom 0.9.12; nu există alerte în dependențele de producție. Nu se dezactivează controlul CI.

Nu este evaluare pedagogică sau audit complet de securitate/GDPR; nu schimbă audiența privată, identitățile, RLS sau furnizorii. Publicarea privată este confirmată succeeded, 2026-10-11 10:18 UTC, pe [adresa site-ului]. Source Sites `f359a4cfb6d0122560d73df1cd7fc87066a7fbd8`, deployment `appgdep_6acb626d1adc819195835585b1214694`, env revision 4. Scanner Git/istoric/client: 1.426 fișiere/bloburi, fără detecții. Scanner pentru checkout-ul și clientul Sites reale: 279 fișiere, fără detecții. Build local și Sites complete; ruta QA temporară exclusă din build/publicare.
