# Arhitectură conceptuală

Tehnologiile nu sunt încă alese. Acesta este fluxul propus, nu o implementare existentă.

## Ingestie

Document → validare → extragere text → fragmente cu metadate → embeddings → index de căutare.

Metadatele păstrează documentul, pagina/secțiunea, versiunea documentului și proprietarul. Reindexarea și ștergerea trebuie să elimine fragmentele vechi.

## Întrebare și răspuns

Interfață → backend → verificare acces → căutare fragmente → context pentru model → răspuns cu surse → interfață.

AI wrapper-ul gestionează apelurile către model, configurarea, timeout-urile, erorile și consumul. Cheile API sunt păstrate pe server. RAG-ul gestionează ingestia și recuperarea dovezilor.

Conținutul documentelor este tratat ca informație, nu ca instrucțiuni pentru aplicație. Răspunsurile și sursele trebuie evaluate; simpla existență a unei citări nu garantează corectitudinea.

## Decizii necesare

Frontend/backend, model AI, embeddings, stocare fișiere, index, autentificare și găzduire. Alegerile vor fi înregistrate în DECISIONS.md după definirea MVP-ului.
