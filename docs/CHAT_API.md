# Chat web — 0.2.0

## Comportament

Interfață în română pentru desktop și mobil, cu mesaje, indicator de așteptare, oprire locală, reîncercare și conversație nouă. Enter trimite pe desktop; Shift+Enter adaugă o linie. Pe mobil, trimiterea se face prin buton.

Conversația este păstrată numai în memoria paginii; reîncărcarea o șterge. Nu există încă istoric persistent, încărcare documente sau RAG. Mesajele sunt trimise către OpenAI pentru generarea răspunsurilor, cu store:false. Acest parametru nu este o promisiune de zero retenție pentru întreg serviciul furnizorului.

## API separat de interfață

POST /api/chat, Content-Type: application/json

```json
{"messages":[{"role":"user","content":"Salut"}]}
```

Succes (200):

```json
{"reply":"Salut! Cu ce te pot ajuta?"}
```

Eroare: corp cu `error`, status 400/413/415 pentru intrare invalidă, 403 pentru origine nepermisă, 429 pentru limita furnizorului, 502/503/504 pentru serviciu indisponibil/configurare/timeout.

Limitări: 6000 caractere per mesaj, 80 mesaje per cerere, 65000 caractere în corp; numai ultimele 20 de mesaje ajung la model. Maximum 1500 tokeni pentru răspuns; timeout 45 secunde. Răspunsurile incomplete sunt tratate ca erori, nu afișate ca și cum ar fi complete. Oprirea în browser nu garantează oprirea imediată a procesării sau a costului la furnizor.

## Chei și acces

Cheia se citește numai pe server din OPENAI_API_KEY; modelul din OPENAI_MODEL. Local, web/.dev.vars este ignorat și are permisiuni restrictive. În Sites, cheia este configurată ca secret. Nu este inclusă în bundle-ul client.

Site-ul este destinat accesului privat al proprietarului. Înainte de acces public trebuie introduse autentificare pentru utilizatori și limite de consum. Acestea nu sunt implementate acum.

## iOS și Android

Aplicațiile viitoare pot folosi același contract JSON. Înainte de integrarea lor vom defini autentificarea mobilă, autorizarea și limitele de consum. Nu există încă aplicații mobile sau autentificare cu token pentru acestea.
