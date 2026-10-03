# Catalog manuale.edu.ro

Inventar verificat la 2026-10-03, extras din catalogul public https://www.manuale.edu.ro/. Fișierul CSV conține metadate și linkuri, nu textul manualelor.

- 1341 înregistrări în catalogul sursă.
- 1349 volume/linkuri PDF după separarea manualelor în părți.
- Linkurile sunt construite după regulile publice din assets/js/pages/book.js.
- Toate înregistrările sursă sunt marcate ca având PDF; disponibilitatea fiecărui link nu a fost încă verificată.
- Un PDF de probă, A1366.pdf, răspunde HTTP 200 cu Content-Type application/pdf.

`status=discovered` înseamnă doar inventariat. Nu înseamnă descărcat, extras sau indexat în RAG. Catalogul site-ului nu dovedește că include toate manualele aprobate ori toate edițiile; acoperirea trebuie evaluată separat. ID-urile limbilor sunt păstrate ca în sursă și nu sunt interpretate încă.

Următoarea etapă: verificarea linkurilor cu reluare și ritm moderat, descărcarea documentelor în stocare exclusă din Git, deduplicare după conținut, extragerea textului pe pagini și identificarea celor care au nevoie de OCR. Pentru matematică trebuie verificată și fidelitatea formulelor și diagramelor. Înregistrăm separat sursa și condițiile de utilizare; accesul public nu este tratat ca licență pentru redistribuire.
