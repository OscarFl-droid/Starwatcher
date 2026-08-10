# StarWatcher v5.0 — time and coordinate validation priority

This build makes the clock and coordinate system observable and self-checking.

- Monotonic UTC-backed time engine shared by stars and satellites.
- Stars recomputed continuously in requestAnimationFrame.
- Two independent RA/Dec→Alt/Az transforms cross-check Vega and Polaris every 0.5 s.
- Diagnostics show UTC, Julian date, local sidereal time, Vega now, Vega +10 min, Vega angular motion, and Polaris.
- SGP4 satellite solutions update once per second in a Web Worker.
- Tapping a satellite requests a fresh ±trajectory for that exact object.
- All above-horizon satellites remain visible, but are coded:
  white/ring = likely naked-eye; yellow = possible; gray = too faint; hollow gray = Earth shadow.
- No service worker.

Upload as an overlay and retain data/catalogue.json.
