# Columbus UTCI map

A static 3D map of Columbus, Georgia, with UTCI, LiDAR-derived building heights and canopy. Open `index.html` through a web server. No build step, backend or API key is required.

## Publish with GitHub Pages

1. Create an empty GitHub repository.
2. Open a terminal in this folder and run the commands below, replacing `YOUR-USERNAME` and `YOUR-REPOSITORY`.
3. In the repository, open **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
5. GitHub Pages will provide the website URL, usually `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

```powershell
git init
git add .
git commit -m "Add Columbus UTCI map"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Commit the contents of this folder at the repository root, including `data/` and `.nojekyll`. Use Git for the data files. The relative asset paths work under a GitHub Pages repository URL. Do not add the ZIP package or the original research directory.

## Local preview

From this folder:

```powershell
python -m http.server 8766
```

Open `http://localhost:8766/`. Internet access loads MapLibre, Three.js and OpenStreetMap tiles; the exported research layers are served from this folder.

## Included data and display

- UTCI: 17 August 2026, 14:00 EDT; Inferno scale 32–50°C, stress cutoffs 32/38/46°C.
- Original citywide GPU run generated 5 November 2026. Its calculation audit failed; corrected citywide rerun pending. This version is retained as the requested visualization example, and identified in the information popup.
- Source grid: 1 m; map tiles use nearest-neighbour sampling, about 2 m at the finest level.
- Buildings: 73,137 footprints with 2017 LiDAR-derived heights above local ground.
- Canopy: 8 m display-grid proxies from 2017 vegetation heights, loaded by viewport; these are not individual tree counts.
- Controls: drag to pan, right-drag to rotate/tilt, scroll to zoom; independent Buildings and Trees toggles.

## Files

- `index.html`, `style.css`, `app.js`: page and map.
- `canopy.js`: canopy renderer and mouse camera controls.
- `stress.mjs`: UTCI category thresholds.
- `data/city/`: temperature tiles, encoded point-value tiles, buildings and canopy tiles.
- `.nojekyll`: serves the repository as plain static files.

OpenStreetMap attribution is retained on the map. MapLibre and Three.js are loaded from their public CDN distributions. Existing data attribution and source-version details remain in the information popup; this export does not assign a new license to the research data.
