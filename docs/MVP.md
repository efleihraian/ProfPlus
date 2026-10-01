# Definirea MVP-ului

## Primul pas

Stabilim un singur utilizator și o singură problemă pe care aplicația o rezolvă folosind documente. Apoi alegem 3–5 documente reprezentative, cu drept de utilizare, și scriem 10–20 întrebări cu răspunsurile așteptate și sursele lor. Acest set va arăta dacă RAG-ul funcționează.

## De completat înainte de implementare

- Utilizatorul țintă: de confirmat.
- Problema concretă: de confirmat.
- Tipul și limba documentelor: de confirmat.
- Documentele pilot: de ales; nu sunt încă disponibile.
- Buget lunar și cerințe de găzduire/confidențialitate: de confirmat.

## Flux propus

1. Utilizatorul încarcă un document.
2. Aplicația indică dacă documentul a fost indexat sau a eșuat.
3. Utilizatorul pune o întrebare.
4. Aplicația caută în documentele accesibile lui.
5. Aplicația oferă un răspuns cu surse sau spune că informația nu este suficientă.

## Criterii de acceptare

- Sursele pot fi deschise și susțin afirmațiile răspunsului.
- Întrebările fără dovezi în documente nu primesc afirmații prezentate ca fapte documentate.
- Documentele altui utilizator nu sunt accesibile.
- Erorile de încărcare sau de model sunt vizibile și permit reîncercarea.
- Pragurile numerice de calitate, latență și cost se stabilesc înaintea evaluării pilot.

## Amânat

OCR, agenți care execută acțiuni, integrări multiple, fine-tuning, plăți și administrare avansată.
