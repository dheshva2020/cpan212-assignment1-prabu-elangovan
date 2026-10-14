import { HttpError } from '../lib/http-error.js';

// Validate a single city name.
export function parseCity(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Invalid query', {
      city: 'city must be provided exactly once',
    });
  }

  const city = value.trim();

  if (city.length < 2 || city.length > 60) {
    throw new HttpError(400, 'Invalid query', {
      city: 'city must be 2 to 60 characters',
    });
  }

  return city;
}

// Validate a comma-separated list of 2 to 5 cities.
export function parseCities(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, 'Invalid query', {
      cities: 'cities must be provided exactly once',
    });
  }

  const cities = value.split(',').map((city) => city.trim());

  if (cities.length < 2 || cities.length > 5) {
    throw new HttpError(400, 'Invalid query', {
      cities: 'provide between 2 and 5 cities',
    });
  }

  const seen = new Set();

  for (const city of cities) {
    if (city.length < 2 || city.length > 60) {
      throw new HttpError(400, 'Invalid query', {
        cities: 'each city must be 2 to 60 characters',
      });
    }

    const key = city.toLowerCase();

    if (seen.has(key)) {
      throw new HttpError(400, 'Invalid query', {
        cities: `"${city}" is listed more than once`,
      });
    }

    seen.add(key);
  }

  return cities;
}