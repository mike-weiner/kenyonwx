const axios = require('axios');
const weatherLinkUtil = require("../utils/weather-link.js");

export const KW_LOG_PREFIX = "[KW]: ";
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
    console.log(KW_LOG_PREFIX + "Failure Making WL API Query", err);
    throw new Error("Unable to query WeatherLink API");
  }
}

export async function getJsonDataFromCache(mc, key) {
  try {
    const { value } = await mc.get(key);
    if (value != null) {
      console.log(KW_LOG_PREFIX + "Cache contained non-null data to return.");
      return JSON.parse(value.toString('utf-8'));
    }
  } catch (err) {
    console.log(KW_LOG_PREFIX + "Failure to Query Cache", err);
    throw new Error("Unable to query cache");
  }
}

export async function setJsonDataInCache(mc, key, data, expiration) {
  try {
    await mc.set(key, JSON.stringify(data), { expires: expiration });
    console.log(KW_LOG_PREFIX + "Successfully updated cache with new data.");
  } catch (err) {
    console.log(KW_LOG_PREFIX + "Error Caching Data", err);
    throw new Error("Unable to cache data");
  }
}
