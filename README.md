# Columbus UTCI map

A static 3D map of Columbus, Georgia, with UTCI, LiDAR-derived building heights and canopy. Open `index.html` through a web server. No build step, backend or API key is required.

## Included data and display

- UTCI: 17 August 2026, 14:00 EDT; Inferno scale 32–50°C, stress cutoffs 32/38/46°C.
- Original citywide GPU run generated 5 November 2026. Its calculation audit failed; corrected citywide rerun pending. This version is retained as the requested visualization example, and identified in the information popup.
- Source grid: 1 m; map tiles use nearest-neighbour sampling, about 2 m at the finest level.
- Buildings: 73,137 footprints with 2017 LiDAR-derived heights above local ground.
- Canopy: 8 m display-grid proxies from 2017 vegetation heights, loaded by viewport; these are not individual tree counts.
- Controls: drag to pan, right-drag to rotate/tilt, scroll to zoom; independent Buildings and Trees toggles.
