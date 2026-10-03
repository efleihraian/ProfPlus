# Starea proiectului

Ultima actualizare: 2026-10-03
Versiune: 0.3.0
Etapă: pilot RAG — matematică, clasa a V-a

## Finalizat

- Repository privat GitHub cu documentație, versiuni și evidența lucrărilor.
- Site privat de chat AI, API server-side și cheia protejată.
- Catalog general: 1.341 înregistrări / 1.349 volume PDF.
- Toate cele 9 manuale de matematică de clasa a V-a indexate: 7 română, 1 maghiară, 1 germană.
- 2.020 pagini PDF; 1.995 pagini cu text extras, cu metadate de document și pagină.
- Import reluabil, descărcare cu reîncercări, extracție/OCR și index OpenAI.
- Căutare limitată la cele 9 manuale, răspunsuri cu citări și linkuri la pagina PDF.
- RAG publicat privat: https://profos-chat.cosminsoames.chatgpt.site.

## În lucru

- Calitatea recuperării pasajelor: 9/10 cazuri ale primei evaluări au trecut; clasificarea triunghiurilor produce un refuz.
- Verificarea sistematică a formulelor, figurilor și exercițiilor.
- Importul celorlalte clase este oprit; volumele deja importate din alte clase sunt excluse din căutarea activă.

## Urmează

1. Testarea pilotului de către utilizator și întrebări reale de matematică.
2. Îmbunătățirea recuperării pentru cazul despre triunghiuri și evaluarea pedagogică a răspunsurilor.
3. Extinderea colecției după validare; autentificare și limite înainte de acces public/mobile.

## Verificare și limite

TypeScript și build-ul de producție trec. 10 cereri reale, cu surse controlate și două întrebări fără suport: 9/10 au trecut criteriile fluxului. Pagina PDF 76 din Paralela 45 a fost verificată vizual pentru criteriul cu 3. Publicarea confirmată de Sites. Interfața nu a fost verificată vizual în browser, accesul fiind indisponibil. Extracția textului nu garantează formulele sau diagramele; citările nu garantează automat fiecare afirmație. Vezi docs/RAG_EVALUATION.md.
