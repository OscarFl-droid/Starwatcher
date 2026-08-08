# StarWatcher v4.6.1 validation

## Automated/static validation
- `app.js`: JavaScript syntax valid.
- `orbit-worker.js`: JavaScript syntax valid.
- HTML/JavaScript ID audit: no missing referenced DOM elements.
- Bright named-star catalogue: 83 stars.
- Service worker: intentionally absent.
- Orbital Web Worker refresh cadence: 1 second.
- Rendering loop: `requestAnimationFrame`.
- Compass edge: absolute markings every 30 degrees.
- iPhone heading handling: `webkitCompassHeading` is used directly; screen-orientation correction is limited to alpha fallback.
- Star alignment calibration: present and persisted locally.
- Stellar precession and atmospheric refraction: present.

## Projection invariants
- Zenith projects to the exact centre of the focused map.
- A target 30 degrees from zenith lands on the boundary of a 60-degree field.
- A target at the current phone heading appears at the top of the map.
- Due east appears to the right when the phone/map is north-up.
- Due east appears at the top when the phone points east.

## Important physical limitation
The dominant residual registration uncertainty is the iPhone magnetometer, not the star/satellite coordinate transform. Magnetic cases, speakers, cars, steel furniture and local magnetic declination can shift heading by several degrees. The star-alignment function is specifically intended to remove that fixed heading offset.
