# Weather App (HTML, CSS, JavaScript)

A small client-side Weather App that uses OpenWeather APIs to show current weather and a 5-day forecast.

## Files (exactly)
- index.html
- style.css
- script.js

## Features
- Search weather by city name
- Shows: city name, temperature (°C), humidity, weather icon (emoji), and 5-day forecast
- Day / Night (light/dark) mode
- Input validation and error handling
- Loading indicator while fetching

## Setup
1. Replace the API key placeholder in `script.js` with your OpenWeather API key. Edit the `API_KEY` constant near the top of the file and set your key:

```javascript
// script.js
const API_KEY = "YOUR_ACTUAL_KEY_HERE";
```

2. (Optional) If you prefer the key in a separate file named `config.js`, create it with this content:

```javascript
// config.js
const API_KEY = "YOUR_ACTUAL_KEY_HERE";
```

Then include it before `script.js` in `index.html`:

```html
<script src="config.js"></script>
<script src="script.js"></script>
```

> Note: The original implementation places the placeholder in `script.js`. Moving the key to `config.js` will add a fourth file to the project.

## Run / Preview
Open `index.html` in a browser. For best results run a simple local server (recommended):

```powershell
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

Or using npx http-server:

```powershell
npx http-server -p 8000
```

## API details (where implemented)
The code comments in `script.js` show the base URLs and endpoints used:
- Geocoding (direct): `http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=1&appid={API key}`
- One Call (current + daily): `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&units=metric&appid={API key}`

## Notes
- The app uses `fetch()` with `async/await`, includes input trimming and basic error handling for network and API errors.
- Icons are lightweight emoji chosen from weather conditions (sun/cloud/rain/etc.). You can replace them with images if desired by editing `pickIcon()` in `script.js`.

If you want, I can move the key to `config.js` (this will add a fourth file), or wire SVG icons instead of emoji. Which would you prefer?
