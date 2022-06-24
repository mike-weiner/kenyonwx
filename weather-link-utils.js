const crypto = require('crypto');

/**
 * Build and return the API request URL to pull data from a station attached to your Weather Link account.
 * 
 * @param {number} stationId The stationId that from your Weather Link account that you want to retrieve the current weather condition data from.
 * @return {String} The string to make the API call with to retrieve the requested data.
 */
function getApiUrlForCurrentStationWeather(stationId) {
  const BASE_URL = process.env.WEATHER_LINK_BASE_API_URL;
  const API_KEY = process.env.WEATHER_LINK_API_KEY;
  const API_SECRET = process.env.WEATHER_LINK_API_SECRET;

  // API v2 Endpoint URL
  // https://weatherlink.github.io/v2-api/api-reference
  var endpoint = "current/" + stationId;

  // Signature parameters need to be added in ALPHABETICAL order
  var signature_parameters = {
    "api-key": API_KEY,
    "station-id": String(stationId),
    "t": String(Math.round(Date.now() / 1000))
  }

  // URI parameters need to be added in ALPHABETICAL order
  var uri_parameters = {
    "api-key": API_KEY,
    "t": String(Math.round(Date.now() / 1000))
  }

  // String that will store the API Signature
  var apiSignature = "";

  for (const key in signature_parameters) {
    apiSignature = apiSignature + key + signature_parameters[key]
  }

  var hmac = crypto.createHmac('sha256', API_SECRET);
  var hashedData = hmac.update(apiSignature).digest('hex');

  var apiRequestURL = BASE_URL + endpoint + "?";
  for (const key in uri_parameters) {
    apiRequestURL = apiRequestURL + "&" + key + "=" + uri_parameters[key];
  }
  apiRequestURL = apiRequestURL + "&api-signature=" + hashedData;

  return apiRequestURL;
}

/**
 * Returns ↑ or ↓ depending whether the value of pressure is positive or negative.
 * 
 * @param {number} pressure The current value of the pressure in the atmosphere.
 * @return {string} The string ↑ or ↓ depending on whether pressure was positive or negative.
 */
function getPressureTrendArrow(pressure) {
  if (pressure > 0) {
    return "↑";
  } else {
    return "↓";
  }
}

/**
 * Returns the string equivalent direction of a direction in a integer degree.
 * 
 * Credit: https://stackoverflow.com/questions/61077150/converting-wind-direction-from-degrees-to-text
 * The stackoverflow link was used as a starting point for this function.
 * 
 * Reference: http://snowfence.umn.edu/Components/winddirectionanddegrees.htm
 * 
 * @param {number} dir The direction, in degrees (integer), that should be converted to a string equivalent direction.
 * @return {string} The string equivalent of the direction that was provided in degrees.
 */
function getWindDirectionFromDegrees(dir) {
  let directions = [
    "N", 
    "NNE", 
    "NE", 
    "ENE", 
    "E", 
    "ESE", 
    "SE", 
    "SSE", 
    "S", 
    "SSW", 
    "SW", 
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW"
  ];
  
  dir = dir * 16 / 360; // Split into one of the 16 directions
  dir = Math.round(dir, 0);
  dir = (dir + 16) % 16; // Ensures degree is within 0-15 to index array of equivalent string directions

  return (directions[dir]);
}

/**
 * Parse the Weather Link API response and populate the global weatherData array.
 * 
 * Reference: https://weatherlink.github.io/v2-api/
 * 
 * @param {Object} data A JSON object containing the Weather Link API response.
 */
 function parseWeatherLinkAPIResponse(data) {
  let weatherDataToReturn = {};

  // Check to see if the API call resulted in a failure
  if (data.code != undefined) {
    weatherDataToReturn.error = data.code;

  } else { // Otherwise, the API call was successful, so parse the data

    // Parse "generated_at" date from the JSON response and store it into weatherDataToReturn
    weatherDataToReturn.generated_at = new Date(data.generated_at * 1000).toISOString();

    // Iterate over every sensor in the data response to parse data
    for (let sensor in data.sensors) {

      // Vantage Pro2 Plus Sensor = 45
      if (data.sensors[sensor].sensor_type == 45) {
        weatherDataToReturn.temp = data.sensors[sensor].data[0].temp;
        weatherDataToReturn.dew_point = data.sensors[sensor].data[0].dew_point;
        weatherDataToReturn.hum = data.sensors[sensor].data[0].hum;
        weatherDataToReturn.wind_chill = data.sensors[sensor].data[0].wind_chill;
        weatherDataToReturn.wind_dir_scalar_avg_last_10_min = getWindDirectionFromDegrees(data.sensors[sensor].data[0].wind_dir_scalar_avg_last_10_min);
        weatherDataToReturn.wind_speed_avg_last_10_min = data.sensors[sensor].data[0].wind_speed_avg_last_10_min;
        weatherDataToReturn.wind_dir_at_hi_speed_last_10_min = getWindDirectionFromDegrees(data.sensors[sensor].data[0].wind_dir_at_hi_speed_last_10_min);
        weatherDataToReturn.wind_speed_hi_last_10_min = data.sensors[sensor].data[0].wind_speed_hi_last_10_min;
        weatherDataToReturn.rainfall_last_24_hr_in = data.sensors[sensor].data[0].rainfall_last_24_hr_in;
        weatherDataToReturn.rainfall_monthly_in = data.sensors[sensor].data[0].rainfall_monthly_in;
        weatherDataToReturn.rainfall_year_in = data.sensors[sensor].data[0].rainfall_year_in;
      }

      // Barometer Sensor = 242
      if (data.sensors[sensor].sensor_type == 242) {
        weatherDataToReturn.bar_absolute = data.sensors[sensor].data[0].bar_absolute;
        weatherDataToReturn.bar_trend_arrow = getPressureTrendArrow(data.sensors[sensor].data[0].bar_trend);
        weatherDataToReturn.bar_trend = Math.abs(data.sensors[sensor].data[0].bar_trend);
      }
    }
  }

  return weatherDataToReturn;
}

// Set exports for functions to be used in app.js
exports.getApiUrlForCurrentStationWeather = getApiUrlForCurrentStationWeather;
exports.parseWeatherLinkAPIResponse = parseWeatherLinkAPIResponse;