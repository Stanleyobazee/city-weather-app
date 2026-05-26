require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const defaultCities = ["London", "New York", "Tokyo", "Lagos", "Sydney", "Paris", "Dubai", "Berlin", "Toronto", "Mumbai"];

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Content-Security-Policy", "default-src 'self' https://openweathermap.org; style-src 'self' 'unsafe-inline'; img-src 'self' https://openweathermap.org data:");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
  res.removeHeader("X-Powered-By");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function readView(name) {
  return fs.readFileSync(path.join(__dirname, "views", name), "utf-8");
}

function buildForecastCards(forecast) {
  return forecast.map(s => `
    <div class="fcard">
      <div class="ftime">${s.date}</div>
      <div class="ftime">${s.time}</div>
      <img src="https://openweathermap.org/img/wn/${s.icon}.png" alt="${escapeHtml(s.desc)}"/>
      <div class="ftemp">${s.temp}°C</div>
      <div class="fpop">🌧 ${s.rain}%</div>
      <div class="fdesc">${escapeHtml(s.desc)}</div>
    </div>`).join("");
}

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

// HOME
app.get("/", async (req, res) => {
  const search = req.query.city;
  const citiesToFetch = search ? [search] : defaultCities;
  const results = [], errors = [];

  await Promise.all(
    citiesToFetch.map(async (city) => {
      try { results.push(await getWeather(city)); }
      catch (err) { errors.push(city); console.error(err.message); }
    })
  );

  const cards = results.map(w => `
    <a class="card" href="/city?name=${encodeURIComponent(w.city)}">
      <h2>${escapeHtml(w.city)}</h2>
      <div class="country">${escapeHtml(w.country)}</div>
      <img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="${escapeHtml(w.condition)}"/>
      <div class="temp">${w.temp}°C</div>
      <div class="condition">${escapeHtml(w.condition)}</div>
      <div class="hint">Click for details</div>
    </a>`).join("");

  const html = readView("index.html")
    .replace("{{search}}", escapeHtml(search || ""))
    .replace("{{backLink}}", search && results.length ? `<div style="text-align:center"><a class="back" href="/">← Back to all cities</a></div>` : "")
    .replace("{{cards}}", cards)
    .replace("{{error}}", errors.length ? `<p class="error">❌ Could not find: ${escapeHtml(errors.join(", "))}</p>` : "");

  res.send(html);
});

// CITY DETAIL
app.get("/city", async (req, res) => {
  const cityName = req.query.name;
  if (!cityName) return res.redirect("/");

  let w;
  try { w = await getWeather(cityName); }
  catch (err) {
    console.error(err.message);
    return res.status(404).send(readView("index.html")
      .replace("{{search}}", "")
      .replace("{{backLink}}", "")
      .replace("{{cards}}", "")
      .replace("{{error}}", `<p class="error">❌ Could not fetch weather for "${escapeHtml(cityName)}"</p>`));
  }

  const html = readView("city.html")
    .replace(/{{city}}/g, escapeHtml(w.city))
    .replace("{{country}}", escapeHtml(w.country))
    .replace("{{icon}}", w.icon)
    .replace("{{condition}}", escapeHtml(w.condition))
    .replace("{{temp}}", w.temp)
    .replace("{{feels_like}}", w.feels_like)
    .replace("{{humidity}}", w.humidity)
    .replace("{{wind}}", w.wind)
    .replace("{{pressure}}", w.pressure)
    .replace("{{visibility}}", w.visibility)
    .replace("{{sunrise}}", w.sunrise)
    .replace("{{sunset}}", w.sunset)
    .replace("{{forecast}}", buildForecastCards(w.forecast));

  res.send(html);
});

const server = app.listen(PORT, () => console.log(`🌤 Weather app running at http://localhost:${PORT}`));
module.exports = server;
