const axios = require('axios');
const logger = require('../utils/logger.js');
const weatherLinkUtil = require("../utils/weather-link.js");

export const KW_MEMCACHED_KEY = "kwx-data";
export const KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS = 300;

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export async function fetchWeatherData() {
  try {
    const res = await axios.get(
      `https://api.weatherlink.com/v2/current/${process.env.WEATHER_LINK_STATION_ID}?api-key=${process.env.WEATHER_LINK_API_KEY}`,
      {
        headers: {
          "X-Api-Secret": process.env.WEATHER_LINK_API_SECRET,
        }
      }
    );
    return weatherLinkUtil.parseWeatherLinkAPIResponse(res.data);
  } catch (err) {
    logger.error(err, "An error occurred fetching updated weather data from WeatherLink.")
    throw new Error("Unable to query WeatherLink API");
  }
}

export async function getJsonDataFromCache(mc, key) {
  try {
    const { value } = await mc.get(key);
    if (value != null) {
      return JSON.parse(value.toString('utf-8'));
    }
  } catch (err) {
    logger.error({key: key, error: err}, "An error occurred fetching data from the cache.")
    throw new Error("Unable to query cache");
  }
}

export async function setJsonDataInCache(mc, key, data, expiration) {
  try {
    await mc.set(key, JSON.stringify(data), { expires: expiration });
  } catch (err) {
    logger.error({key: key, error: err}, "An error occurred setting data into the cache.")
    throw new Error("Unable to cache data");
  }
}
