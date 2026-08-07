# StarWatcher v2

StarWatcher is a smartphone-first GitHub Pages PWA. The browser no longer requests CelesTrak directly.

## Why this build fixes the Safari problem

A scheduled GitHub Action downloads the current Starlink catalogue from CelesTrak every two hours and writes it to:

`data/starlink.json`

The phone then requests that file from the same `oscarfl-droid.github.io` origin as the app itself. This removes the CelesTrak browser/CORS dependency.

## Install

Upload **all files and folders in this package** to the ROOT of the `Starwatcher` repository.

The root must contain:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `data/starlink.json`
- `icons/`
- `.github/workflows/update-starlink.yml`

Keep GitHub Pages set to:

- Branch: `main`
- Folder: `/ (root)`

## Important one-time step

After uploading:

1. Open the repository on GitHub.
2. Open **Actions**.
3. Select **Update Starlink catalogue**.
4. Tap **Run workflow** → **Run workflow**.
5. Wait for the green tick.
6. The workflow will commit a populated `data/starlink.json`.
7. GitHub Pages will redeploy automatically.

After that, the catalogue refreshes every two hours.

If the workflow cannot push, go to:
Settings → Actions → General → Workflow permissions
and select **Read and write permissions**.

## iPhone PWA

Open the live site in Safari, tap Share, then **Add to Home Screen**. The application is locked to portrait in the PWA manifest and caches its shell for offline launch.

The star field works offline after first load. Satellite positions require a previously cached Starlink catalogue.

## Current functionality

- smartphone-only responsive layout
- village/town/postcode search
- precise browser geolocation
- live local all-sky view
- real-time SGP4 propagation
- Starlink sunlit/shadow classification
- tap satellite for azimuth, elevation, range, altitude and NORAD ID
- next three hours of high sunlit passes
- phone-orientation sky rotation on supported iPhones
- PWA installability
- offline application shell
- same-origin orbital catalogue
