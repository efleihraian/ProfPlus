# Compilare locală ProfPlus pe Mac

P-250, 2026-11-13. Codul se păstrează în `~/dev/profplus`; artefactele sunt în `~/dev/profplus-builds`, excluse din repository. Expo rămâne gratuit. Nu se publică automat în magazine și nu se schimbă planurile/conturile de dezvoltator.

## Android

Mediul acestui Mac: Homebrew Android Command-line Tools, SDK Platform **37.0** (pachetul este `platforms;android-37.0`, nu `android-37`), Build Tools 37.0.0 și 36.0.0 (acesta din urmă cerut de unele module), NDK 27.1.12297006, CMake 3.22.1 și Java 21 deja instalat. SDK în `/opt/homebrew/share/android-commandlinetools`. Licențele SDK au fost acceptate la configurare. Versiunile provin din React Native 0.88.1 / Expo SDK 58 folosite de proiect; nu se actualizează SDK-ul Expo pentru a compila.

Configurare pe un Mac similar, dacă lipsesc instrumentele:

```bash
brew install --cask android-commandlinetools
export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
sdkmanager --licenses
sdkmanager 'platform-tools' 'platforms;android-37.0' 'build-tools;37.0.0' 'build-tools;36.0.0' 'ndk;27.1.12297006' 'cmake;3.22.1'
```

Build de test:

```bash
cd ~/dev/profplus
./mobile/scripts/build-android-local.sh "$HOME/dev/profplus-builds/ProfPlus-android-arm64.apk"
```

Scriptul alege Java 21 numai pentru procesul său (`PROFPLUS_JAVA_HOME` poate suprascrie alegerea), folosește profilul EAS preview și compilarea `--local`. Expo este contactat pentru configurația proiectului și semnarea Android existentă, fără compilare în cloud. Nu cumpără plan și nu consumă o compilare cloud. CLI-ul poate încărca și înregistra la Expo bundle-ul încorporat al aplicației (observat în P-250); aceasta nu este o comandă separată de publicare OTA. APK-ul este **ARM64**, pentru telefoane compatibile; nu este un AAB pentru Google Play. Se păstrează keystore-ul existent, astfel încât semnarea să nu fie schimbată arbitrar. Nu copia chei/parole în script, Git sau mesaje.

## iOS

Xcode, CocoaPods și un profil local valabil pentru `ro.profplus.app` sunt necesare. Scriptul folosește numai semnarea locală disponibilă, fără `-allowProvisioningUpdates`, fără reînnoire Apple Developer și fără încărcare în App Store Connect:

```bash
cd ~/dev/profplus
./mobile/scripts/build-ios-local.sh "$HOME/dev/profplus-builds/ios-local"
```

Rezultatele sunt o arhivă Xcode și un IPA de **dezvoltare**, pentru dispozitivele incluse în profil, nu pentru distribuție generală. La nevoie, `PROFPLUS_APPLE_TEAM_ID` selectează altă echipă locală autorizată. Lipsa unui profil/certificat valabil trebuie remediată înainte de semnare; scriptul nu cumpără și nu creează certificate automat. Apple login rămâne dezactivat.

Cererea explicită P-250 autorizează aceste compilări locale iOS, înlocuind pentru această sarcină pauza anterioară de build. Nu autorizează publicarea, reînnoirea contului sau activarea Apple login. Pentru magazine se vor pregăti separat AAB-ul Android și semnarea de distribuție iOS, la cererea titularului.

## Verificare și limite

Înainte de build: TypeScript mobil (`npx tsc --noEmit` din `mobile/`) și `npm audit`. Un build reușit nu este o probă de funcționare pe telefon și nu confirmă acceptarea în magazine.
