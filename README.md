# 🌍 City Weather App

A simple Node.js web application that displays real-time weather conditions and rain forecasts for cities worldwide, powered by the [OpenWeatherMap API](https://openweathermap.org/api).

## Features

- 🌤 Live weather data for 10 default cities
- 🔍 Search any city worldwide
- 🌧 24-hour rain forecast with probability per slot
- 📊 Detailed city view — temperature, humidity, wind, pressure, visibility, sunrise & sunset
- 🐳 Fully containerized with Docker
- 🔒 Full CI/CD pipeline with automated testing and security scanning

## Preview

| Homepage | City Detail |
|----------|-------------|
| Clickable city cards with current temp & condition | Full weather stats + 24h rain forecast |

## CI/CD Pipeline

Every push to `main` triggers a 4-stage pipeline:

| Stage | Steps |
|-------|-------|
| **test** | Lint → Static code analysis (SonarCloud) → SAST (Semgrep) → Unit tests → Integration tests → Code coverage |
| **build-and-push** | Build Docker image → Trivy image security scan → Push to Docker Hub |
| **e2e-and-dast** | Start app → End-to-end tests → DAST (OWASP ZAP) |
| **deploy** | Pull image → Deploy to EC2 |

### Security Scanning
- **SAST** — Semgrep scans source code for vulnerabilities (XSS, injection, etc.)
- **Static Analysis** — SonarCloud checks code quality and maintainability
- **Image Scan** — Trivy scans the Docker image for CRITICAL/HIGH CVEs before pushing
- **DAST** — OWASP ZAP runs a baseline scan against the live running app

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

### Run Tests

```bash
npm test                   # unit tests
npm run test:integration   # integration tests
npm run test:coverage      # coverage report (unit + integration)
npm run lint               # linting
npm run test:e2e           # e2e tests (requires app running)
```

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
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline
├── tests/
│   ├── unit/
│   │   └── weather.test.js       # Unit tests
│   ├── integration/
│   │   └── routes.test.js        # Integration tests
│   └── e2e/
│       └── app.test.js           # End-to-end tests
├── views/
│   ├── index.html                # Homepage template
│   └── city.html                 # City detail template
├── public/
│   └── style.css                 # Styles
├── index.js                      # Express server & weather logic
├── jest.config.js                # Jest configuration
├── .eslintrc.js                  # ESLint configuration
├── sonar-project.properties      # SonarCloud configuration
├── package.json                  # Project dependencies
├── Dockerfile                    # Docker image config
├── .dockerignore                 # Files excluded from Docker image
├── .env                          # API key (not committed)
└── README.md                     # Project documentation
```

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password |
| `SONAR_TOKEN` | SonarCloud authentication token |
| `EC2_HOST` | EC2 instance public IP |
| `EC2_USER` | EC2 SSH username |
| `EC2_SSH_KEY` | EC2 private SSH key |

## Built With

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Axios](https://axios-http.com/)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Docker](https://www.docker.com/)
- [SonarCloud](https://sonarcloud.io/)
- [Semgrep](https://semgrep.dev/)
- [Trivy](https://trivy.dev/)
- [OWASP ZAP](https://www.zaproxy.org/)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Stanley Obazee**
GitHub: [@Stanleyobazee](https://github.com/Stanleyobazee)
