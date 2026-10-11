# P-070 — Referințele comune de documente

Titularul a furnizat la 2026-10-11 șase DOCX și patru PDF pentru a ghida generarea când profesorul nu are modele proprii potrivite. Autorizează folosirea structurilor în acest scop, nu publicarea originalelor, datelor personale sau preluarea integrală a enunțurilor. Originalele rămân nemodificate în locațiile furnizate; în Git/Sites intră numai referințe anonimizate de structură.

## Inventar și alegere

| Referințe | Tip | Clasă |
| --- | --- | --- |
| 3 planificări calendaristice | planning | V, VI, VII |
| 3 proiectări de unități | unit | V, VI, VII |
| 2 teste, variante R1/R2 | test | VI |
| 1 barem R1/R2 | rubric | VI |
| 1 fișă recapitulativă | worksheet | VI |

Toate cele șase DOCX au fost citite integral ca text, tabele și metadate de pagină; toate cele opt pagini PDF au fost extrase. Inspecție vizuală a primei pagini din planificarea V și proiectarea V și a paginilor reprezentative din cele patru PDF. Referințele nu includ numele școlii/profesorului, anul, manualele, codurile programei, calendarul ori exercițiile ca valori implicite. Câmpuri de completat în locul datelor necunoscute.

Un model personal utilizabil prevalează pentru același tip. Se păstrează limitele P-068: două modele/tip, șase personale distincte în total. Pentru referințele comune, când există clasa cerută, se aleg acea clasă și eventual exemple fără clasă, fără amestec cu alte clase. Dacă nu există clasa exactă, exemplele disponibile ghidează numai structura; conținutul și competențele se adaptează/verifică separat. Fără referințe de altă materie/ciclu în profil. Un vizitator fără profil primește referințe matematice numai dacă cererea identifică matematica prin disciplină sau termenii tematici recunoscuți; nu se presupune matematica pentru o cerere generică ori de altă materie. Acoperirea exemplarelor actuale este matematica de gimnaziu; celelalte materii folosesc modelele personale ori formatul sobru existent.

## Planificări și unități

Planificarea păstrează șase coloane: unitatea de învățare, competențe specifice, conținuturi, număr ore alocate, săptămâna, observații. Pentru o săptămână normală cu patru ore: două rânduri cu aceeași săptămână, Algebră — 2 ore și Geometrie — 2 ore. Recapitularea/evaluarea intră în acestea. Corectează repartizarea originală, cu geometria amânată. Regula este instrucțiune de organizare a titularului, nu obligație legală; cererea explicită diferită a profesorului are prioritate.

Proiectarea unității are șase coloane distincte: unitatea, conținuturi detaliate, competențe, activități, resurse, evaluare. Resursele au Timp/Metode/Materiale/Organizare. Duratele coincid cu planificarea corectată: 7 săptămâni la 2 ore de algebră = 14 ore, nu cele 28 din model. Datele modulelor, săptămânile speciale și codurile programei se folosesc numai dacă sunt furnizate/verificate. Fără acestea, document orientativ și câmpuri necompletate. Aspectul landscape al originalelor este referință de stil; exporturile existente nu garantează fonturi, dimensiuni sau paginare identice.

Testele folosesc antet compact, părți cu punctaj, numerotare fără buline și variante lizibile; baremele au corespondență exactă și punctaj pe pași. Distribuția exemplului 90+10 puncte se recalculază la cererea profesorului. Fișa păstrează exerciții gradate cu subpuncte, fără decor de chatbot. Nu se copiază răspunsurile, enunțurile sau referințele necunoscute din exemple pentru date noi.

## Date și limite

Registry numai server, fără original în client sau Git. Tipul unit folosește metadata JSON existentă, fără migrare/permisiuni/furnizori noi. Modelele personale rămân private și nu sunt promovate automat. Referințele sunt date de stil nefiabile; instrucțiunea 2+2 este în regulile aplicației înainte de aceste date. Nu reprezintă fine-tuning, verificare matematică sau garanție de fidelitate. Profesorul verifică documentul înainte de folosire. Planificările anuale foarte lungi rămân supuse limitei existente de ieșire AI; probele scurte nu certifică generarea integrală a unui an.

## Verificări și livrare

TypeScript/build și suitele document-models, guest-chat, teacher-test-controls, document-latex, supabase-storage și test:account trecute. Noile cazuri verifică toate cele zece referințe valide, selectarea clasei, tipul unit, prioritatea personală, excluderea altei discipline și metadata unit cu refuz cont străin/CSRF. SHA-256 identic pentru toate cele zece originale după analiză; identitățile școlii/profesorului din originale absente din registru.

Probe reale Responses cu cheia/modelul deja configurate, store=false, numai cereri fictive și referințe anonimizate, fără documente personale originale. Au evidențiat inițial rânduri Markdown fragmentate și un buget de ore repetat în proiectare. Au fost corectate regulile și introdus un schelet complet de unitate cu alocări fără suprapunere. Ultima planificare scurtă are S1/S2 fiecare cu două rânduri consecutive Algebră/Geometrie × 2 ore; ultima proiectare are antet, șase coloane și 8+4+2=14 ore în S1–S7. Probe focalizate de stil/alocare, nu evaluare matematică a întregului corpus și nu testarea tuturor formatelor prin AI. Testele/baremele/fișa sunt verificate structural în registru; nu au probă de generare reală în P-070. Fără garanție pentru orice ieșire AI.

Audit npm final: zero vulnerabilități de producție, opt high preexistente în toolchain; controlul CI păstrat. Scannerele finale și publicarea se confirmă separat mai jos.

Scannere finale: Git/istoric/client 1.527 fișiere/bloburi și source/client Site 283, fără detecții; scanare pe pattern și valori cunoscute, nu audit complet. Sursa Site verificată identică celor trei fișiere web modificate.
