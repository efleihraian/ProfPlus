# Alegerea modelului AI — P-086

Responsabil echipa, cerere din 2026-10-15. Aceeași cheie OpenAI existentă, reutilizată cu acordul explicit al titularului. Fără reindexare sau reantrenare.

## Utilizare

- În Asistent virtual, deasupra mesajului: „Model AI” → GPT-4.1 mini sau GPT-6.1 Sol. Schimbarea se aplică următoarei generări; răspunsurile anterioare nu se regenerează automat.
- În Cont → Aspect și preferințe (`/account?view=preferences`): aceeași alegere. Preferința este locală în browser, separată pentru fiecare cont; nu se sincronizează între dispozitive. Contul și chatul folosesc aceeași preferință; ferestrele deschise se sincronizează prin eveniment/storage. Delogarea/resetarea preferințelor o elimină/resetează.
- Implicit GPT-4.1 mini. Pilotul permite ambele modele tuturor conturilor autentificate; vizitatorii primesc numai mini. Nu există abonamente ori plăți implementate în această sarcină. Costul API rămâne la proiectul titularului.
- Modelul utilizat apare lângă fiecare răspuns nou și rămâne în mesajul salvat în istoric. Mesajele vechi nu primesc retroactiv un model presupus.
- Pentru o comparație utilă, folosește aceeași cerere și aceleași surse în două conversații noi. Nu se fac două apeluri pentru comparație automat; fiecare trimitere generează un singur răspuns, cu posibilele apeluri de revizie/web existente.

## Server și compatibilitate

`lib/ai-models.ts` definește lista permisă și politica server. Corpul cererii acceptă numai cele două ID-uri; alt ID/obiect/null este refuzat cu 400, Sol fără cont cu 401, fără apel AI. Alegerea nu reprezintă un privilegiu sau abonament din user_metadata; când se introduc planuri, politica trebuie conectată la entitlement verificat server-side.

Generarea, completarea din web, corectarea citărilor/structurii și revizia exercițiilor folosesc modelul ales. Revizia nu mai este fixată implicit pe GPT-4.1; pentru comparații coerente folosește același model ca generarea. `OPENAI_REVIEW_MODEL` nu decide aceste revizii. `OPENAI_MODEL` rămâne numai fallback pentru clienții autentificați care nu trimit alegerea, limitat la catalog. Vizitatorii rămân pe mini.

Responses API, `store:false` păstrat. Sol primește reasoning medium și 8.000 tokenuri suplimentare în limita de ieșire pentru raționament (12.000/16.000 total la generarea normală/documente structurate). Mini păstrează bugetele precedente. Timeout total 180 secunde pentru Sol, 90 secunde pentru mini. Răspunsurile incomplete sunt refuzate; modelul nu se înlocuiește pe ascuns. Lipsa accesului/modelul indisponibil produce eroare explicită și permite alegerea celuilalt.

Biblioteca, izolarea documentelor personale, indexurile, filtrarea și sursele RAG nu sunt schimbate. Fără furnizori, chei, migrații sau variabile noi. ID-ul modelului din istoricul editabil nu este o dovadă de facturare sau un privilegiu.

## Dovezi și limite

Acces real cu aceeași cheie: ambele modele HTTP 200/completed și 56 la 7×8. Generare reală structurată cu cerere sintetică de exercițiu de clasa a VI-a: ambele 200/completed și JSON valid; mini aproximativ 4,4 secunde, Sol 16,8 secunde în această singură probă. Aceasta nu este un benchmark, nu certifică dificultatea sau corectitudinea pedagogică și nu verifică RAG-ul real.

Teste automate pentru allowlist, refuz Sol guest, refuz modele arbitrare, generare și revizie cu alegerea autentificată, model raportat în răspuns, reasoning/bugete, store:false și refuz răspuns incomplet. Restul verificărilor și publicarea sunt consemnate în WORKLOG/STATUS. Browser CUA indisponibil în probele anterioare; nu se declară test UI autentificat real până la executarea sa.

Surse oficiale consultate 2026-10-15: https://developers.openai.com/api/docs/models/gpt-6.1-sol și https://developers.openai.com/api/docs/models/gpt-4.1-mini .
