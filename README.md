
# City Weather API

CPAN 212 – Assignment 1

A REST API built with Node.js and Express that retrieves current weather conditions and a three-day forecast for cities using Open-Meteo.

The application supports weather searches, comparisons between multiple cities, input validation, error handling, and in-memory caching to reduce repeated API requests.

## Run it

### Requirements

- Node.js 24 or later
- npm
- Internet connection

### Installation

1. Clone the repository.

```bash
git clone https://github.com/dheshva2020/cpan212-assignment1-prabu-elangovan.git
cd cpan212-assignment1-prabu-elangovan
```

2. Install dependencies.

```bash
npm install
```

3. Copy the example environment file.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Git Bash, macOS, or Linux:

```bash
cp .env.example .env
```

4. Start the application.

```bash
npm run dev
```

For normal operation:

```bash
npm start
```

The server runs at:

http://localhost:4000

The application also supports default configuration values when `.env` is absent.

## Environment variables

The application uses the following variables from `.env.example`.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port used by the Express server. |
| `GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Base URL for the Open-Meteo geocoding service. |
| `FORECAST_URL` | `https://api.open-meteo.com/v1` | Base URL for the Open-Meteo forecast service. |
| `UPSTREAM_TIMEOUT_MS` | `5000` | Maximum time in milliseconds to wait for an upstream request. |
| `CACHE_TTL_SECONDS` | `600` | Time in seconds before a cached weather result expires. |

Example configuration:

```env
PORT=4000
GEOCODING_URL=https://geocoding-api.open-meteo.com/v1
FORECAST_URL=https://api.open-meteo.com/v1
UPSTREAM_TIMEOUT_MS=5000
CACHE_TTL_SECONDS=600
```

The default upstream timeout is 5 seconds.

The default cache lifetime is 10 minutes.

The `.env` file is excluded from GitHub using `.gitignore`.

## Endpoints

### GET /api/weather

Returns current weather conditions and a three-day forecast for one city.

Example request:

```http
GET /api/weather?city=Toronto
```

Example URL:

http://localhost:4000/api/weather?city=Toronto

Expected successful status: `200 OK`

The response contains a `data` object with:

- `location`: city name, region, country, latitude, longitude, and timezone
- `current`: temperature, feels-like temperature, humidity, wind speed, weather code, and conditions
- `daily`: three-day weather forecast
- `fetchedAt`: timestamp when the weather information was retrieved
- `cached`: whether the result came from the cache

The response also includes Open-Meteo attribution.

The `city` parameter must contain between 2 and 60 characters after trimming whitespace.

Invalid queries return `400 Bad Request`.

A city that cannot be found returns `404 Not Found`.

### GET /api/compare

Compares weather for 2 to 5 cities.

Example request:

```http
GET /api/compare?cities=Toronto,Vancouver,Halifax
```

Example URL:

http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax

Expected successful status: `200 OK`

The response contains:

- Weather information for successful city lookups
- Error information for failed city lookups
- Number of successful requests
- Number of failed requests
- Warmest city
- Coldest city
- Open-Meteo attribution

The API uses `Promise.allSettled()` to run city lookups concurrently.

If one city lookup fails, successful results from other cities are still returned.

Duplicate city names are rejected, including names with different capitalization.

### GET /api/cache/stats

Returns information about the in-memory weather cache.

Example request:

```http
GET /api/cache/stats
```

Example URL:

http://localhost:4000/api/cache/stats

Expected successful status: `200 OK`

The response contains:

- `entries`: number of active cache entries
- `hits`: number of successful cache lookups
- `misses`: number of cache misses
- `ttlSeconds`: configured cache expiration time

Successful weather results are cached using a trimmed, lowercase city name.

Repeated requests can reuse cached weather information until the cache expires.

## Testing

The following ten requests match the testing scenarios specified in the assignment instructions.

On Windows, run these commands in Git Bash.

Start the server first:

```bash
npm run dev
```

### Test 1 — Weather for a city

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/weather?city=Toronto"
```

This retrieves Toronto's current weather and three-day forecast.

### Test 2 — Same city again (cached)

Expected status: `200 OK`

Run this immediately after Test 1, within the cache lifetime.

```bash
curl -i "http://localhost:4000/api/weather?city=Toronto"
```

The response should contain:

```json
"cached": true
```

The `fetchedAt` value should remain the same as Test 1.

### Test 3 — Weather without a city

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/weather"
```

The response should contain an error with `details.city`.

### Test 4 — Weather for a nonexistent city

Expected status: `404 Not Found`

```bash
curl -i "http://localhost:4000/api/weather?city=Qwertyville"
```

The response should indicate that the city could not be found.

### Test 5 — Compare three cities

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"
```

The response should include three city results and a comparison summary.

### Test 6 — Compare with one nonexistent city

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Qwertyville,Halifax"
```

The response should contain two successful lookups and one failed lookup.

### Test 7 — Compare too many cities

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Ottawa,Montreal,Calgary"
```

The API accepts a maximum of five cities.

### Test 8 — Compare duplicate cities

Expected status: `400 Bad Request`

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,toronto"
```

The API rejects duplicate names regardless of capitalization.

### Test 9 — Cache statistics

Expected status: `200 OK`

```bash
curl -i "http://localhost:4000/api/cache/stats"
```

The response should contain `entries`, `hits`, `misses`, and `ttlSeconds`.

### Test 10 — Unknown route

Expected status: `404 Not Found`

```bash
curl -i "http://localhost:4000/api/unknown"
```

The response should contain an error message for the unknown route.

## Data source

Weather and geocoding data are provided by Open-Meteo.

Website: https://open-meteo.com/

Open-Meteo provides the city geocoding and weather forecast services used by this application.

Required attribution:

Weather data by Open-Meteo.com (https://open-meteo.com/)

## AI use

 AI tools to explain a concept and help to find a bug

The application was run and tested locally using Visual Studio Code, Node.js, and a web browser.
