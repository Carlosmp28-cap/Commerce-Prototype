# Releases

This repo uses a three-branch promotion flow:

`feature/*` → `dev` → `staging` → `main`

A **release** is a *tag* on `main` (e.g. `v1.0.0`). Creating/pushing the tag triggers the GitHub Actions workflow in `.github/workflows/release.yml`.

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
  - attaches `web-dist.tgz` to the GitHub Release

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
