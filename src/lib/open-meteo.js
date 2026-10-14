import { config } from '../config.js';
import { HttpError } from './http-error.js';

// Only this file makes requests to Open-Meteo.

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });

    if (!response.ok) {
      throw new HttpError(502, 'Open-Meteo request failed');
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new HttpError(504, 'Weather service timed out');
    }

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      502,
      'Could not get a valid weather response'
    );
  }
}

// Convert a city name into geographic coordinates.
export async function geocodeCity(name) {
  const params = new URLSearchParams({
    name,
    count: '1',
    language: 'en',
    format: 'json',
  });

  const url = `${config.geocodingUrl}/search?${params}`;
  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    throw new HttpError(404, `City not found: ${name}`);
  }

  const city = data.results[0];

  return {
    name: city.name,
    region: city.admin1 ?? null,
    country: city.country ?? null,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

// Get current weather and a 3-day forecast.
export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '3',
  });

  const url = `${config.forecastUrl}/forecast?${params}`;

  return await fetchJson(url);
}