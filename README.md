# StarWatcher v4 — Focused real-time sky tracker

This update removes camera/AR mode and replaces it with a true angular field-of-view system.

## Field of view
Select **15°, 30°, 60°, 90°, or All sky**. In focused modes, drag horizontally to pan in azimuth and vertically to pan in elevation. Tap a satellite, then choose **Center focused view here** to put it at the centre of the narrow field.

## Real-time architecture
- GitHub Actions catalogue refresh: automatically every **2 hours**.
- SGP4 orbital solutions: calculated off the UI thread in `orbit-worker.js` every **1 second**.
- Screen rendering: `requestAnimationFrame`, normally approximately **60 fps** on modern smartphones.
- Satellite motion: each new one-second orbital solution becomes an interpolation target; dots move continuously between solutions rather than jumping.
- The main UI thread never performs the bulk constellation propagation.

## Upgrade from v3
This package is intended as an **overlay update**. Keep your existing populated `data/catalogue.json` and existing `.github/workflows/update-starlink.yml`; both already provide the data architecture required by v4. Replace the app files from the overlay package.

The workflow must retain the two-hour schedule:
`cron: "17 */2 * * *"`

After deployment, Safari may briefly show the older cached PWA. Reload the page once or twice, or close and reopen the Home Screen app; v4 uses a new service-worker cache version.
