# Configurarea OpenAI API

Necesită Python 3. Nu necesită pachete suplimentare.

Din directorul proiectului, într-un Terminal interactiv:

```bash
python3 scripts/setup_api.py
```

Lipește cheia la solicitare. Nu se afișează pe ecran și nu ajunge în istoricul comenzilor. Este salvată în .env cu acces numai pentru proprietar; .env este exclus din Git. Nu o trimite în chat sau în issue-uri.

Pentru un singur apel de verificare, cu cost API:

```bash
python3 scripts/test_api.py
```

Se trimite doar o propoziție fixă, fără documente. Se afișează răspunsul, modelul și consumul. Cheia nu se afișează. OPENAI_MODEL poate fi schimbat în .env. Variabilele de mediu au prioritate față de fișier.

Modelul inițial este gpt-4.1-mini, exclusiv pentru verificarea conexiunii; alegerea modelului pentru MVP rămâne deschisă. Testul nu dovedește calitatea RAG-ului și nu constituie un backend sau o interfață implementată.

Surse: [Quickstart](https://developers.openai.com/api/docs/quickstart), [model](https://developers.openai.com/api/docs/models/gpt-4.1-mini).
