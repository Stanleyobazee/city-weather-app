require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const defaultCities = ["London", "New York", "Tokyo", "Lagos", "Sydney", "Paris", "Dubai", "Berlin", "Toronto", "Mumbai"];

const baseStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; padding: 30px 20px; }
  h1 { text-align: center; margin-bottom: 24px; font-size: 2rem; color: #e0e0ff; }
  form { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; }
  input { padding: 10px 16px; border-radius: 8px; border: none; font-size: 1rem; width: 280px; background: #16213e; color: #fff; outline: 1px solid #444; }
  button { padding: 10px 20px; border-radius: 8px; border: none; background: #0f3460; color: #fff; font-size: 1rem; cursor: pointer; }
  button:hover { background: #e94560; }
  a.back { display: inline-block; margin-bottom: 24px; color: #a0c4ff; text-decoration: none; font-size: 0.95rem; }
  a.back:hover { text-decoration: underline; }
  .error { text-align: center; color: #e94560; margin-top: 20px; }
`;

async function getWeather(city) {
  const [{ data: w }, { data: f }] = await Promise.all([
    axios.get(BASE_URL, { params: { q: city, appid: API_KEY, units: "metric" } }),
    axios.get(FORECAST_URL, { params: { q: city, appid: API_KEY, units: "metric", cnt: 8 } }),
  ]);

  const forecast = f.list.map((slot) => ({
    time: new Date(slot.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date(slot.dt * 1000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
    rain: ((slot.pop || 0) * 100).toFixed(0),
    temp: slot.main.temp.toFixed(1),
    icon: slot.weather[0].icon,
    desc: slot.weather[0].description,
  }));

  return {
    city: w.name,
    country: w.sys.country,
    temp: w.main.temp.toFixed(1),
    feels_like: w.main.feels_like.toFixed(1),
    humidity: w.main.humidity,
    pressure: w.main.pressure,
    condition: w.weather[0].description,
    icon: w.weather[0].icon,
    wind: w.wind.speed,
    visibility: (w.visibility / 1000).toFixed(1),
    sunrise: new Date(w.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    sunset: new Date(w.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    forecast,
  };
}

// HOME — compact clickable city cards
app.get("/", async (req, res) => {
  const search = req.query.city;
  const citiesToFetch = search ? [search] : defaultCities;
  const results = [], errors = [];

  await Promise.all(
    citiesToFetch.map(async (city) => {
      try { results.push(await getWeather(city)); }
      catch { errors.push(city); }
    })
  );

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>City Weather App</title>
  <style>
    ${baseStyle}
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; max-width: 1100px; margin: 0 auto; }
    .card { background: #16213e; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); cursor: pointer; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; display: block; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.5); border: 1px solid #a0c4ff44; }
    .card h2 { font-size: 1rem; color: #a0c4ff; }
    .card .country { font-size: 0.75rem; color: #888; margin-bottom: 4px; }
    .card img { width: 56px; }
    .card .temp { font-size: 1.8rem; font-weight: bold; color: #fff; }
    .card .condition { font-size: 0.8rem; color: #ccc; text-transform: capitalize; }
    .card .hint { font-size: 0.7rem; color: #555; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>🌍 City Weather App</h1>
  <form method="GET" action="/">
    <input type="text" name="city" placeholder="Search any city worldwide..." value="${search || ""}"/>
    <button type="submit">Search</button>
  </form>

  ${search && results.length ? `<div style="text-align:center"><a class="back" href="/">← Back to all cities</a></div>` : ""}

  <div class="grid">
    ${results.map(w => `
      <a class="card" href="/city?name=${encodeURIComponent(w.city)}">
        <h2>${w.city}</h2>
        <div class="country">${w.country}</div>
        <img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="${w.condition}"/>
        <div class="temp">${w.temp}°C</div>
        <div class="condition">${w.condition}</div>
        <div class="hint">Click for details</div>
      </a>`).join("")}
  </div>

  ${errors.length ? `<p class="error">❌ Could not find: ${errors.join(", ")}</p>` : ""}
</body>
</html>`);
});

// CITY DETAIL PAGE
app.get("/city", async (req, res) => {
  const cityName = req.query.name;
  if (!cityName) return res.redirect("/");

  let w, error;
  try { w = await getWeather(cityName); }
  catch (e) { error = e.message; }

  if (error) {
    return res.send(`<!DOCTYPE html><html><head><title>Error</title></head><body style="background:#1a1a2e;color:#eee;padding:40px;text-align:center">
      <p style="color:#e94560">❌ Could not fetch weather for "${cityName}"</p>
      <a href="/" style="color:#a0c4ff">← Back</a></body></html>`);
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${w.city} Weather</title>
  <style>
    ${baseStyle}
    .container { max-width: 800px; margin: 0 auto; }
    .hero { background: #16213e; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    .hero h2 { font-size: 2rem; color: #a0c4ff; }
    .hero .country { color: #888; margin-bottom: 8px; }
    .hero img { width: 80px; }
    .hero .temp { font-size: 3.5rem; font-weight: bold; }
    .hero .condition { font-size: 1.1rem; color: #ccc; text-transform: capitalize; margin-bottom: 16px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat { background: #16213e; border-radius: 10px; padding: 14px; text-align: center; }
    .stat .label { font-size: 0.75rem; color: #888; margin-bottom: 4px; }
    .stat .value { font-size: 1.1rem; font-weight: bold; color: #e0e0ff; }
    .forecast-section { background: #16213e; border-radius: 16px; padding: 20px; }
    .forecast-section h3 { color: #a0c4ff; margin-bottom: 16px; font-size: 1rem; }
    .forecast-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
    .fcard { background: #0f1b35; border-radius: 10px; padding: 10px; text-align: center; font-size: 0.78rem; color: #ccc; }
    .fcard img { width: 36px; }
    .fcard .ftime { color: #888; font-size: 0.7rem; }
    .fcard .ftemp { font-weight: bold; color: #fff; }
    .fcard .fpop { color: #60b4ff; font-weight: bold; }
    .fcard .fdesc { text-transform: capitalize; font-size: 0.68rem; color: #aaa; }
  </style>
</head>
<body>
  <div class="container">
    <a class="back" href="/">← Back to all cities</a>

    <div class="hero">
      <h2>${w.city}</h2>
      <div class="country">${w.country}</div>
      <img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="${w.condition}"/>
      <div class="temp">${w.temp}°C</div>
      <div class="condition">${w.condition}</div>
    </div>

    <div class="stats">
      <div class="stat"><div class="label">🌡 Feels Like</div><div class="value">${w.feels_like}°C</div></div>
      <div class="stat"><div class="label">💧 Humidity</div><div class="value">${w.humidity}%</div></div>
      <div class="stat"><div class="label">💨 Wind Speed</div><div class="value">${w.wind} m/s</div></div>
      <div class="stat"><div class="label">🔵 Pressure</div><div class="value">${w.pressure} hPa</div></div>
      <div class="stat"><div class="label">👁 Visibility</div><div class="value">${w.visibility} km</div></div>
      <div class="stat"><div class="label">🌅 Sunrise</div><div class="value">${w.sunrise}</div></div>
      <div class="stat"><div class="label">🌇 Sunset</div><div class="value">${w.sunset}</div></div>
    </div>

    <div class="forecast-section">
      <h3>🌧 Rain Forecast — Next 24 Hours</h3>
      <div class="forecast-grid">
        ${w.forecast.map(s => `
          <div class="fcard">
            <div class="ftime">${s.date}</div>
            <div class="ftime">${s.time}</div>
            <img src="https://openweathermap.org/img/wn/${s.icon}.png" alt="${s.desc}"/>
            <div class="ftemp">${s.temp}°C</div>
            <div class="fpop">🌧 ${s.rain}%</div>
            <div class="fdesc">${s.desc}</div>
          </div>`).join("")}
      </div>
    </div>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => console.log(`🌤 Weather app running at http://localhost:${PORT}`));
