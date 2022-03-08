const crypto = require('crypto');
const fetch = require('cross-fetch');

// Object that will store the weather data of interest from the Weather Link API Response
var weatherData = {
}

/**
 * Gets the current weather data from a station attached to your Weather Link account and return a JSON object containing the response from the API.
 * 
 * @param {number} stationId The stationId that from your Weather Link account that you want to retrieve the current weather condition data from.
 * @return {Object} The JSON object containing the data from the response to the API call.
 */
async function getCurrentWeatherForStation(stationId) {
  // Weather Link API v2 Base URL
  const BASE_URL = process.env.WEATHER_LINK_BASE_API_URL;

  // Your WeatherLink Account API Credentials
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

  // Add every signature parameter to the API Signature
  for (const key in signature_parameters) {
    apiSignature = apiSignature + key + signature_parameters[key]
  }

  // Create HMAC object 
  var hmac = crypto.createHmac('sha256', API_SECRET);

  // Hash the apiSignature for the API call
  var hashedData = hmac.update(apiSignature).digest('hex');

  // Concatenate base portion of URL to make GET request too
  var apiRequestURL = BASE_URL + endpoint + "?";

  // Add parameters to the end of the URL that we will make the GET request too
  for (const key in uri_parameters) {
    apiRequestURL = apiRequestURL + "&" + key + "=" + uri_parameters[key];
  }
  
  // Add apiSignature as final URL parameter to the GET request
  apiRequestURL = apiRequestURL + "&api-signature=" + hashedData;

  // Make a call to the built API URL
  const response = await fetch(apiRequestURL);
  const responseData = await response.json();

  // If the response results in error, throw an error with the JSON object as the error message
  if (response.status != 200) {
    throw new Error(responseData);
  }

  // Convert successful API response into a JSON object and return it
  // TO DO: Return to return responseData??
  return parseWeatherLinkAPIResponse(responseData);
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
 * Returns the string equivalent direction of degree.
 * 
 * Credit: https://stackoverflow.com/questions/61077150/converting-wind-direction-from-degrees-to-text
 * The stackoverflow link was used as a starting point for this function.
 * 
 * Reference: http://snowfence.umn.edu/Components/winddirectionanddegrees.htm
 * 
 * @param {number} dir The direction, in degrees, that should be converted to a string equivalent direction.
 * @return {string} The string equivalent of the direction that was provided in degrees.
 */
function getWindDirectionFromDegrees(dir) {
  // Define array of directions
  directions = [
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

  // Split into the 16 directions
  dir = dir * 16 / 360;

  // Round to nearest integer
  dir = Math.round(dir, 0);

  // Ensure degree is within 0-15 to index array of equivalent string directions
  dir = (dir + 16) % 16;

  // Return the string equivalent of the direction that was provided in degrees
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
  // Check to see if the API call resulted in a failure
  if (data.code != undefined) {
    weatherData.error = data.code;

  } else { // Otherwise, the API call was successful, so parse the data

    // Parse "generated_at" date from the JSON response and store it into weatherData
    weatherData.generated_at = new Date(data.generated_at * 1000).toString();

    // Iterate over every sensor in the data response to parse data
    for (let sensor in data.sensors) {

      // Vantage Pro2 Plus Sensor = 45
      if (data.sensors[sensor].sensor_type == 45) {
        weatherData.temp = data.sensors[sensor].data[0].temp;
        weatherData.dew_point = data.sensors[sensor].data[0].dew_point;
        weatherData.hum = data.sensors[sensor].data[0].hum;
        weatherData.wind_chill = data.sensors[sensor].data[0].wind_chill;
        weatherData.wind_dir_scalar_avg_last_10_min = getWindDirectionFromDegrees(data.sensors[sensor].data[0].wind_dir_scalar_avg_last_10_min);
        weatherData.wind_speed_avg_last_10_min = data.sensors[sensor].data[0].wind_speed_avg_last_10_min;
        weatherData.wind_dir_at_hi_speed_last_10_min = getWindDirectionFromDegrees(data.sensors[sensor].data[0].wind_dir_at_hi_speed_last_10_min);
        weatherData.wind_speed_hi_last_10_min = data.sensors[sensor].data[0].wind_speed_hi_last_10_min;
        weatherData.rainfall_last_24_hr_in = data.sensors[sensor].data[0].rainfall_last_24_hr_in;
        weatherData.rainfall_monthly_in = data.sensors[sensor].data[0].rainfall_monthly_in;
        weatherData.rainfall_year_in = data.sensors[sensor].data[0].rainfall_year_in;
      }

      // Barometer Sensor = 242
      if (data.sensors[sensor].sensor_type == 242) {
        weatherData.bar_absolute = data.sensors[sensor].data[0].bar_absolute;
        weatherData.bar_trend_arrow = getPressureTrendArrow(data.sensors[sensor].data[0].bar_trend);
        weatherData.bar_trend = Math.abs(data.sensors[sensor].data[0].bar_trend);
      }
    }
  }
}

// Set exports for functions to be used in app.js
exports.getCurrentWeatherForStation = getCurrentWeatherForStation;
exports.getPressureTrendArrow = getPressureTrendArrow;
exports.getWindDirectionFromDegrees = getWindDirectionFromDegrees;
exports.parseWeatherLinkAPIResponse = parseWeatherLinkAPIResponse;
exports.weatherData = weatherData;