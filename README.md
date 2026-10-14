
# City Weather API

CPAN 212 – Assignment 1

A REST API built using Node.js and Express that retrieves current weather conditions and a three-day weather forecast for cities using the Open-Meteo API.

The application supports city weather searches, comparisons of multiple cities, error handling, input validation, and in-memory caching to reduce unnecessary API requests.

## Run it

### Requirements

- Node.js 24 or later
- npm
- Internet connection

### Installation

1. Clone the GitHub repository.

```bash
git clone https://github.com/YOUR-USERNAME/cpan212-assignment1-prabu-elangovan.git
cd cpan212-assignment1-prabu-elangovan
```

Replace `YOUR-USERNAME` with your actual GitHub username after creating the repository.

2. Install the project dependencies.

```bash
npm install
```

3. Copy `.env.example` to `.env`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On Git Bash, macOS, or Linux:

```bash
cp .env.example .env
```

4. Start the server.

```bash
npm start
```

For development mode with automatic restarting:

```bash
npm run dev
```

By default, the application runs at:

http://localhost:4000

## Environment variables

The following environment variables are provided in `.env.example`.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port used by the Express API server. |
| `GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Base URL for the Open-Meteo geocoding API, used to find city coordinates. |
| `FORECAST_URL` | `https://api.open-meteo.com/v1` | Base URL for the Open-Meteo forecast API, used to retrieve weather data. |
| `UPSTREAM_TIMEOUT_MS` | `5000` | Maximum waiting time for upstream API requests, in milliseconds. |
| `CACHE_TTL_SECONDS` | `600` | Time-to-live for cached weather data, in seconds. |

Default configuration:

```env
PORT=4000
GEOCODING_URL=https://geocoding-api.open-meteo.com/v1
FORECAST_URL=https://api.open-meteo.com/v1
UPSTREAM_TIMEOUT_MS=5000
CACHE_TTL_SECONDS=600
```

The default upstream request timeout is 5 seconds.

The default cache duration is 10 minutes.

The `.env` file should not be committed to GitHub.

## Endpoints

### 1. GET /api/weather

Retrieves current weather conditions and a three-day forecast for a single city.

Example request:

```http
GET /api/weather?city=Toronto
```

Example URL:

http://localhost:4000/api/weather?city=Toronto

Successful response: `200 OK`

The response includes:

- City name, country, latitude, longitude, and timezone
- Current temperature in Celsius
- Feels-like temperature
- Relative humidity
- Wind speed
- Weather conditions
- Three-day forecast
- Fetch timestamp
- Cache status
- Open-Meteo attribution

The `city` query parameter is required and must contain between 2 and 60 characters.

If the requested city does not exist, the API returns `404 Not Found`.

### 2. GET /api/compare

Compares the current weather conditions for multiple cities.

Example request:

```http
GET /api/compare?cities=Toronto,Vancouver,Halifax
```

Example URL:

http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax

Successful response: `200 OK`

The endpoint accepts between 2 and 5 city names separated by commas.

The response includes:

- Weather results for each successful city lookup
- Error information for unsuccessful city lookups
- Number of successful lookups
- Number of failed lookups
- Warmest city
- Coldest city
- Open-Meteo attribution

The API uses `Promise.allSettled()` to process city lookups concurrently.

If one city lookup fails, successful results from other cities are still included in the response.

Duplicate city names are not allowed, including duplicates with different capitalization.

### 3. GET /api/cache/stats

Returns information about the in-memory weather cache.

Example request:

```http
GET /api/cache/stats
```

Example URL:

http://localhost:4000/api/cache/stats

Successful response: `200 OK`

The response includes:

- `entries`: Number of active cached entries
- `hits`: Number of successful cache lookups
- `misses`: Number of cache misses
- `ttlSeconds`: Cache expiration time in seconds

The cache helps reduce repeated requests to Open-Meteo.

## Testing

The following ten test cases exercise the implemented API. They should be checked against the exact ten requests specified on the assignment page before submission.

On Windows, run these commands in Git Bash.

Start the server first:

```bash
npm run dev
```

### Test 1 – Valid city

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/weather?city=Toronto"
```

### Test 2 – Missing city parameter

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/weather"
```

### Test 3 – Empty city parameter

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/weather?city="
```

### Test 4 – City not found

Expected status: `404 Not Found`

```bash
curl -i "http://localhost:4000/api/weather?city=Qwertyville"
```

### Test 5 – Compare three valid cities

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"
```

### Test 6 – Compare cities with one invalid city

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Qwertyville,Halifax"
```

The response should contain two successful results and one failed result.

### Test 7 – Duplicate city names

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,toronto"
```

### Test 8 – Too few cities

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto"
```

### Test 9 – Too many cities

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Ottawa,Montreal,Calgary"
```

### Test 10 – Cache statistics

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/cache/stats"
```

### Additional testing

Request the same city twice:

```bash
curl -i "http://localhost:4000/api/weather?city=Toronto"
curl -i "http://localhost:4000/api/weather?city=Toronto"
```

The second response should normally contain:

```json
"cached": true
```

This confirms that the API is reusing a cached weather result.

## Data source

Weather and geocoding data are provided by Open-Meteo.

Website: https://open-meteo.com/

Open-Meteo provides weather forecast and geocoding services used by this application.

Weather data attribution:

Weather data by Open-Meteo.com (https://open-meteo.com/)

## AI use

AI tool used: ChatGPT by OpenAI.

ChatGPT was used to assist with:

- Understanding the assignment requirements
- Developing Node.js and Express API routes
- Implementing weather data retrieval
- Writing input validation functions
- Implementing in-memory caching
- Handling API errors
- Developing concurrent city comparisons
- Debugging JavaScript syntax errors
- Preparing testing commands
- Writing project documentation

The application was run and tested locally using Visual Studio Code, Node.js, and a web browser.
