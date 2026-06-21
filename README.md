# Drawing Azimuth (Bearing) Lines On Maps

A lightweight, browser-based tool for drawing azimuth (bearing) lines on a satellite map using [Leaflet](https://leafletjs.com/). Useful for antenna alignment, line-of-sight checks, surveying, or any task that requires visualizing directions/bearings from a fixed point.

**Live demo:** https://milangru.github.io/azimuth-maps/

## Features

- **Start Point input** — enter a reference point as `lat, lon` coordinates.
- **Multiple angles at once** — enter a comma-separated list of azimuth angles (in degrees) to draw several bearing lines from the same start point in a single pass.
- **Optional distance** — specify a line length in meters; if left blank, lines extend to a default/visible length.
- **Draw** — renders the azimuth lines on the satellite map.
- **Share Link** — generates a URL that encodes your current inputs, so you can share or bookmark a specific configuration.
- **Hide Controls** — collapses the input panel for an unobstructed view of the map.

## Usage

1. Open the [live demo](https://milangru.github.io/azimuth-maps/).
2. Enter the **Start Point** as latitude and longitude (e.g. `45.2671, 19.8335`).
3. Enter one or more **Angles** in degrees, separated by commas (e.g. `0, 90, 180, 270`).
4. (Optional) Enter a **Distance** in meters to control how long the drawn lines are.
5. Click **Draw**.
6. Use **🔗 Share Link** to copy a URL with your current settings, or **Hide Controls** to view the map without the panel.

## Tech Stack

- [Leaflet.js](https://leafletjs.com/) for interactive map rendering
- Satellite basemap tiles
- Static HTML/CSS/JavaScript — no backend required, runs entirely client-side
- Hosted via GitHub Pages

## Running Locally

Since this is a static site, you can run it locally with any simple web server, for example:

```bash
git clone https://github.com/milangru/azimuth-maps.git
cd azimuth-maps
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html) (GPL-3.0).

You are free to use, study, modify, and redistribute this software, provided that any derivative works are also distributed under the same license. See the [LICENSE](LICENSE) file for the full license text.
 
