// Required dependencies of the server
const express = require('express');
const memjs = require('memjs');
const path = require('path');
const weatherLink = require("./weather-link.js");

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

// Set server to listen on specified port
app.listen(port, () => {
  console.log(`${KW_LOG_PREFIX} Server is live at http://localhost:${port}/`)
});

// ROUTE: /
app.get('/', (req, res) => {
  
  // Look for API data in cache
  mc.get(KW_MEMCACHED_KEY, 
    // Callback function after attempting to get KW_MEMCACHED_KEY from memcached server
    function(err, val) {

      if (err == null && val != null) { // Data is in the memcached server
        // Grab data from cache & parse it into a JSON object
        weatherLink.weatherData = JSON.parse(val);

        if (weatherLink.weatherData.error != undefined) { // Check if data had errored when it was requested on API call
          // If so, return the errored view back to the user on the front-end
          res.render(path.join(__dirname, '/views/error.html'), {data:weatherLink.weatherData});
          
        } else {
          // Otherwise, return the homepage that will display data
          res.render(path.join(__dirname, '/views/index.html'), {data:weatherLink.weatherData});
        }

      } else { // Data is not in memcached server (or it has expired), so let's set (or renew) it

        // Call external API to get re-freshed data
        weatherLink.getCurrentWeatherForStation(process.env.WEATHER_LINK_STATION_ID)
        .then(data => {
          // Parse the data returned from the API call
          // TO DO: Remove??
          // weatherLink.parseWeatherLinkAPIResponse(data);

          // Store API data into cache
          mc.set(KW_MEMCACHED_KEY, JSON.stringify(weatherLink.weatherData), {expires:KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS}, 

            // Callback function after setting data in cache
            function(err, val){
              if (err != null && val == null) { // Check for an error when setting data into cache
                console.log(`${KW_LOG_PREFIX} FAIL: Unable to store parsed data from successful API call: ` + err);
              }
            }
          );

          // Check to see if the error object value is set -> this means the API call resulted in error
          if (weatherLink.weatherData.error != undefined) {
            res.render(path.join(__dirname, '/views/error.html'), {data:weatherLink.weatherData});

          } else {
            // Otherwise return the homepage that will display data
            res.render(path.join(__dirname, '/views/index.html'), {data:weatherLink.weatherData});
          }

          console.log(`${KW_LOG_PREFIX} Weather Link API contacted.`);
          
        })
        .catch(error => {
          console.log(`${KW_LOG_PREFIX} FAIL: Failed to get current weather station information: ${error.toString()}`);

          // Pass a failed JSON object to parseWeatherLinkAPIResponse()
          // TO DO: Create new error method?
          // weatherLink.parseWeatherLinkAPIResponse(JSON.parse('{"code": "13"}'));

          // Store ERRORED API data into cache
          // This ensures an API call is not made everything the user refreshes the page anytime an error is displayed
          mc.set(KW_MEMCACHED_KEY, JSON.stringify(weatherLink.weatherData), {expires:KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS}, 

            // Callback function after setting data in cache
            function(err, val){
              if (err != null && val == null) { // Check for an error when setting data into cache
                console.log(`${KW_LOG_PREFIX} FAIL: Unable to store parsed data from failed API call: ${err}`);
              }
            }
          );

          // Return the error view to the front-end user
          res.render(path.join(__dirname, '/views/error.html'), {data:weatherLink.weatherData});
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