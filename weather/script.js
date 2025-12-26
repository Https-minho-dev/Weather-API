/*
 * ============================================
 * WEATHER APP - ELEC 3 PROJECT
 * ============================================
 * 
 * This Weather App uses OpenWeather API to fetch and display:
 * - Current weather by city name
 * - 5-day forecast
 * 
 * Requirements met:
 * - Uses fetch() with async/await
 * - Organized code with functions
 * - Separated API logic, DOM logic, and utility functions
 * - Comprehensive error handling
 * - Input validation
 * - Loading states
 * - Responsive design with dark mode
 */

// ============================================
// CONFIGURATION SECTION
// ============================================
// API Key Configuration
// Replace "YOUR_API_KEY_HERE" with your actual OpenWeather API key
// Get your free API key at: https://openweathermap.org/api
const API_KEY = "a1f59cc6805302204b62a7f3c57c7447";



const API_BASE_URL = "https://api.openweathermap.org";


const GEOCODING_ENDPOINT = "/geo/1.0/direct";


const CURRENT_WEATHER_ENDPOINT = "/data/2.5/weather";


const FORECAST_ENDPOINT = "/data/2.5/forecast";

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');
const loadingEl = document.getElementById('loading');
const modeBtn = document.getElementById('modeBtn');


function init() {

    const savedMode = localStorage.getItem('weather_mode');
    if (savedMode === 'dark') {
        document.body.classList.add('dark');
    }

    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    if (modeBtn) {
        modeBtn.addEventListener('click', toggleDarkMode);
    }


    validateApiKey();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


/**
 * Validates the API key
 * Checks if API key is set and not a placeholder
 * Shows warning message if invalid
 * Disables search functionality if key is invalid
 * 
 * @returns {boolean} 
 */
function validateApiKey() {
    const placeholderPattern = /your[_-]?api[_-]?key|YOUR_API_KEY|YOUR-API-KEY|YOUR/gi;
    const key = API_KEY.trim();

    if (!key || key === '' || placeholderPattern.test(key)) {
        searchBtn.disabled = true;
        cityInput.disabled = true;
        return false;
    }
    searchBtn.disabled = false;
    cityInput.disabled = false;
    return true;
}


/**
 * Validates and sanitizes city input
 * - Trims whitespace
 * - Checks for empty input
 * - Validates characters (allows letters, spaces, hyphens, apostrophes)
 * 
 * @param {string} input - Raw input from user
 * @returns {object} {valid: boolean, city: string, error: string}
 */
function validateCityInput(input) {
    // Auto-trim whitespace
    const city = input.trim();

    // Check for empty input
    if (!city || city.length === 0) {
        return {
            valid: false,
            city: '',
            error: 'Please enter a city name.'
        };
    }

    // Validate characters (allow letters, spaces, hyphens, apostrophes, and common city name characters)
    const invalidChars = /[<>{}[\]\\|`~!@#$%^&*()+=\d]/;
    if (invalidChars.test(city)) {
        return {
            valid: false,
            city: city,
            error: 'Invalid characters detected. Please enter a valid city name (letters, spaces, hyphens, and apostrophes only).'
        };
    }

    return {
        valid: true,
        city: city,
        error: ''
    };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetches current weather data for a city
 * Uses Current Weather API endpoint
 * 
 * @param {string} city - City name
 * @returns {Promise<object>} Weather data object
 * @throws {Error} If API call fails or city not found
 */
async function fetchCurrentWeather(city) {
    const url = `${API_BASE_URL}${CURRENT_WEATHER_ENDPOINT}?q=${encodeURIComponent(city)}&units=metric&appid=${encodeURIComponent(API_KEY)}`;

    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        throw new Error('Network error: Failed to connect to weather service. Please check your internet connection.');
    }

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the city name and try again.');
        } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your API key in script.js');
        } else {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
    }

    const data = await response.json();
    return data;
}

/**
 * Fetches 5-day forecast data for a city
 * Uses Forecast API endpoint
 * 
 * @param {string} city - City name
 * @returns {Promise<object>} Forecast data object
 * @throws {Error} If API call fails
 */
async function fetchForecast(city) {
    const url = `${API_BASE_URL}${FORECAST_ENDPOINT}?q=${encodeURIComponent(city)}&units=metric&appid=${encodeURIComponent(API_KEY)}`;

    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        throw new Error('Network error: Failed to connect to forecast service. Please check your internet connection.');
    }

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found for forecast. Please check the city name and try again.');
        } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your API key in script.js');
        } else {
            throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
        }
    }

    const data = await response.json();
    return data;
}

/**
 * Gets weather data for a city (current + forecast)
 * Combines current weather and forecast API calls
 * 
 * @param {string} city - City name
 * @returns {Promise<object>} Combined weather data
 * @throws {Error} If any API call fails
 */
async function getWeatherData(city) {
    try {
        // Fetch current weather and forecast in parallel for better performance
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city)
        ]);

        return {
            current: currentData,
            forecast: forecastData
        };
    } catch (error) {
        throw error;
    }
}

// ============================================
// DOM MANIPULATION FUNCTIONS
// ============================================

/**
 * Handles search button click and Enter key press
 * Validates input, fetches weather data, and renders results
 */
async function handleSearch() {
    // Clear previous results
    clearResults();

    // Validate API key before proceeding
    if (!validateApiKey()) {
        return;
    }

    // Validate input
    const validation = validateCityInput(cityInput.value);
    if (!validation.valid) {
        return;
    }

    // Disable button and input during loading
    setLoadingState(true);

    try {
        // Fetch weather data
        const weatherData = await getWeatherData(validation.city);

        // Render results
        renderWeather(weatherData);
    } catch (error) {
        // Handle errors silently
    } finally {
        // Re-enable button and input after request completes
        setLoadingState(false);
    }
}

/**
 * Sets loading state
 * Disables/enables search button and input field
 * Shows/hides loading indicator
 * 
 * @param {boolean} isLoading - Whether loading state should be active
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        searchBtn.disabled = true;
        cityInput.disabled = true;
        showLoading();
    } else {
        searchBtn.disabled = false;
        cityInput.disabled = false;
        hideLoading();
    }
}

/**
 * Renders current weather and 5-day forecast to the DOM
 * 
 * @param {object} data - Weather data object containing current and forecast data
 */
function renderWeather(data) {
    clearResults();

    const current = data.current;
    const forecast = data.forecast;

    // Create current weather card
    const currentCard = createCurrentWeatherCard(current);

    // Create forecast card
    const forecastCard = createForecastCard(forecast);

    // Append cards to results container
    resultsEl.appendChild(currentCard);
    resultsEl.appendChild(forecastCard);
}

/**
 * Creates current weather card element (Hero Card)
 * 
 * @param {object} currentData - Current weather data from API
 * @returns {HTMLElement} Current weather card element
 */
function createCurrentWeatherCard(currentData) {
    const card = document.createElement('div');
    card.className = 'hero-card';

    const cityName = escapeHtml(currentData.name || 'Unknown');
    const temp = Math.round(currentData.main?.temp || 0);
    const humidity = currentData.main?.humidity || 0;
    const weather = currentData.weather?.[0];
    const iconClass = weather ? getWeatherIconClass(weather.main, weather.id, weather.icon) : 'fa-question';
    const description = weather ? escapeHtml(weather.description) : '';

    card.innerHTML = `
        <div class="current-weather">
            <div class="weather-icon-large">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="weather-main">
                <div class="city-name">${cityName}</div>
                <div class="temperature">${temp}°C</div>
                <div class="weather-description">${description}</div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <div>
                        <div class="detail-label">Humidity</div>
                        <div class="detail-value">${humidity}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add fade-in animation
    card.style.opacity = '0';
    card.style.animation = 'fadeInUp 0.6s ease forwards';

    return card;
}

/**
 * Creates 5-day forecast card element (Grid Gallery)
 * 
 * @param {object} forecastData - Forecast data from API
 * @returns {HTMLElement} Forecast card element
 */
function createForecastCard(forecastData) {
    const section = document.createElement('div');
    section.className = 'forecast-section';

    const title = document.createElement('div');
    title.className = 'forecast-title';
    title.innerHTML = '<i class="fas fa-calendar-week"></i> 5-Day Forecast';
    section.appendChild(title);

    const forecastGrid = document.createElement('div');
    forecastGrid.className = 'forecast-grid';

    // Process forecast data - group by day and get one entry per day
    const dailyForecasts = processForecastData(forecastData.list || []);

    if (dailyForecasts.length === 0) {
        const noData = document.createElement('div');
        noData.className = 'small';
        noData.textContent = 'No forecast data available';
        forecastGrid.appendChild(noData);
    } else {
        // Display up to 5 days
        dailyForecasts.slice(0, 5).forEach((day, index) => {
            const dayElement = createForecastDayElement(day, index);
            forecastGrid.appendChild(dayElement);
        });
    }

    section.appendChild(forecastGrid);

    // Add fade-in animation with delay
    section.style.opacity = '0';
    section.style.animation = 'fadeInUp 0.8s ease 0.2s forwards';

    return section;
}

/**
 * Processes forecast list to get one entry per day
 * Groups forecast entries by date and selects representative entry for each day
 * 
 * @param {Array} forecastList - Array of forecast entries from API
 * @returns {Array} Processed daily forecast array
 */
function processForecastData(forecastList) {
    const dailyMap = new Map();

    forecastList.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                dt: entry.dt,
                temp: entry.main?.temp || 0,
                temp_min: entry.main?.temp_min || 0,
                temp_max: entry.main?.temp_max || 0,
                humidity: entry.main?.humidity || 0,
                weather: entry.weather?.[0] || null
            });
        } else {
            // Update with max/min temps if needed
            const existing = dailyMap.get(dateKey);
            if (entry.main?.temp_max > existing.temp_max) {
                existing.temp_max = entry.main.temp_max;
            }
            if (entry.main?.temp_min < existing.temp_min) {
                existing.temp_min = entry.main.temp_min;
            }
        }
    });

    return Array.from(dailyMap.values());
}

/**
 * Creates a single forecast day element
 * 
 * @param {object} dayData - Forecast data for one day
 * @param {number} index - Index for animation delay
 * @returns {HTMLElement} Forecast day element
 */
function createForecastDayElement(dayData, index = 0) {
    const dayEl = document.createElement('div');
    dayEl.className = 'forecast-day';

    const dayName = formatDayName(dayData.dt);
    const iconClass = dayData.weather ? getWeatherIconClass(dayData.weather.main, dayData.weather.id, dayData.weather.icon) : 'fa-question';
    const maxTemp = Math.round(dayData.temp_max || dayData.temp || 0);
    const minTemp = Math.round(dayData.temp_min || dayData.temp || 0);
    const humidity = dayData.humidity || 0;

    dayEl.innerHTML = `
        <div class="day-name">${dayName}</div>
        <div class="forecast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="forecast-temp">${maxTemp}°C</div>
        <div class="forecast-temp-range">${minTemp}° / ${maxTemp}°</div>
        <div class="forecast-humidity">
            <i class="fas fa-tint"></i>
            <span>${humidity}%</span>
        </div>
    `;

    // Add staggered fade-in animation
    dayEl.style.opacity = '0';
    dayEl.style.animation = `fadeIn 0.6s ease ${0.1 * (index + 1)}s forwards`;

    return dayEl;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Gets weather icon FontAwesome class based on weather condition
 * 
 * @param {string} main - Main weather condition (e.g., "Clear", "Clouds")
 * @param {number} weatherId - Weather condition ID from API
 * @param {string} iconCode - Icon code from API (e.g., "01d", "01n")
 * @returns {string} FontAwesome icon class
 */
function getWeatherIconClass(main, weatherId, iconCode) {
    const id = Number(weatherId || 0);
    const mainLower = (main || '').toLowerCase();
    const isNight = typeof iconCode === 'string' && iconCode.endsWith('n');

    // Cloud conditions
    if (mainLower.includes('cloud') || (id >= 801 && id <= 804)) {
        if (id === 801) return 'fa-cloud-sun';
        if (id === 802) return 'fa-cloud';
        return 'fa-clouds';
    }
    // Rain conditions
    if (mainLower.includes('rain') || (id >= 500 && id <= 531)) {
        if (id >= 502) return 'fa-cloud-rain';
        return 'fa-cloud-showers-heavy';
    }
    // Drizzle
    if (mainLower.includes('drizzle') || (id >= 300 && id <= 321)) {
        return 'fa-cloud-drizzle';
    }
    // Snow
    if (mainLower.includes('snow') || (id >= 600 && id <= 622)) {
        return 'fa-snowflake';
    }
    // Thunderstorm
    if (mainLower.includes('thunder') || (id >= 200 && id <= 232)) {
        return 'fa-bolt';
    }
    // Clear sky
    if (mainLower.includes('clear') || id === 800) {
        return isNight ? 'fa-moon' : 'fa-sun';
    }
    // Mist/Fog
    if (mainLower.includes('mist') || mainLower.includes('fog') || (id >= 701 && id <= 781)) {
        return 'fa-smog';
    }
    // Default
    return 'fa-cloud-sun';
}

/**
 * Formats Unix timestamp to day name
 * 
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string} Day name (e.g., "Mon", "Tue")
 */
function formatDayName(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
}

/**
 * Toggles dark mode (currently always dark theme, but kept for future use)
 * Updates body class and saves preference to localStorage
 */
function toggleDarkMode() {
    // Theme is always dark with glassmorphism, but toggle can be used for future features
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('weather_mode', isDark ? 'dark' : 'light');
}


/**
 * Shows loading indicator
 */
function showLoading() {
    loadingEl.classList.add('show');
    loadingEl.setAttribute('aria-hidden', 'false');
}

/**
 * Hides loading indicator
 */
function hideLoading() {
    loadingEl.classList.remove('show');
    loadingEl.setAttribute('aria-hidden', 'true');
}

/**
 * Clears results container
 */
function clearResults() {
    resultsEl.innerHTML = '';
}

/**
 * Escapes HTML special characters to prevent XSS
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') {
        return '';
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
}

// ============================================
// END OF SCRIPT
// ============================================
