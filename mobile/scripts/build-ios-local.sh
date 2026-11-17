#!/bin/bash
set -euo pipefail
mobile_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$mobile_dir"
output="${1:-$HOME/dev/profplus-builds/ios-local}"
mkdir -p "$output"
team="${PROFPLUS_APPLE_TEAM_ID:-$(python3 - <<'PY'
import datetime,plistlib,subprocess
from pathlib import Path
for p in (Path.home()/'Library/Developer/Xcode/UserData/Provisioning Profiles').glob('*.mobileprovision'):
 d=plistlib.loads(subprocess.check_output(['security','cms','-D','-i',str(p)],stderr=subprocess.DEVNULL))
 if d.get('Entitlements',{}).get('application-identifier','').endswith('.ro.profplus.app') and d['ExpirationDate']>datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None):
  print(d['TeamIdentifier'][0]);break
else:raise SystemExit('Lipsește un profil iOS local valabil pentru ProfPlus.')
PY
)}"
npx expo prebuild --platform ios --no-install
pod install --project-directory=ios
xcodebuild -workspace ios/ProfPlus.xcworkspace -scheme ProfPlus -configuration Release -destination 'generic/platform=iOS' -archivePath "$output/ProfPlus.xcarchive" -derivedDataPath "$HOME/Library/Developer/Xcode/DerivedData/ProfPlus-local" -jobs 2 DEVELOPMENT_TEAM="$team" CODE_SIGN_STYLE=Automatic archive
python3 - "$output/ExportOptions.plist" "$team" <<'PY'
import plistlib,sys
with open(sys.argv[1],'wb') as f:plistlib.dump({'method':'debugging','teamID':sys.argv[2],'signingStyle':'automatic'},f)
PY
xcodebuild -exportArchive -archivePath "$output/ProfPlus.xcarchive" -exportPath "$output/export" -exportOptionsPlist "$output/ExportOptions.plist"
