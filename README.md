🌦️ Weather App – OpenWeather API

HTML • CSS • JavaScript

A client-side weather application developed as part of an ELEC 3 API project, demonstrating API integration, asynchronous data fetching, input validation, and responsive UI design using pure HTML, CSS, and JavaScript.

📁 Project Structure

This project strictly follows the three-file requirement:

index.html
style.css
script.js


No inline CSS or JavaScript is used.

✨ Features

Search current weather by city name

Displays:

City name

Temperature (°C)

Humidity

Weather condition icon

5-day forecast

Light/Dark mode toggle

Input validation and user-friendly error handling

Loading indicator during API requests

Responsive layout for web browsers

🌐 API Information

API Provider: OpenWeather

Base URL: https://api.openweathermap.org/

Authentication: API Key (required)

Endpoints Used

Direct Geocoding API

Current Weather Data API

5-Day / Daily Forecast API

Only the necessary fields from the API response are utilized and displayed.

⚙️ How to Run the Project

Clone the repository:

git clone https://github.com/USERNAME/Weather.git


Open index.html in a web browser
(or run using a simple local server for best results)

🔐 API Key Notice

This project uses a placeholder API key for security purposes.

const API_KEY = "YOUR_API_KEY_HERE";


To test the application, replace the placeholder with your own OpenWeather API key.
API keys should never be committed to public repositories.

🧠 Technical Highlights

Uses fetch() with async/await

Modular JavaScript functions

Clear separation of API logic, DOM manipulation, and utility functions

Comprehensive in-code documentation and comments
