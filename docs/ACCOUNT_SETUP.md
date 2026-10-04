# Conturi ProfOS: Supabase Auth + Resend

## Ce funcționează acum și ce așteaptă configurarea

Secțiunea `/account` oferă profilul actual, acces la conectare/securitate, temă luminos/întunecat/sistem, memorarea sau resetarea preferințelor locale și informații despre cookie-uri/stocare. Pilotul Sites folosește în continuare identitatea ChatGPT verificată de platformă.

Integrarea Supabase este pregătită în cod: e-mail/parolă, înregistrare cu confirmare, retrimitere confirmare, recuperare și schimbare parolă, Google/Apple prin OAuth PKCE, schimbare nume/e-mail și deconectare locală/globală. Butoanele neconfigurate sunt dezactivate și explicate. Nu s-a creat niciun cont extern și nu s-au trimis e-mailuri reale în această implementare.

Supabase gestionează identitatea și parolele. Resend livrează e-mailurile Auth prin SMTP și poate fi folosit ulterior prin API pentru alte mesaje tranzacționale sau marketing, cu preferințe și dezabonare. E-mailul verificat este suficient pentru prima versiune; telefonul nu se colectează acum.

## 1. Pregătește domeniul și găzduirea

Alege un domeniu pe care îl controlezi. Site-ul actual `*.chatgpt.site` are acces privat prin ChatGPT; adăugarea Supabase nu elimină acel filtru de acces. Pentru login independent destinat publicului, pregătește o găzduire care permite autentificarea proprie (de exemplu Cloudflare Workers, cu păstrarea bindingurilor D1/R2) și domeniul ProfOS. Confirmă suportul platformei înainte de schimbarea autentificării. Nu publica pilotul și nu schimba automat audiența.

Datele existente sunt deținute de identificatori Sites; cele noi vor folosi `supabase:<uuid>`. Nu transfera date doar pe baza unei adrese de e-mail. Migrarea se planifică separat și cere dovada deținerii ambelor identități. Activarea Supabase fără migrare nu mută automat conversațiile vechi.

## 2. Creează proiectul Supabase

- Creează un proiect și alege regiunea potrivită utilizatorilor și cerințelor de date.
- Din Connect/Settings, preia URL-ul proiectului și cheia **publishable**. Nu folosi cheia service role pentru login.
- În Authentication, activează e-mail/parolă și **Confirm email**. Păstrează confirmarea schimbării e-mailului pe ambele adrese și configurează politica de parole.
- Configurează Site URL cu originea finală și adaugă explicit `<APP_ORIGIN>/auth/callback` la redirect URLs. Nu folosi wildcard în producție.
- Configurează rate limits, protecție împotriva abuzului și verificările necesare înainte de înregistrarea publică. CAPTCHA, dacă este activat în Supabase, trebuie integrat și în formularele ProfOS înainte de deschidere; câmpul CAPTCHA nu este implementat în acest pas.

## 3. Configurează Resend

- Creează contul, adaugă domeniul/subdomeniul de trimitere și publică în DNS înregistrările de verificare cerute de Resend. Folosește un subdomeniu dedicat, de exemplu `mail.<domeniul-tău>`.
- Așteaptă verificarea domeniului. Creează o cheie de trimitere cu permisiuni potrivite.
- Leagă Resend din integrarea Supabase sau configurează Custom SMTP după valorile actuale din Resend. Configurează numele ProfOS și o adresă de expeditor din domeniul verificat.
- Păstrează cheia în configurarea SMTP/secret manager; nu o introduce în chat, Git sau în pagina web. Pentru e-mailuri viitoare prin API va exista un secret server separat `RESEND_API_KEY`, când funcția respectivă este implementată.

## 4. Șabloane de e-mail

Pentru fluxul server-side, linkurile folosesc token hash, nu fragmentul URL cu tokenuri. Configurează șabloanele Supabase astfel:

- Confirmare înregistrare: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
- Recuperare parolă: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`
- Schimbare e-mail: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change`

Nu include tokenuri în loguri. Callbackul consumă linkul și redirecționează spre un URL curat. E-mailurile trebuie testate real, inclusiv expirare, link deja folosit și adrese externe echipei Supabase.

## 5. Google

În Google Cloud, configurează brandingul/consimțământul OAuth și un client Web. Introdu callbackul afișat de Supabase în lista exactă de redirect URI Google. Copiază Client ID și Client Secret în providerul Google din Supabase. Folosește numai permisiunile de identitate necesare. Testează login și contul rezultat înainte de a activa `AUTH_GOOGLE_ENABLED=true`.

## 6. Apple

Este necesar contul Apple Developer și configurarea Sign in with Apple pentru aplicație și web (App ID, Services ID, domeniu/return URL, cheie). Urmează valorile și pașii actuali din documentația Apple/Supabase. Configurează providerul Apple în Supabase și rotația secretului când este necesară. Testează inclusiv Hide My Email; nu asocia automat conturi pe baza numelui sau e-mailului de relay. Activează `AUTH_APPLE_ENABLED=true` numai după test.

## 7. Configurarea serverului

Nume de variabile, fără valori reale:

```
AUTH_PROVIDER=supabase
SUPABASE_URL=<URL proiect>
SUPABASE_PUBLISHABLE_KEY=<publishable key>
APP_ORIGIN=https://<domeniul final>
AUTH_GOOGLE_ENABLED=false
AUTH_APPLE_ENABLED=false
AUTH_REGISTRATION_ENABLED=false
```

Implicit, lipsa `AUTH_PROVIDER=supabase` păstrează Sites. În modul Supabase neconfigurat, rutele private refuză accesul; nu revin la identitatea Sites. Cookie-urile de sesiune sunt HttpOnly, SameSite=Lax și Secure în producție. Serverul verifică utilizatorul la Supabase și cere confirmarea e-mailului. Nu are încredere doar în conținutul cookie-ului.

Înainte de `AUTH_REGISTRATION_ENABLED=true`: e-mailuri reale, redirecturi, sesiuni/refresh, logout, Google, Apple, izolare între conturi, limitare abuz, politicile și informațiile operatorului, planul migrării și recuperarea datelor trebuie verificate. Nu există consimțământ implicit de marketing.

## Android și iOS

Același proiect Supabase poate susține identitatea în aplicațiile mobile. Loginul nativ, deep links/universal links, callbackurile, stocarea sigură a tokenurilor și configurările magazinelor se implementează și testează în aplicații; codul web de aici nu le implementează automat. Autorizarea datelor rămâne pe server.

## Documentație oficială

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/social-login/auth-apple
- https://resend.com/docs/send-with-supabase-smtp
- https://supabase.com/partners/resend

## Verificările acestei versiuni

TypeScript și build; verificare UI desktop și mobil 390px (inclusiv memorare opțională a temei). API-urile Sites au fost verificate cu identități locale sintetice. Testul `cd web && npm run test:account`, după build, pornește un furnizor Auth simulat și un Worker local pe porturile 3098/3099; salvează/restaurează configurația locală temporară și nu folosește chei reale. Verifică contractele de login, verificare e-mail, recuperare, cookie-uri, PKCE și respingerea sesiunilor falsificate. Nu verifică livrarea SMTP, loginul real Google/Apple, rotația/refresh-ul real al sesiunilor sau aplicațiile native.

Inventar introdus: Supabase primește e-mailul, parola și numele opțional pentru autentificare; Resend primește destinatarii și conținutul e-mailurilor de cont. SDK-urile Supabase rulează pe server în această versiune, fără cheie service role. API-ul Resend pentru alte e-mailuri nu este încă implementat. Fluxurile sunt inactive în pilot; înainte de activare se finalizează politicile, retenția, contractele/regionarea și inventarul terților.

## Condiția GDPR/DPIA pentru activare

Înainte de lansarea generală și activarea providerilor/înregistrării, închide condițiile din [DPIA și registrul de riscuri](DPIA.md), inclusiv operatorul, temeiurile, politicile reale, contractele/transferurile, retenția și ștergerea. Flagurile de configurare controlează activarea tehnică; nu certifică de unele singure conformitatea.
