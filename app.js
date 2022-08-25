// Required dependencies of the server
const axios = require('axios');
const express = require('express');
const memjs = require('memjs');
const path = require('path');
const weatherLinkUtil = require("./weather-link-utils.js");

// Import and configure environment variables for a development environment
if (process.env.NODE_ENV == "development") {
  require('dotenv').config();
}

// Initialize express server
const app = express();
const port = process.env.PORT; // Define the port that our express server will listen on

// Establish connection with memcached server
var mc = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
  username: process.env.MEMCACHEDCLOUD_USERNAME,
  password: process.env.MEMCACHEDCLOUD_PASSWORD,
});

// Serve Static Files such as Images, Stylesheets, and JS Scripts
app.use(express.static(__dirname + '/public'));

// Set EJS as the template engine for the server
app.engine('html', require('ejs').renderFile);

// Server constants
const KW_LOG_PREFIX = "[KWX]:";
const KW_MEMCACHED_KEY = "kwx-data";
const KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS = 300;

/**
 * A helper function to determine if the incoming request is secure.
 * Credit to: https://www.javaniceday.com/post/redirect-all-requests-from-http-to-https-in-node-js-and-express
 * 
 * @param {Object} Incoming request to the server
 * @returns {boolean} Returns true if the http request is secure (comes form https), false otherwise
 */
 function isSecure(req) {
  if (req.headers['x-forwarded-proto']) {
    return req.headers['x-forwarded-proto'] === 'https';
  }
  return req.secure;
};

// Set server to listen on specified port
app.listen(port, () => {
  console.log(`${KW_LOG_PREFIX} Server is live at http://localhost:${port}/`)
});

// Automatically redirect any page form http to https
// Credit to https://www.javaniceday.com/post/redirect-all-requests-from-http-to-https-in-node-js-and-express
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !isSecure(req)) {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

// ROUTE: /
app.get('/', (req, res) => {
  
  // Look for API data in cache
  mc.get(KW_MEMCACHED_KEY, 
    function(err, val) { // Callback function after attempting to get KW_MEMCACHED_KEY from memcached server

      if (err == null && val != null) { // Data is in the memcached server
        var jsonWeatherDataObject = JSON.parse(val);

        // Check if the weather data had errored out when it was requested on the original API call
        if (jsonWeatherDataObject.error != undefined) {
          
          // If so, return the error to the user on the front-end
          res.render(path.join(__dirname, '/views/error.html'), {data: jsonWeatherDataObject, weatherLinkSummaryURL: process.env.WEATHER_LINK_SUMMARY_URL});
        } else {
          res.render(path.join(__dirname, '/views/index.html'), {data: jsonWeatherDataObject, weatherLinkSummaryURL: process.env.WEATHER_LINK_SUMMARY_URL});
        }

      } else { // Data is not in memcached server (or it has expired), so let's set (or renew) it

        // Make a request for a user with a given ID
        axios.get(weatherLinkUtil.getApiUrlForCurrentStationWeather(process.env.WEATHER_LINK_STATION_ID))
        .then(function (response) {
          let parsedWeatherData = weatherLinkUtil.parseWeatherLinkAPIResponse(response.data);

          // Parse the data returned from the API call and store the weather data into cache
          mc.set(KW_MEMCACHED_KEY, JSON.stringify(parsedWeatherData), {expires: KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS}, 

            // Callback function after setting data in cache
            function(err, val){
              
              // Check for an error when setting data into cache
              if (err != null && val == null) {
                throw new Error ('Fail: Unable to cache API response');

              } else { // Otherwise, refresh front-end view with new data
                
                // Check to see if the error object value is set
                if (parsedWeatherData.error != undefined) {
                  // If so, return the error to the user on the front-end
                  res.render(path.join(__dirname, '/views/error.html'), {data: parsedWeatherData});

                } else {
                  // Otherwise, return the homepage that will display weather data
                  res.render(path.join(__dirname, '/views/index.html'), {data: parsedWeatherData, weatherLinkSummaryURL: process.env.WEATHER_LINK_SUMMARY_URL});
                }
              }
            }
          );
        })
        .catch(function (error) {
          console.log(`${KW_LOG_PREFIX} FAIL: Unexpected error during GET request or caching of API response: ` + error);

          let errorData = weatherLinkUtil.parseWeatherLinkAPIResponse(JSON.parse('{"code": "500 - Unexpected Error"}'));

          // Pass a failed JSON object to parseWeatherLinkAPIResponse() and store ERRORED weather data into cache
          // This ensures an API call is not made every time the user refreshes the page when an error is displayed
          mc.set(KW_MEMCACHED_KEY, JSON.stringify(errorData), {expires: KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS}, 

            // Callback function after setting data in cache
            function(err, val){

              // Check for an error when setting data into cache
              if (err != null && val == null) {
                console.log(`${KW_LOG_PREFIX} FAIL: Unable to cache error message: ${error}`);
              }
            }
          );

          res.render(path.join(__dirname, '/views/error.html'), {data: errorData});
        });
      }
    }
  )
});

// Catch all other random requests
app.get('*', (req, res) => {
  // If the user accepts HTML, redirect then back to the Homepage
  if (req.accepts('html')) {
    res.redirect(307, '/')
    return;
  }

  // If the user only accepts JSON, return then an error message in JSON
  if (req.accepts('json')) {
    res.json({ error: `Cannot GET ${req.url}` });
    return;
  }

  // For all other inoperable requests, return a basic text message with an error
  res.status(404);
  res.type('txt');
  res.send(`Cannot GET ${req.url}`);
});