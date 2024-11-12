const apiKey = '355841ae0fb05f8ffcf2360f9a8c99ad';  // Add your OpenWeatherMap API Key here
let isCelsius = true;

// Initialize background element
document.addEventListener('DOMContentLoaded', () => {
  const weatherBackground = document.createElement('div');
  weatherBackground.id = 'weatherBackground';
  document.body.appendChild(weatherBackground);
});

// Suggest cities as user types
async function suggestCities() {
  const query = document.getElementById('cityInput').value;
  if (query.length < 2) return;
  const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}`);
  const suggestions = await response.json();
  displaySuggestions(suggestions.list);
}

function displaySuggestions(suggestions) {
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.innerHTML = '';
  suggestions.forEach(city => {
    const item = document.createElement('div');
    item.innerText = `${city.name}, ${city.sys.country}`;
    item.onclick = () => {
      document.getElementById('cityInput').value = city.name;
      suggestionsDiv.innerHTML = '';
      fetchWeather();
    };
    suggestionsDiv.appendChild(item);
  });
}

// Fetch weather for a specific city
async function fetchWeather() {
  const city = document.getElementById('cityInput').value;
  if (city) {
    document.body.classList.add('loaded'); // Show background when a city is entered
  }
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
  const currentWeather = await response.json();
  displayCurrentWeather(currentWeather);
  fetchForecast(city);
}

function displayCurrentWeather(data) {
  const currentWeatherInfo = document.getElementById('currentWeatherInfo');
  currentWeatherInfo.innerHTML = `
    <h3>${data.name}, ${data.sys.country}</h3>
    <p>Temperature: ${data.main.temp}°${isCelsius ? 'C' : 'F'}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
    <p>${data.weather[0].description}</p>
  `;
}

async function fetchForecast(city) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
  const forecastData = await response.json();
  displayForecast(forecastData.list);
}

function displayForecast(data) {
  const forecastGrid = document.getElementById('forecastGrid');
  forecastGrid.innerHTML = '';
  for (let i = 0; i < data.length; i += 8) {
    const dayData = data[i];
    const card = document.createElement('div');
    card.classList.add('forecast-card');
    card.innerHTML = `
      <h4>${new Date(dayData.dt * 1000).toLocaleDateString()}</h4>
      <p>High: ${dayData.main.temp_max}°${isCelsius ? 'C' : 'F'}</p>
      <p>Low: ${dayData.main.temp_min}°${isCelsius ? 'C' : 'F'}</p>
      <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="${dayData.weather[0].description}">
      <p>${dayData.weather[0].description}</p>
    `;
    forecastGrid.appendChild(card);
  }
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
      const currentWeather = await response.json();
      displayCurrentWeather(currentWeather);
      fetchForecast(`${currentWeather.name}`);
    });
  }
}

function toggleUnit() {
  isCelsius = !isCelsius;
  fetchWeather();
}

// Hide background on clear input or when suggestions are shown
function clearWeatherBackground() {
  if (!document.getElementById('cityInput').value) {
    document.body.classList.remove('loaded');
  }
}
document.getElementById('cityInput').addEventListener('input', clearWeatherBackground);
