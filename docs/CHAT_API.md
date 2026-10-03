# Chat web — 0.4.0

## Comportament

Interfață în română pentru desktop și mobil, cu mesaje, indicator de așteptare, oprire locală, reîncercare și conversație nouă. Enter trimite pe desktop; Shift+Enter adaugă o linie. Pe mobil, trimiterea se face prin buton.

Conversația este păstrată numai în memoria paginii; reîncărcarea o șterge. Există RAG pentru manuale, încărcări proprii în conversație și completare web. Nu există încă istoric persistent al mesajelor. Mesajele sunt trimise către OpenAI pentru generarea răspunsurilor, cu store:false. Acest parametru nu este o promisiune de zero retenție pentru întreg serviciul furnizorului.

## API separat de interfață

POST /api/chat, Content-Type: application/json

```json
{"messages":[{"role":"user","content":"Salut"}]}
```

Succes (200):

```json
{"reply":"Răspuns cu citări [1].", "grounded":true, "sources":[{"id":1,"title":"Matematică","schoolClass":"Clasa a V-a","subject":"Matematica","publisher":"Editura","page":76,"url":"https://manuale.edu.ro/...pdf#page=76"}]}
```

Eroare: corp cu `error`, status 400/413/415 pentru intrare invalidă, 403 pentru origine nepermisă, 429 pentru limita furnizorului, 502/503/504 pentru serviciu indisponibil/configurare/timeout.

Limitări: 6000 caractere per mesaj, 80 mesaje per cerere, 65000 caractere în corp; numai ultimele 20 de mesaje ajung la model. Maximum 1800 tokeni pentru răspuns; timeout 90 secunde. Răspunsurile incomplete sunt tratate ca erori, nu afișate ca și cum ar fi complete. Oprirea în browser nu garantează oprirea imediată a procesării sau a costului la furnizor.

## Chei și acces

Cheia se citește numai pe server din OPENAI_API_KEY; modelul din OPENAI_MODEL. Local, web/.dev.vars este ignorat și are permisiuni restrictive. În Sites, cheia este configurată ca secret. Nu este inclusă în bundle-ul client.

Site-ul este destinat accesului privat al proprietarului. Înainte de acces public trebuie introduse autentificare pentru utilizatori și limite de consum. Acestea nu sunt implementate acum.

## iOS și Android

Aplicațiile viitoare pot folosi același contract JSON. Înainte de integrarea lor vom defini autentificarea mobilă, autorizarea și limitele de consum. Nu există încă aplicații mobile sau autentificare cu token pentru acestea.

`OPENAI_VECTOR_STORE_ID` configurează indexul serverului. `/api/library/status` returnează numărul manualelor din colecția activă indexate și totalul 9. Fără dovezi în documente, modelul poate căuta web; fără surse citate, răspunsul are `grounded:false` și `sources:[]`. Vezi RAG.md pentru limite.

Documentele proprii, câmpurile suplimentare ale răspunsului și accesul pe utilizator sunt descrise în HYBRID_CHAT.md. Sursele includ `kind` (`manual`, `document`, `web`); pagina este opțională și disponibilă numai pentru manualele extrase pe pagini.

În 0.6.0, chatul trimite și revision după salvarea mesajului utilizatorului în /api/history. Serverul verifică proprietarul și revizia, salvează răspunsul cu surse înainte de trimitere și returnează noua revision. Apelurile fără revision păstrează compatibilitatea API anterioară, fără salvare automată a răspunsului. Vezi HISTORY.md.
