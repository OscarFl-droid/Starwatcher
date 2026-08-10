# StarWatcher v5.1 Final Validation

Overall: **PASS**

- PASS — syntax_app
- PASS — syntax_worker
- PASS — dom_refs_complete
- PASS — asset_version_styles
- PASS — asset_version_app
- PASS — asset_version_worker
- PASS — no_service_worker
- PASS — monotonic_time
- PASS — render_raf
- PASS — orbit_1_second
- PASS — location_recalc_positions
- PASS — location_recalc_passes
- PASS — station_10min_alert
- PASS — alerts_use_shared_clock
- PASS — train_alert
- PASS — visibility_likely
- PASS — visibility_possible
- PASS — visibility_dim
- PASS — visibility_shadow
- PASS — track_request
- PASS — track_worker
- PASS — track_response
- PASS — diagnostics
- PASS — precession
- PASS — refraction
- PASS — independent_transform
- PASS — compass_ticks
- PASS — compass_calibration
- PASS — build_marker
- PASS — worker_marker
- PASS — coordinate_crosscheck_lt_0_01deg
- PASS — star_motion_nonzero

Vega movement in 10 min: 1.953405°
Maximum independent-coordinate disagreement: 0.000000000000°
Missing DOM IDs: none

The package deliberately does not include data/catalogue.json; retain the populated live catalogue in the repository.