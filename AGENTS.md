# Instrucțiuni pentru agenții care lucrează în ProfPlus

Reguli comune pentru toți oamenii și agenții: [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md). Verifică remote-ul înainte de sarcină, lucrează izolat și livrează prin PR.

Citește README.md, STATUS.md și BACKLOG.md înainte de lucru. Respectă CONTRIBUTING.md. La fiecare schimbare relevantă actualizează starea, backlog-ul, changelog-ul și jurnalul. Înregistrează deciziile importante. Nu inventa cerințe, rezultate de teste sau funcționalități existente. Nu comite secrete sau documente private. Folosește teste relevante pentru comportamentul schimbat.

## Cerințe permanente de produs

Citește și respectă docs/PRODUCT_REQUIREMENTS.md înainte de schimbări. ProfPlus este un produs pentru web, Android și iOS. Cerințele utilizatorului privind confidențialitatea, consimțămintele, minimizarea datelor, auditul terților, transparența comercială, accesibilitatea, licențele și ștergerea datelor se aplică tuturor platformelor. Verifică cerințele afectate de fiecare schimbare; documentează dovezile și limitele. Nu marca o cerință implementată sau conformă doar fiindcă este documentată.

Respectă cerința permanentă GDPR și DPIA. Pentru schimbări de date, identitate, AI, furnizori sau mobil, consultă și actualizează docs/DPIA.md; nu activa lansarea generală înaintea condițiilor documentate și nu inventa aprobări de conformitate.

## Securitate obligatorie pentru orice agent

Citește și aplică [docs/SECURITY_REQUIREMENTS.md](docs/SECURITY_REQUIREMENTS.md) și verifică [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md) înainte de modificări. Cerințele utilizatorului din 2026-10-05 se aplică web/Android/iOS: secrete exclusiv server, scanare Git/build, autorizare server și pe înregistrare, RLS unde se aplică, izolare tenant, validare/input/uploaduri, sesiuni/antiabuz, criptare, audit, export/ștergere/retenție, minimizarea datelor AI și control uman. Nu folosi profilul didactic sau user_metadata ca privilegii. Nu publica secrete în output. O cheie expusă trebuie revocată/înlocuită; ștergerea fișierului nu este remediere suficientă. Testează cazurile negative și actualizează dovezile, fără a declara conformitate sau audit complet neexecutat.

## Publicare permanentă — instrucțiunea utilizatorului din 2026-10-08

Publică modificările finalizate și verificate în repository și pe site-ul existent, în fiecare sarcină, păstrând audiența și controalele de acces. Nu lăsa implicit doar local. Respectă cererile ulterioare explicite de lucru local și verificările/limitările reale; nu declara publicare fără confirmare. Platformele mobile se publică atunci când există aplicații și fluxuri de distribuție configurate.
