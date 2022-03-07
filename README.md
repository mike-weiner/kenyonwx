# KenyonWX

KenyonWX is a Node.js app to display desired weather data from a weather station connected to your [WeatherLink](https://www.weatherlink.com) account in a clean, simple fashion.

## Table of Contents
- [Built Using](#built-using)
- [Running KenyonWX Locally](#running-kenyonwx-locally)
  - [Install Dependencies](#install-dependencies)
  - [Obtain WeatherLink API Key](#obtain-weatherlink-api-key)
  - [Clone Repo](#clone-repo)
  - [Install npm Packages](#install-npm-packages)
  - [Create Environmental Variables Required by the Project](#create-environmental-variables-required-by-the-project)
  - [Run Project](#run-project)
  -[Modifying What Weather Data is Displayed](#modifying-what-weather-data-is-displayed)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Built Using
KenyonWX was built using:
- [Memcached](https://memcached.org) (v1.6.14+)
- [Node.js](https://nodejs.dev) (v17.4.0+)

## Running KenyonWX Locally
It is easy to get a copy of KenyonWX running locally.

### Install Dependencies
In order to run KenyonWX locally, the following will need to be installed on your development environment:
- [Node.js](https://nodejs.dev) (required)
  - Node.js is required to run KenyonWX
  - **Installation Instructions:** [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com) (required)
  - npm is used to manage the packages needed by KenyonWX to run on top of Node.js
  - **Installation Instructions:** [https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Memcached](https://memcached.org) (optional)
  - Memcached is an recommended, optional dependency used to cache the API response so prevent an API call from being made on every page visit.
  - **Installation Instructions:** [https://devcenter.heroku.com/articles/memcachier#local-usage](https://devcenter.heroku.com/articles/memcachier#local-usage)

### Obtain WeatherLink API Key
This project requires that you have a WeatherLink v2 API Key and Secret. 

The WeatherLink Developer Portal outlines how to get your API key at [https://weatherlink.github.io/v2-api/tutorial](https://weatherlink.github.io/v2-api/tutorial):

> To retrieve your WeatherLink v2 API Key and API Secret you can go to WeatherLink.com and visit the Account page at [https://www.weatherlink.com/account](https://www.weatherlink.com/account).
>
> Once on the Account page you can click the Generate v2 Key button to create a new WeatherLink v2 API Key and API Secret.

### Clone Repo
Navigate to the location on your development machine where you want to place this project's directory and clone the repository by running the following command:

    git clone https://github.com/mike-weiner/kenyonwx.git

### Install npm Packages
KenyonWX requires several packages to run on top of Node.js. Those packages can be installed by running:

    npm install

### Create Environmental Variables Required by the Project
This project requires several environmental variables to be set. Before running the project locally for this first time, you must set the necessary variables.

#### Set NODE_ENV Environment Variable
This project assumes that you are running in a `development` environment. Ensure that your `NODE_ENV` variable is set to `development`. If `NODE_ENV` is **not** set on your machine, Node.js defaults to setting `NODE_ENV` being set to `development`. Read more here: [https://nodejs.dev/learn/nodejs-the-difference-between-development-and-production](https://nodejs.dev/learn/nodejs-the-difference-between-development-and-production). 

If you plan on running this code in a production environment, ensure that all of the project environment variables defined in [Set Project Environment Variables](#set-project-environment-variables) are set within your production environment.

#### Set Project Environment Variables
The Node.js KenyonWX project requires several additional environment variables. Set the values of these variables:
1. Create a file named `.env` in the project root directory.
2. Within the newly created `.env` file, add the content found below. Replace any text contained within `< >` with your own values.

    MEMCACHIER_SERVERS="localhost:<your_desired_memcached_server_port>"
    PORT=<node.js_port_number_on_localhost>
    WEATHER_LINK_API_KEY="<your_weather_link_v2_api_key>"
    WEATHER_LINK_API_SECRET="<your_weather_link_v2_api_secret>"
    WEATHER_LINK_BASE_API_URL="https://api.weatherlink.com/v2/"
    WEATHER_LINK_STATION_ID=<your_weather_station_id_from_weather_link_account>

### Run Project
When you are ready to run the project locally, navigate to the directory with this repository's code on your local machine. 

If you have installed memcached on your local machine, start your local memcached server by running:

    memcached

Start the KenyonWX web app by running:

    npm run start

Visit **localhost:<node.js_port_number_on_localhost>/** to view the weather information pulled from your weather station.

## Modifying What Weather Data is Displayed
You can easily change what weather data is pulled from your WeatherLink weather station by modifying `parseWeatherLinkAPIResponse(data)` within `weather-link.js`. 

You will then also need to update the `views/index.html` view with the updated data that you are pulling from the WeatherLink API response.

Information about what type of weather data is available within the WeatherLink API from different weather stations and sensors can be found here: [https://weatherlink.github.io/v2-api/interactive-sensor-catalog](https://weatherlink.github.io/v2-api/interactive-sensor-catalog).

## Contributing
All contributions are welcome! First, open an issue to discuss what contributions you would like to make. All contributions should be conducted in a `feature/` branch as a PR will be required before any changes are merged into the `main` branch.

## License
Distributed under the MIT License. See `LICENSE.txt` for more information.

## References
- [WeatherLink Developer Portal](https://weatherlink.github.io)
- [WeatherLink Portal](https://www.weatherlink.com)
- [Stackoverflow: Converting Wind direction from degrees to text](https://stackoverflow.com/questions/61077150/converting-wind-direction-from-degrees-to-text)