# StarWatcher v3 — Real-time phone sky tracker

This is a full replacement for v2.

## Upload
Replace the repository contents with everything in this package, preserving:
`.github/workflows/update-starlink.yml`

GitHub Pages remains `main` + `/ (root)`.

## One-time update after upload
Because v3 now combines Starlink + OneWeb + ISS + Tiangong + Hubble, run:
Actions → **Update orbital catalogue** → Run workflow.

The same workflow then refreshes automatically every two hours.

## Real-time rendering
Orbital propagation runs in `orbit-worker.js`, away from the UI thread. The visible positions are continuously interpolated by `requestAnimationFrame`, giving smooth 60-fps visual motion while fresh SGP4 positions are calculated several times per second.

## AR mode
AR uses the rear camera plus DeviceOrientation / iOS compass heading. On iPhone, sensor and camera permissions must be granted from direct button taps. Compass accuracy depends on magnetic calibration and nearby metal/electronics.

## Brightness
Displayed magnitudes are *estimates*, not precision photometry. They use spacecraft-class baseline brightness, range and a Lambertian solar phase function. True brightness can change substantially with spacecraft attitude, panel orientation, atmosphere and observer conditions. “Train” detection identifies dense sunlit Starlink clusters; it is not a claim that every member will be naked-eye visible.

## Notifications
This build can issue foreground/local PWA notifications when it is running. Reliable alerts while the iPhone app is completely closed require standards-based Web Push plus a server-side push subscription/scheduler. iOS supports Web Push for Home Screen web apps, but GitHub Pages alone cannot originate scheduled push messages.
