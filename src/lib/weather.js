import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

const cache = new TtlCache(config.cacheTtlSeconds);

export async function getCityWeather(city) {
  const key = city.trim().toLowerCase();

  const saved = cache.get(key);

  if (saved !== undefined) {
    return {
      ...saved,
      cached: true,
    };
  }

  const location = await geocodeCity(city);

  const forecast = await getForecast(
    location.latitude,
    location.longitude
  );

  const current = {
    time: forecast.current.time,
    temperatureC: forecast.current.temperature_2m,
    feelsLikeC: forecast.current.apparent_temperature,
    humidityPercent: forecast.current.relative_humidity_2m,
    windKmh: forecast.current.wind_speed_10m,
    weatherCode: forecast.current.weather_code,
    conditions: describeWeatherCode(
      forecast.current.weather_code
    ),
  };

  const daily = forecast.daily.time.map((date, index) => ({
    date,
    minC: forecast.daily.temperature_2m_min[index],
    maxC: forecast.daily.temperature_2m_max[index],
    precipitationChancePercent:
      forecast.daily.precipitation_probability_max[index] ?? null,
    weatherCode: forecast.daily.weather_code[index],
    conditions: describeWeatherCode(
      forecast.daily.weather_code[index]
    ),
  }));

  const result = {
    location,
    current,
    daily,
    fetchedAt: new Date().toISOString(),
    cached: false,
  };

  cache.set(key, result);

  return result;
}

export function getCacheStats() {
  return cache.stats();
}