#!/bin/bash
set -euo pipefail
mobile_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$mobile_dir"
export JAVA_HOME="${PROFPLUS_JAVA_HOME:-$(/usr/libexec/java_home -v 21)}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
[ -d "$ANDROID_HOME/platforms" ] || { echo 'Lipsește Android SDK. Vezi docs/LOCAL_MOBILE_BUILDS.md.'; exit 1; }
# APK pentru telefoane Android ARM64; fără schimbarea profilului de distribuție în magazine.
export ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a
export GRADLE_OPTS="${GRADLE_OPTS:-} -Dorg.gradle.workers.max=2"
output="${1:-$HOME/dev/profplus-builds/ProfPlus-android-arm64.apk}"
mkdir -p "$(dirname "$output")"
npx --yes eas-cli@27.9.0 build --platform android --profile preview --local --non-interactive --output "$output"
