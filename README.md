# StarWatcher v4.5.1 emergency recovery

This build disables the service worker deliberately.

Why:
The live site entered a blank-page state. StarWatcher does not require a service worker for live orbital tracking, so v4.5.1 removes that extra caching layer and actively unregisters/deletes older StarWatcher service-worker caches.

Retained:
- true zenith Re-zero
- compass-rotating zenith sky
- 15/30/60/90/all-sky fields
- expanded bright-star catalogue
- live satellite engine
- location selection
- alerts
- fullscreen
- richer satellite details

Upload all files in this overlay over the repository root.
Do not replace data/catalogue.json.
You may delete the old sw.js from the GitHub repository; v4.5.1 does not use it.
