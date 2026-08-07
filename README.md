# StarWatcher v4.1

This release fixes focused-view compass behaviour and adds fullscreen sky mode plus richer satellite telemetry.

## Focused view + compass
In 15°, 30°, 60° and 90° modes, enabling Automatic compass alignment now makes the focused field centre directly on the phone compass heading. It no longer adds the heading to the old manual azimuth. Vertical dragging remains available to change the elevation centre while compass alignment is active.

## Fullscreen sky
The ⛶ button expands the sky card to the entire phone viewport. On browsers that support the Fullscreen API, StarWatcher also requests browser fullscreen; on iPhone Safari the CSS fullscreen view still works even where the API is restricted.

## Live engine status
The green “Live orbital engine ready” message now fades away automatically after 1.8 seconds. Errors remain visible.

## Satellite detail sheet
Tapping a satellite now shows:
- current orbital speed (km/s)
- orbital period
- orbital inclination
- estimated brightness
- lighting state
- functional role
- service/launch year derived from the international designator
- age of the current orbital element epoch
- altitude, observer range, azimuth and elevation

Service year is intentionally shown as a year rather than a fabricated exact launch date because the standard CelesTrak GP JSON international designator identifies launch year and launch sequence, not the precise launch date.

## Real-time architecture
- GitHub Actions catalogue refresh: every 2 hours
- SGP4 propagation: every 1 second in a Web Worker
- Rendering: requestAnimationFrame (~60 fps)
- Motion: one-second propagation solutions are interpolated continuously on-screen
