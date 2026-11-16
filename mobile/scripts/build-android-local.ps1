# Build Android local pe Windows: APK de test (release, semnat cu cheia de debug generată de Expo).
# `eas build --local` nu merge pe Windows, așa că folosim `expo prebuild` + Gradle direct.
# Utilizare (din mobile/):  powershell -ExecutionPolicy Bypass -File scripts\build-android-local.ps1 [-Debug]
param([switch]$Debug)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
if (-not (Test-Path (Join-Path $env:ANDROID_HOME 'platforms'))) { throw "Lipsește Android SDK în $env:ANDROID_HOME. Vezi mobile/README.md." }

if (-not $env:JAVA_HOME) {
  $jdk = Get-ChildItem 'C:\Program Files\Microsoft', 'C:\Program Files\Eclipse Adoptium' -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $jdk) { throw 'Lipsește JDK 21. Instalează-l (winget install Microsoft.OpenJDK.21) sau setează JAVA_HOME.' }
  $env:JAVA_HOME = $jdk.FullName
}
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

if (-not (Test-Path 'node_modules')) { npm ci }
if (-not (Test-Path '.env.local')) { Write-Warning 'Lipsește mobile/.env.local (copiază .env.example și completează valorile).' }

npx expo prebuild --platform android --no-install
if ($LASTEXITCODE) { exit $LASTEXITCODE }

Push-Location android
try {
  $task = if ($Debug) { 'assembleDebug' } else { 'assembleRelease' }
  .\gradlew.bat $task "-PreactNativeArchitectures=arm64-v8a,x86_64" "-Dorg.gradle.workers.max=2"
  if ($LASTEXITCODE) { exit $LASTEXITCODE }
} finally { Pop-Location }

$variant = if ($Debug) { 'debug' } else { 'release' }
Write-Host "APK: android\app\build\outputs\apk\$variant\app-$variant.apk"
