# Configurare conturi ProfOS — Google și Apple

Actualizat: 2026-10-04 · 0.9.1. Decizia utilizatorului: acum Google/Apple; e-mail/parolă și Resend după cumpărarea domeniului. Nu au fost configurate conturile externe prin această schimbare. Butoanele rămân inactive până la configurare.

## 1. Alegerea adresei aplicației

Pilotul actual `https://profos-chat.cosminsoames.chatgpt.site` este privat și are filtrul de autentificare ChatGPT al Sites. Configurarea Supabase nu înlătură acest filtru. Pentru acces numai prin Google/Apple pregătim o găzduire cu autentificare proprie. Pentru probe se poate folosi localhost sau o adresă temporară HTTPS, de exemplu [Cloudflare workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/); domeniul propriu se adaugă ulterior. Nu s-a efectuat migrarea găzduirii sau a datelor.

În exemplele de mai jos:

- `APP_ORIGIN` este adresa aplicației fără slash final; pentru probe locale `http://localhost:3000`, pentru test online adresa HTTPS efectiv creată.
- `PROJECT_REF` este identificatorul real al proiectului Supabase. Nu introduce literal placeholderul în configurări.

| Unde completezi | Valoare |
|---|---|
| Supabase → Site URL | `APP_ORIGIN` |
| Supabase → Redirect URLs | `APP_ORIGIN/auth/callback` |
| Google → Authorized JavaScript origins | `APP_ORIGIN` |
| Google → Authorized redirect URIs | `https://PROJECT_REF.supabase.co/auth/v1/callback` |
| Apple Services ID → Domains and Subdomains | `PROJECT_REF.supabase.co` |
| Apple Services ID → Return URLs | `https://PROJECT_REF.supabase.co/auth/v1/callback` |

Copiază callbackul afișat de Supabase în configurarea providerului; dacă proiectul folosește un domeniu Auth particularizat, valorile se schimbă corespunzător. Fără wildcard pentru adresa de producție.

## 2. Supabase

1. În dashboard creează proiectul **ProfOS** în organizația ta; alege o regiune UE potrivită și salvează parola bazei într-un manager de parole.
2. Păstrează URL-ul proiectului și cheia **publishable** din Connect/Settings → API Keys. Aplicația folosește această cheie; nu are nevoie de service role pentru login.
3. În Authentication → Sign In / Providers: dezactivează **Email**, Phone și Anonymous; pregătește doar Google și Apple.
4. Pentru crearea contului la prima conectare OAuth, **Allow new users to sign up** trebuie permis în mediul de test controlat. Dezactivarea lui globală blochează și utilizatorii OAuth noi. La lansare respectă condițiile DPIA.
5. În URL Configuration setează valorile din tabel. La mutarea de pe localhost actualizăm împreună adresele și `APP_ORIGIN`.
6. Nu configura SMTP/Resend acum. Numele poate fi completat opțional în ProfOS, inclusiv dacă Apple nu îl furnizează.

[Configurarea Supabase Auth](https://supabase.com/docs/guides/auth/general-configuration). Supabase se ocupă de identitate; conversațiile/documentele existente rămân în D1/R2 și indexurile AI, până la o decizie separată de migrare.

## 3. Google Cloud

1. Selectează/creează proiectul **ProfOS**, apoi Google Auth Platform.
2. Branding: numele ProfOS; suport și contact dezvoltator `ajutor.profplus@gmail.com`.
3. Audience: **External**, inițial **Testing**; adaugă conturile echipei în Test users.
4. Data Access: numai `openid`, `userinfo.email`, `userinfo.profile`.
5. Clients → Create client → **Web application**; nume **ProfOS Web**. Completează origin și redirect URI din tabel.
6. Salvează Client ID și Client Secret în Supabase → Google și activează providerul. Testează înainte de activarea generală. Brandingul public și politicile trebuie finalizate înainte de lansare.

[Ghid Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [configurarea OAuth Google](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred).

## 4. Apple Developer

Verifică înscrierea activă în **Apple Developer Program**, nu doar existența unui Apple Account. [Detalii Apple](https://developer.apple.com/help/account/membership/program-enrollment/).

1. Certificates, Identifiers & Profiles → Identifiers: creează/alege App ID pentru viitoarea aplicație ProfOS și activează Sign in with Apple ca Primary App ID.
2. Creează **Services ID** pentru web, activează Sign in with Apple, asociază Primary App ID și completează domeniul/Return URL din tabel. Identificatorii trebuie aleși stabil pentru proiect; `ro.profos.app` și `ro.profos.web` sunt doar exemple de structură, nu identificatori înregistrați.
3. Keys → creează o cheie Sign in with Apple asociată aplicației. Salvează în siguranță fișierul `.p8`, Key ID și Team ID.
4. Generează client secret-ul Apple semnat, folosind generatorul din ghidul Supabase, și introdu-l în Supabase → Apple. Client ID pentru web este **Services ID**. Dacă există mai multe Client IDs, Services ID este primul.
5. Notează expirarea secretului și reînnoiește-l înainte de expirare, cel târziu la 6 luni. Testează și **Hide My Email**. Trimiterea ulterioară către adresele relay va necesita configurarea surselor de e-mail Apple.

[Configurarea web Apple](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/), [integrarea și generatorul Supabase Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple). Cheia `.p8` și client secret-urile se păstrează în managerul de secrete/configurarea furnizorului, niciodată în Git sau în chat.

## 5. Conectarea aplicației

După configurarea providerilor, dezvoltatorul configurează în găzduirea independentă valorile de mai jos. Nu activa Supabase în pilotul Sites pentru a încerca ocolirea autentificării platformei.

```dotenv
AUTH_PROVIDER=supabase
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable key>
APP_ORIGIN=<adresa exactă a aplicației>
AUTH_GOOGLE_ENABLED=true
AUTH_APPLE_ENABLED=true
AUTH_EMAIL_ENABLED=false
AUTH_REGISTRATION_ENABLED=false
```

Flagul ProfOS `AUTH_REGISTRATION_ENABLED` controlează numai formularul viitor de înregistrare prin e-mail; nu este setarea globală Supabase pentru utilizatori noi. `AUTH_EMAIL_ENABLED=false` blochează login/register/forgot/resend/parolă/schimbare e-mail și callbackurile cu token hash pe server. Providerul Email trebuie dezactivat și în Supabase, deoarece API-ul Supabase există separat de aplicație.

Identitatea se verifică prin getUser; cookie-urile sunt HttpOnly, SameSite=Lax, Secure pe HTTPS. Identitățile noi sunt `supabase:<uuid>`; datele Sites nu sunt asociate automat după e-mail. Înainte de mutarea conversațiilor trebuie confirmată deținerea ambelor identități. Conturile Google/Apple cu e-mailuri diferite, inclusiv relay Apple, nu trebuie presupuse identice; verificăm comportamentul real de asociere în Supabase.

Pentru probe reale: login cu ambii provideri, prima creare, logout/relogin, sesiune expirată/refresh, callback refuzat, două conturi fără acces reciproc la date, Hide My Email și fluxuri de ștergere/revocare. Testele actuale cu Auth simulat confirmă comportamentul codului, nu configurarea externă.

## 6. E-mail și Resend — etapă ulterioară

După domeniu: verificare DNS Resend, expeditor propriu, SMTP Supabase, provider Email și Confirm Email, template-uri și verificări reale. Apoi activăm `AUTH_EMAIL_ENABLED=true` și `AUTH_REGISTRATION_ENABLED=true`.

Linkuri de template:
- Confirmare: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
- Recuperare: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`
- Schimbare adresă: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change`

[Ghid Resend/Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp). Mesajele de marketing și API-ul Resend pentru alte comunicări se tratează separat, cu scopuri/preferințe/dezabonare unde se aplică.

## 7. GDPR/DPIA și aplicații mobile

Condițiile din [DPIA](DPIA.md) se aplică și loginului social: informarea despre e-mail/ID/nume și furnizori, roluri și contracte, retenție, ștergere și securitate. Nu cerem acces Google Drive, Gmail, contacte sau telefon pentru login. Alegerea regiunii UE nu certifică singură conformitatea tuturor serviciilor.

Aplicațiile iOS/Android vor necesita configurări native, callbackuri/deep links, identificatori și stocarea sigură a tokenurilor. Păstrăm același proiect Supabase pentru identitate; integrarea web nu reprezintă implementarea loginului nativ.
