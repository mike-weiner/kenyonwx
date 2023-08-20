/**
 * Returns the string equivalent direction of a direction in a integer degree.
 * 
 * Credit: https://stackoverflow.com/questions/61077150/converting-wind-direction-from-degrees-to-text
 * The Stack Overflow link was used as a starting point for this function.
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

    // Iterate over every sensor in the data response to parse data
    for (let sensor in data.sensors) {

      // Vantage Vue ISS = 37
      if (data.sensors[sensor].sensor_type == 37) {
        weatherDataToReturn.temp = data.sensors[sensor].data[0].temp;
        weatherDataToReturn.heat_index = data.sensors[sensor].data[0].heat_index;
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
        weatherDataToReturn.generated_at = new Date(data.sensors[sensor].data[0].ts * 1000).toISOString();
      }

      // Barometer Sensor = 242
      if (data.sensors[sensor].sensor_type == 242) {
        weatherDataToReturn.bar_absolute = data.sensors[sensor].data[0].bar_absolute;
        weatherDataToReturn.bar_sea_level = data.sensors[sensor].data[0].bar_sea_level;
        weatherDataToReturn.bar_trend = data.sensors[sensor].data[0].bar_trend ? Math.abs(data.sensors[sensor].data[0].bar_trend) : "--";
      }
    }
  }

  return weatherDataToReturn;
}

// Set exports for functions to be used in app.js
exports.parseWeatherLinkAPIResponse = parseWeatherLinkAPIResponse;