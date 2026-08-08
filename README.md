# StarWatcher v4.6.1 — validated alignment build

Corrections found during validation:
1. The v4.6 generated package did not actually contain the expanded star catalogue. v4.6.1 replaces the catalogue explicitly with ~80 named bright reference stars.
2. The focused-view grid still displayed the previous arbitrary centre/elevation labels. It now reports current bearing on the rim and ZENITH at the centre.
3. iPhone `webkitCompassHeading` was being passed through a screen-angle correction intended only for alpha-based orientation fallbacks. v4.6.1 treats iPhone compass heading directly and applies screen-angle correction only to the fallback path.

Retained and checked:
- J2000 → date precession for stellar coordinates.
- Local sidereal conversion to altitude/azimuth.
- Bennett-style atmospheric refraction for apparent star and satellite elevations.
- Dynamic star prominence/label selection using magnitude, altitude and approximate extinction.
- 30° edge compass with emphasized N/E/S/W.
- Star-based compass calibration with a persisted local correction.
- One-second SGP4 worker updates and requestAnimationFrame interpolation.
- Location application and pass recalculation.
- In-app ISS/station and Starlink-train alerts.
- No service worker.

Upload as an overlay. Keep `data/catalogue.json` unchanged.
