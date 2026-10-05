# Reguli de lucru

## La fiecare sarcină

1. Alege sau adaugă un ID în BACKLOG.md și marchează starea.
2. Implementează schimbarea și verifică comportamentul relevant.
3. Notează rezultatul și verificările în docs/WORKLOG.md.
4. Actualizează BACKLOG.md, STATUS.md și secțiunea nelansată din CHANGELOG.md.
5. Înregistrează deciziile importante în docs/DECISIONS.md.

## La fiecare versiune

- Actualizează VERSION și versiunea din README.md și STATUS.md.
- Actualizează data, ce este finalizat, blocajele și următorul pas din STATUS.md.
- Mută schimbările nelansate într-o secțiune datată în CHANGELOG.md.
- Creează un commit și un tag vX.Y.Z după verificare.

Fișierele se actualizează ca parte a lucrului; nu există încă automatizare care să deducă progresul.

## Finalizarea unei sarcini

O sarcină este DONE când îndeplinește criteriul din backlog, verificările au trecut și documentația reflectă rezultatul. Nu marca drept testat ce nu a fost executat.

Nu încărca chei API, .env, documente private sau date ale utilizatorilor în Git. Fișierele sincronizate din sources/ ale proiectului ChatGPT sunt referințe read-only și nu se modifică.

## Website și aplicații mobile

Aplică [cerințele permanente de produs](docs/PRODUCT_REQUIREMENTS.md) pe web, Android și iOS. În jurnal consemnează cerințele afectate și verificările executate; urmărește separat lucrările de implementare. Nu colecta date suplimentare, nu adăuga trackere sau SDK-uri fără evaluarea scopului și a datelor transmise. Folosește informațiile reale ale firmei și condițiile comerciale confirmate pentru politicile destinate utilizatorilor.

## Verificare de securitate

Respectă [regulile permanente](docs/SECURITY_REQUIREMENTS.md). Înainte de commit/livrare rulează `python3 scripts/security_scan.py --history --client` după build și auditul dependențelor. Scannerul nu afișează valori și nu înlocuiește auditul complet. Investighează alertele înainte de a publica; pentru secrete expuse aplică revocare/rotație. Pentru dependențe păstrează raportul și remediază/testează actualizările; nu ascunde alertele prin exceptări generale. CI verifică automat aceste controale; starea incompletă rămâne în SECURITY_REVIEW și backlog.
