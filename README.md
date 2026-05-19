# 🌍 City Weather App

A simple Node.js web application that displays real-time weather conditions and rain forecasts for cities worldwide, powered by the [OpenWeatherMap API](https://openweathermap.org/api).

## Features

- 🌤 Live weather data for 10 default cities
- 🔍 Search any city worldwide
- 🌧 24-hour rain forecast with probability per slot
- 📊 Detailed city view — temperature, humidity, wind, pressure, visibility, sunrise & sunset
- 🐳 Fully containerized with Docker

## Preview

| Homepage | City Detail |
|----------|-------------|
| Clickable city cards with current temp & condition | Full weather stats + 24h rain forecast |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- An API key from [OpenWeatherMap](https://openweathermap.org/api) (free tier)
- [Docker](https://www.docker.com/) (optional, for containerized run)

### Installation

```bash
git clone https://github.com/Stanleyobazee/city-weather-app.git
cd city-weather-app
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm start
```

Open your browser at `http://localhost:3000`

## Docker

### Build & Run

```bash
docker build -t city-weather-app .
docker run -p 3000:3000 -e OPENWEATHER_API_KEY=your_api_key_here city-weather-app
```

### Pull from Docker Hub

```bash
docker run -p 3000:3000 -e OPENWEATHER_API_KEY=your_api_key_here stanley80/city-weather-app:latest
```

## Project Structure

```
city-weather-app/
├── index.js          # Express server & weather logic
├── package.json      # Project dependencies
├── Dockerfile        # Docker image config
├── .dockerignore     # Files excluded from Docker image
├── .env              # API key (not committed)
└── README.md         # Project documentation
```

## Built With

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Axios](https://axios-http.com/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Docker](https://www.docker.com/)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Stanley Obazee**
GitHub: [@Stanleyobazee](https://github.com/Stanleyobazee)
