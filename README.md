# StarWatcher v4.2 cache-safe repair

Fixes the partially deployed v4.1 state:
- focused compass heading is the actual field centre;
- bearing label updates live;
- fullscreen button is present and null-safe;
- successful engine-ready banner fades away;
- core files are explicitly versioned;
- service worker is network-first to prevent stale mixed-version HTML/JS;
- existing 1-second SGP4 worker updates and ~60-fps interpolation are retained;
- rich satellite telemetry is retained.

Upload this overlay over the existing repository. Do not replace data/catalogue.json.
