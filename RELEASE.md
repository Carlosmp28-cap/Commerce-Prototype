# Releases

This repo uses a three-branch promotion flow:

`feature/*` → `dev` → `staging` → `main`

A **release** is a _tag_ on `main` (e.g. `v1.0.0`). Creating/pushing the tag triggers the GitHub Actions workflow in `.github/workflows/release.yml`.

This release workflow produces **three downloadable artifacts** attached to the GitHub Release:

- `web-dist.tgz` (frontend web export)
- `backend-publish.tgz` (ASP.NET publish output)
- `android-project.tgz` (Android project you can open in Android Studio or build from terminal)

The sections below explain how to run each of them locally, step-by-step.

## Practical release checklist

### 1) Freeze `staging`

- Stop merging new features into `staging`.
- Only allow fixes needed to ship.

### 2) Ensure CI green on `dev` → merge to `staging`

- Open PR: `dev` → `staging`
- Wait for CI to pass.
- Merge when green.

### 3) Smoke test on `staging`

**Web (recommended):**

- Run locally:
  - `npm --prefix CommercePrototype ci`
  - `npm --prefix CommercePrototype run web:preview`
- Manually click through the critical flows (Home → PLP → PDP → Cart → Checkout).

Notes (important):

- The exported web build is a single-page app. If you serve `dist/` without SPA fallback, refreshing a deep link like `/pdp/sku-new-006` will return `404`.
- The `web:serve` script uses `serve -s` to always fall back to `index.html` so refresh works.

**Mobile QA (requires EAS setup):**

- If you use EAS builds, start a preview build from `staging` and validate on devices.

### 4) Merge `staging` → `main`

- Open PR: `staging` → `main`
- Wait for CI.
- Merge.

### 5) Tag `vX.Y.Z` on `main`

From your machine:

```bash
git checkout main
git pull origin main

git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

### 6) Run release workflow from tag

- GitHub → Actions → **Release**
- You should see a run for the tag you pushed.
- The workflow:
  - runs lint/typecheck/tests
  - exports the web build (`CommercePrototype/dist`)
  - publishes the backend (`CommercePrototype-Backend/publish`)
  - exports an Android Studio-ready Android project via `expo prebuild` and packages the full Expo project (JS entrypoints + `assets/` + generated `android/`) into `android-project.tgz`
  - attaches `web-dist.tgz`, `backend-publish.tgz`, and `android-project.tgz` to the GitHub Release

### 7) Monitor + rollback plan

- Monitor:
  - GitHub Actions run logs
  - your hosting logs/analytics
  - crash/error reporting (if configured)

**Rollback (web):** redeploy the previous release tag artifact.

**Rollback (mobile):** typically ship a new patch release (`vX.Y.(Z+1)`), or use EAS Update if you’ve configured it.

## Mobile releases (Expo / EAS) — required setup

This repo currently does not include `eas.json` or EAS project metadata in `app.json`, so the workflow does **not** build iOS/Android yet.

To enable mobile builds/releases:

1. Install EAS CLI:
   - `npm install -g eas-cli`
2. Initialize EAS (from `CommercePrototype/`):
   - `eas init`
3. Create `eas.json` with build profiles (preview/production).
4. Add a GitHub secret named `EXPO_TOKEN` (Expo access token).
5. Extend `.github/workflows/release.yml` with an EAS job.

Once you want that, we can wire it up end-to-end (build preview builds on `staging`, production builds on tags).

---

# Running a GitHub Release locally

## Prerequisites

### Frontend (web + Expo)

- Node.js + npm
  - Recommended: Node.js 20 (LTS)

### Backend

- .NET 8 runtime (`dotnet`)

### Android

- Android Studio (recommended)
- Android SDK Platform Tools (for `adb`)

If `adb` is not recognized in PowerShell, add Platform Tools to PATH:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
where adb
adb version
```

## 1) Download the artifacts

- GitHub → Releases → pick your release tag → download:
  - `web-dist.tgz`
  - `backend-publish.tgz`
  - `android-project.tgz`

Choose a short working folder (Windows tip: avoid OneDrive folders and long paths for Android builds):

```powershell
mkdir C:\Users\<user>\dev -ErrorAction SilentlyContinue
cd C:\Users\<user>\dev
```

## 2) Run the backend (from `backend-publish.tgz`)

### 2.1 Extract

```powershell
cd C:\Users\<user>\dev
mkdir backend -ErrorAction SilentlyContinue
tar -xzf .\backend-publish.tgz -C .\backend
```

You should now have:

- `C:\Users\<user>\dev\backend\publish\` (contains one main `*.dll`)

### 2.2 SFCC configuration (required)

The backend validates SFCC settings on startup. For a release build, the workflow writes an `appsettings.Production.json` into `publish/` using GitHub secrets.

If your release was built without SFCC secrets configured (or you’re running a published backend that does **not** include `appsettings.Production.json`), you can supply the values as environment variables:

```powershell
$env:Sfcc__ApiBaseUrl = "https://your-instance.demandware.net"
$env:Sfcc__ClientId = "your-client-id"
# optional:
$env:Sfcc__ApiVersion = "v20_4"
$env:Sfcc__InstanceName = "your-instance"
$env:Sfcc__OAuthTokenUrl = "https://account.demandware.com/dw/oauth2/access_token"
```

### 2.3 Start the backend

```powershell
cd C:\Users\<user>\dev\backend\publish
dir *.dll

# Replace with the dll you see in the folder
dotnet .\CommercePrototype-Backend.dll --urls "http://0.0.0.0:5035"
```

Health check:

```powershell
curl http://localhost:5035/health
```

## 3) Run the frontend web build (from `web-dist.tgz`)

### 3.1 Extract

```powershell
cd C:\Users\<user>\dev
mkdir web -ErrorAction SilentlyContinue
tar -xzf .\web-dist.tgz -C .\web
```

You should now have:

- `C:\Users\<user>\dev\web\dist\`

### 3.2 Serve the SPA correctly

The exported web build is a single-page app (SPA). You must serve it with an SPA fallback (so deep links don’t 404 on refresh).

```powershell
cd C:\Users\<user>\dev\web
npx serve -s dist -l 8080
```

Open:

- `http://localhost:8080`

If you see a blank page, open the browser console.

## 4) Run Android (from `android-project.tgz`)

### 4.1 Extract to a short path

```powershell
cd C:\Users\<user>\dev
mkdir android-project -ErrorAction SilentlyContinue
tar -xzf .\android-project.tgz -C .\android-project
```

You should now have:

- `C:\Users\<user>\dev\android-project\android\`
- `C:\Users\<user>\dev\android-project\package.json`

Important: the `android-project.tgz` archive is intentionally **flattened**. Run Expo/Metro from `C:\Users\<user>\dev\android-project`.

Important: Android builds are sensitive to long paths and file syncing. Avoid extracting/building under OneDrive.

### Option A — Build an APK and install it

1. Install JS dependencies (required for Expo autolinking)

```powershell
cd C:\Users\<user>\dev\android-project
npm ci
```

2. Build the debug APK

```powershell
cd C:\Users\<user>\dev\android-project\android
.\gradlew.bat :app:assembleDebug --stacktrace
```

3. Find the APK

```powershell
Get-ChildItem -Recurse -Path .\app\build\outputs -Filter *.apk | Select-Object FullName
```

Typical location:

- `android\app\build\outputs\apk\debug\app-debug.apk`

4. Install to a running emulator/device

```powershell
adb devices
adb install -r .\app\build\outputs\apk\debug\app-debug.apk
```

### SDK location error ("SDK location not found") — quick fix

If Gradle fails with "SDK location not found" or asks for `local.properties`, create `android/local.properties` pointing to your Android SDK. Prefer this over permanently modifying user environment variables.

1. Detect a likely SDK path and write `local.properties` (run from the extracted `android-project` folder):

```powershell
# from C:\Users\<user>\dev\android-project
$sdkCandidates = @(
  "$env:LOCALAPPDATA\Android\Sdk",
  "$env:USERPROFILE\AppData\Local\Android\Sdk",
  "C:\Program Files\Android\Android Studio\sdk",
  "C:\Program Files (x86)\Android\android-sdk"
)
$sdk = $sdkCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $sdk) { Write-Error 'Android SDK not found. Install Android Studio or SDK; or set SDK path manually.'; exit 1 }
Write-Host "Found SDK at: $sdk"
$localProps = Join-Path $PWD 'android\local.properties'
"sdk.dir=$($sdk -replace '\\','/')" | Out-File -FilePath $localProps -Encoding ASCII
Write-Host "Wrote $localProps -> sdk.dir=$sdk"
```

2. Add `platform-tools` to your current shell PATH (temporary, immediate):

```powershell
# temporary for this shell only
$env:Path += ';' + (Join-Path $sdk 'platform-tools')
where.exe adb
adb version
```

After these steps, rerun the Gradle build from `android/`:

```powershell
cd .\android
.\gradlew.bat :app:assembleDebug --warning-mode all --stacktrace
```

### Option B — Run from terminal with Expo (`npx expo start --android`)

This runs Metro (JS bundler) and launches the app on Android.

```powershell
cd C:\Users\<user>\dev\android-project
npm ci
npx expo start --android
```

## 5) Connect the Android app to the backend

Where the app should point depends on your target:

- Android Emulator: use `http://10.0.2.2:5035`
- Physical phone on Wi‑Fi: use your PC LAN IP (example `http://191.142.1.129:5035`)

If the app is trying to call `http://localhost:5035` from Android, you can use port reverse (works great for debugging):

```powershell
adb reverse tcp:5035 tcp:5035
```

## Troubleshooting

### Android native build errors (CMake/Ninja)

- Extract/build under a short path like `C:\Users\<user>\dev\...` (avoid OneDrive)
- Clear native caches if the build gets stuck:

```powershell
cd C:\Users\<user>\dev\android-project\android
\.\gradlew.bat --stop
Remove-Item -Recurse -Force .gradle, build, app\build -ErrorAction SilentlyContinue
```

### Backend fails to start with options validation errors

- Ensure SFCC settings are present (either `publish/appsettings.Production.json` from the workflow, or `Sfcc__*` environment variables)
