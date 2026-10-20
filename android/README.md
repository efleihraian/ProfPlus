# ProfPlus pentru Android

Aplicația Android ProfPlus, scrisă în **Kotlin** cu **Jetpack Compose**. Este o aplicație hibridă: ecranele care au nevoie de senzorii telefonului sunt native, iar restul funcțiilor (chat cu Plusi, bibliotecă, clase, documente, știri, meditații) vin din platforma web existentă, încărcată într-un `WebView`. Backend-ul rămâne același (Supabase + Cloudflare Workers), deci contul și datele se sincronizează cu versiunea web.

## Ce conține acum (v0.1.0)

| Zonă | Implementare | Fișier |
|---|---|---|
| **Plusi (web)** | `WebView` către platformă, cu sesiune păstrată între taburi, buton Înapoi, încărcare de documente (PDF, DOCX etc.) și linkuri externe deschise în browser | `ui/WebScreen.kt` |
| **Scanare (cameră)** | CameraX: previzualizare, fotografiere a unei pagini de manual sau a unui test, partajare prin `FileProvider`. Permisiunea se cere doar la intrarea în ecran | `ui/ScanScreen.kt` |
| **Blocare biometrică** | `BiometricPrompt` (amprentă / față / PIN). Aplicația se reblochează când trece în fundal; poate fi oprită din Setări | `Biometric.kt`, `ui/App.kt` |
| **Senzor de lumină** | Citirea luminii ambientale (lux) în Setări; baza pentru tema automată | `ui/SettingsScreen.kt` |
| **Navigație** | Bară de jos Material 3 cu trei taburi: Plusi, Scanează, Setări | `ui/App.kt` |

Senzorii respectă cerințele din [PRODUCT_REQUIREMENTS.md](../docs/PRODUCT_REQUIREMENTS.md): fiecare este folosit numai pentru funcția care îl cere, iar poza scanată rămâne în cache-ul aplicației până când utilizatorul o partajează.

## Cum se rulează

1. Instalează **Android Studio** (Ladybug sau mai nou) cu **JDK 17**.
2. `File → Open` și alege folderul `android/` din acest repo.
3. Așteaptă sincronizarea Gradle (Android Studio descarcă Gradle 8.9 din `gradle-wrapper.properties`).
4. Alege un emulator sau un telefon cu Android 8.0+ (API 26) și apasă **Run**.

Adresa platformei se schimbă în `app/build.gradle.kts`, la `WEB_URL`.

Pe emulator, pentru biometrie: `Settings → Security` pentru a seta un PIN sau o amprentă. Camera funcționează cu camera virtuală a emulatorului.

## Structură

```
android/
├── app/src/main/
│   ├── java/ro/profplus/app/
│   │   ├── MainActivity.kt
│   │   ├── Biometric.kt
│   │   └── ui/ (App, WebScreen, ScanScreen, SettingsScreen, Theme)
│   ├── res/
│   └── AndroidManifest.xml
├── app/build.gradle.kts
└── settings.gradle.kts
```

## Limitări cunoscute

- Autentificarea **Google** este blocată de Google în `WebView` (politica „disallowed_useragent”). Soluția planificată este autentificarea prin Chrome Custom Tabs, cu întoarcerea în aplicație printr-un deep link.
- Poza scanată se partajează manual; trimiterea directă către OCR și biblioteca personală necesită un endpoint de upload autentificat, încă neimplementat.
- Proiectul nu include `gradlew` / `gradle-wrapper.jar`; Android Studio le gestionează la prima sincronizare.

## Pașii următori

- Ecrane native Compose pentru Chat, Bibliotecă și Știri, folosind API-urile `/api/chat`, `/api/library` și `/api/news`.
- Autentificare prin Custom Tabs și stocarea sesiunii în `EncryptedSharedPreferences`.
- Upload al pozelor către OCR și biblioteca personală.
- Dictare vocală (`SpeechRecognizer`) și temă automată în funcție de senzorul de lumină.
- Localitate aproximativă (opțională) pentru anunțurile de meditații.
