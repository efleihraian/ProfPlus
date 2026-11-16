# ProfPlus — aplicația mobilă

Aplicația Android și iOS pentru ProfPlus, făcută cu Expo și React Native. Folosește același cont și același server ca site-ul profplus.ro.

Aplicația e completă: asistentul virtual (Profi), documentele personale, clasele, contul (intrare, cont nou, profil didactic, bibliotecă personală, feedback, securitate) și setările.

## Pornire

1. Instalează pachetele:

   ```bash
   npm install
   ```

2. Copiază `.env.example` în `.env.local` și completează valorile.

3. Pornește aplicația:

   ```bash
   npx expo start
   ```

## Structură

- `src/app`: ecranele aplicației
- `src/components`: componentele reutilizabile
- `src/constants`: tema
- `src/hooks`: funcții comune pentru ecrane
- `src/lib`: contul (Supabase), legătura cu serverul ProfPlus, jurnalul de erori și tema
- `../web/shared`: cod comun cu site-ul

## Android pe Windows (emulator și APK)

Necesare: Node.js 22.13+ (LTS), JDK 21, Android Studio cu SDK Platform 37.0, Build Tools 37.0.0 și 36.0.0, Platform-Tools, Emulator, NDK 27.1.12297006, CMake 3.31.6 (din SDK Manager, „Show Package Details”) și o imagine de sistem x86_64 pentru emulator. Activează căile lungi în Windows și ține repository-ul într-o cale scurtă (de exemplu `C:\Users\<tu>\ProfPlus`).

Variabile de mediu (o singură dată, în PowerShell):

```powershell
setx JAVA_HOME "C:\Program Files\Microsoft\jdk-21.0.x-hotspot"
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
```

și adaugă în `Path`: `%ANDROID_HOME%\platform-tools` și `%ANDROID_HOME%\emulator`.

Rulare pe emulator (pornește întâi un AVD din Android Studio → Device Manager):

```bash
cd mobile
npm ci
cp .env.example .env.local   # completează EXPO_PUBLIC_API_URL=https://profplus.ro și cheile publice Supabase
npx expo run:android
```

APK de test (`mobile/android/` este generat de `expo prebuild` și ignorat de Git):

```powershell
cd mobile
powershell -ExecutionPolicy Bypass -File scripts\build-android-local.ps1          # release
powershell -ExecutionPolicy Bypass -File scripts\build-android-local.ps1 -Debug   # debug
```

Pe Mac/Linux există `scripts/build-android-local.sh` (EAS `--local`); detalii în [docs/LOCAL_MOBILE_BUILDS.md](../docs/LOCAL_MOBILE_BUILDS.md).

## Serverul

Aplicația folosește API-ul serverului ProfPlus publicat (`EXPO_PUBLIC_API_URL=https://profplus.ro`) și codul comun din `../web/shared`. Codul serverului nu face parte din acest repository.
