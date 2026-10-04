# Verificarea configurației externe ProfPlus

2026-10-04 · revizie 0.9.2. Inspecție în dashboardurile autentificate Supabase și Apple Developer; fără publicarea secretelor sau modificarea metodelor de autentificare. Această verificare nu este un test live OAuth și nu certifică GDPR/DPIA.

## Supabase

| Element | Observație | Concluzie / pas rămas |
|---|---|---|
| Organizație / proiect | ProfPlus / ProfPlus | Există |
| Regiune | eu-west-1, UE | Potrivită pentru localizarea bazei; contractele, logurile și transferurile necesită evaluare separată |
| GitHub | ProfOS-Edu/ProfPlus după redenumire | Repository corect, legătura se păstrează |
| Git deploy | Production branch main; deploy to production activ; directorul inițial . | Repository-ul nu conține încă director supabase/ și migrații Supabase. Legătura nu publică website-ul și nu migrează D1/R2 |
| Branching | Automatic branching dezactivat; indisponibil pe planul Free din interfață | Nu este necesar pentru primul login; nu se activează abonament cu plată |
| Utilizatori noi | Allow new users to sign up activ | Necesare pentru prima creare OAuth; accesul general nu este încă pregătit |
| Anonim / telefon | Dezactivate | Aliniate cu etapa Google/Apple |
| Confirm email | Activ | Se păstrează; nu înlocuiește configurarea providerilor |
| Email | Activ | De dezactivat pentru etapa exclusiv Google/Apple; flagul aplicației nu dezactivează API-ul Supabase |
| Google / Apple | Ambele dezactivate | Configurare client OAuth și apoi activare controlată |
| Site URL | http://localhost:3000 | Corect numai pentru dezvoltare locală |
| Redirect URLs | http://localhost:3000/auth/callback | Corect pentru aplicația locală pe port 3000; adresa HTTPS de test trebuie adăugată când există |

Callbackul standard al acestui proiect, conform formei documentate de Supabase, este `https://dgozbrdvmmtwhfrefjln.supabase.co/auth/v1/callback`; domeniul Apple corespunzător este `dgozbrdvmmtwhfrefjln.supabase.co`. La configurarea providerului se copiază valoarea efectiv afișată în dashboard, mai ales dacă se introduce un domeniu Auth particularizat.

Limite Auth inspectate: login/înregistrare 30 cereri/5 minute/IP, refresh 150/5 minute/IP, verificări token 30/5 minute/IP; IP address forwarding dezactivat. Valorile nu au fost modificate și nu sunt probe ale eficienței antiabuz în aplicația reală.

## Apple Developer

- Apple Developer Program activ; portalul afișează reînnoirea la **24 octombrie 2026**. Reînnoirea este o acțiune a titularului.
- Numele App ID a fost uniformizat din „Prof Plus” în „ProfPlus”, cu salvare confirmată în lista Apple; Bundle ID și capabilitățile au rămas identice.
- App ID ProfPlus existent, Bundle ID `profplus.ro`. Capacitatea **Sign In with Apple nu este bifată**; configurarea Primary App ID pentru acest proiect nu este finalizată.
- Lista Services IDs nu conține ProfPlus. Există un Services ID al altui proiect, care nu se modifică/reutilizează implicit.
- Lista Keys nu conține o cheie dedicată ProfPlus; există o cheie a altui proiect. Nu a fost citită cheia privată.
- De completat: capacitatea Sign In with Apple/Primary App ID, Services ID web asociat, domeniu și Return URL Supabase, cheie dedicată și secret semnat introdus în Supabase. Se notează expirarea secretului și se verifică Hide My Email.

## Ordinea recomandată

1. Stabilim adresa HTTPS a mediului de test cu autentificare proprie; pilotul Sites păstrează filtrul ChatGPT.
2. Configurăm Google Auth Platform (numai openid, e-mail și profil); Google Cloud nu a fost inspectat în această sesiune.
3. Finalizăm identificatorii și cheia Apple pentru ProfPlus, separat de celelalte aplicații.
4. Configurăm URL-urile și providerii în Supabase; dezactivăm Email pentru etapa actuală. Păstrăm telefonul și autentificarea anonimă dezactivate.
5. Conectăm configurația aplicației în mediul de test și verificăm login/logout/refresh, prima creare, Apple relay și izolarea datelor între două conturi.
6. Documentăm operatorul, politicile, contractele, retenția și finalizăm evaluarea DPIA înainte de lansarea generală. Resend rămâne amânat până la domeniu.

Referințe oficiale: [GitHub integration](https://supabase.com/docs/guides/deployment/branching/github-integration), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Apple OAuth](https://supabase.com/docs/guides/auth/social-login/auth-apple), [Apple web configuration](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/). Instrucțiunile complete rămân în [ACCOUNT_SETUP.md](ACCOUNT_SETUP.md).
