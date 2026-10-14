
import { Router } from 'express';
import { getCityWeather } from '../lib/weather.js';
import { HttpError } from '../lib/http-error.js';
import {
  parseCity,
  parseCities,
} from '../validators/weather-query.js';

export const weatherRouter = Router();

const attribution =
  'Weather data by Open-Meteo.com (https://open-meteo.com/)';

// GET /api/weather?city=Toronto
weatherRouter.get('/weather', async (req, res, next) => {
  try {
    const city = parseCity(req.query.city);
    const data = await getCityWeather(city);

    res.status(200).json({
      data,
      attribution,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/compare?cities=Toronto,Vancouver,Halifax
weatherRouter.get('/compare', async (req, res, next) => {
  try {
    const cities = parseCities(req.query.cities);

    // Start all city lookups concurrently.
    const results = await Promise.allSettled(
      cities.map((city) => getCityWeather(city))
    );

    const cityResults = results.map((result, index) => {
      const city = cities[index];

      // Successful city lookup.
      if (result.status === 'fulfilled') {
        return {
          city,
          ok: true,
          weather: result.value,
        };
      }

      // Failed city lookup.
      const reason = result.reason;

      return {
        city,
        ok: false,
        error: {
          status:
            reason instanceof HttpError
              ? reason.status
              : 500,
          message:
            reason instanceof HttpError
              ? reason.message
              : 'Internal server error',
        },
      };
    });

    // Count successful and failed lookups.
    const successful = cityResults.filter(
      (item) => item.ok === true
    );

    const failedCities = cityResults.filter(
      (item) => item.ok === false
    );

    const succeeded = successful.length;
    const failed = failedCities.length;

    // Find warmest and coldest cities.
    let warmest = successful[0] ?? null;
    let coldest = successful[0] ?? null;

    for (const city of successful.slice(1)) {
      if (
        city.weather.current.temperatureC >
        warmest.weather.current.temperatureC
      ) {
        warmest = city;
      }

      if (
        city.weather.current.temperatureC <
        coldest.weather.current.temperatureC
      ) {
        coldest = city;
      }
    }

    res.status(200).json({
      data: {
        cities: cityResults,
        summary: {
          succeeded,
          failed,
          warmest: warmest?.weather.location.name ?? null,
          coldest: coldest?.weather.location.name ?? null,
        },
      },
      attribution,
    });
  } catch (error) {
    next(error);
  }
});
