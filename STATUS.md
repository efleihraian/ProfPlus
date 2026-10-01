# Starea proiectului

Ultima actualizare: 2026-10-01
Versiune: 0.1.0
Etapă: definirea MVP-ului

## Finalizat

- [x] Scop inițial și limite documentate.
- [x] Evidență pentru progres, versiuni, decizii și sarcini.
- [x] Flux conceptual AI wrapper + RAG.
- [x] Repository privat creat pe GitHub: https://github.com/marcossoames/ProfOS.

## În lucru

- Confirmarea publicului țintă și a unui singur caz de utilizare.
- P-005: conexiunea OpenAI API verificată cu succes; backend-ul aplicației rămâne de implementat.

## Urmează

1. Finalizarea `docs/MVP.md` cu utilizator, documente și întrebări reale.
2. Alegerea tehnologiilor și documentarea deciziei.
3. Implementarea unui flux complet: document → căutare → răspuns cu surse.

## Blocaje și limite

- Nu există documente de referință în directorul sincronizat `sources/`.
- Publicul țintă și bugetul nu sunt stabilite. OpenAI este furnizorul pentru primul test; modelul final rămâne de ales.

## Verificare

Apel real verificat cu gpt-4.1-mini: răspuns „Conexiunea ProfOS funcționează.”, 24 tokeni de intrare și 12 de ieșire. Certificatele sistemului macOS sunt folosite când Python nu are propriul bundle. Interfața și RAG-ul nu sunt implementate.
