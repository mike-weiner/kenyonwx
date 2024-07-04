# KenyonWX

KenyonWX is a Next.js app to display desired weather data from a weather station connected to your [WeatherLink](https://www.weatherlink.com) account in a clean, simple fashion.

## Table of Contents
- [Built Using](#built-using)
- [Running KenyonWX Locally](#running-kenyonwx-locally)
  - [Install Dependencies](#install-dependencies)
  - [Obtain a WeatherLink API Key](#obtain-a-weatherlink-api-key)
  - [Clone Repo](#clone-repo)
  - [Create Environmental Variables Required by the Project](#create-environmental-variables-required-by-the-project)
  - [Run the Project](#run-the-project)
  - [Modifying What Weather Data is Displayed](#modifying-what-weather-data-is-displayed)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Built Using
KenyonWX was built using:
- [Memcached](https://memcached.org) (v1.6.29+)
- [Next.js](https://nextjs.org) (v14.2.0+)
- [Tailwind CSS](https://tailwindcss.com) (v3.4.0+)

## Running KenyonWX Locally
It is easy to get a copy of KenyonWX running locally.

### Install Dependencies
In order to run KenyonWX locally, the following will need to be installed on your development environment:
- [Docker Desktop](https://docs.docker.com/desktop/) (required)
  - **Installation Instructions:** [https://docs.docker.com/desktop/](https://docs.docker.com/desktop/)
  - If you choose not to install Docker Desktop, at a minimum you will need to install the Docker Engine and Docker Compose.

### Obtain a WeatherLink API Key
This project requires that you have a WeatherLink v2 API Key and Secret. 

The WeatherLink Developer Portal outlines how to get your API key at [https://weatherlink.github.io/v2-api/tutorial](https://weatherlink.github.io/v2-api/tutorial):

> To retrieve your WeatherLink v2 API Key and API Secret you can go to WeatherLink.com and visit the Account page at [https://www.weatherlink.com/account](https://www.weatherlink.com/account).
>
> Once on the Account page you can click the Generate v2 Key button to create a new WeatherLink v2 API Key and API Secret.

### Clone Repo
Navigate to the location on your development machine where you want to place this project's directory and clone the repository by running the following command:

    git clone https://github.com/mike-weiner/kenyonwx.git

### Create Environmental Variables Required by the Project
This project requires several environmental variables to be set. Before running the project locally for this first time, you must set the necessary variables.

#### Set Project Environment Variables
The Next.js KenyonWX project requires several additional environment variables. Set the values of these variables:
1. Create a file named `.env.local` in the project's root directory.
2. Within the newly created `.env.local` file, add the content found below. Replace any text contained within `< >` with your own values.

  ```
  MEMCACHEDCLOUD_SERVERS=memcached:11211
  WEATHER_LINK_API_KEY="<your_weather_link_v2_api_key>"
  WEATHER_LINK_API_SECRET="<your_weather_link_v2_api_secret>"
  WEATHER_LINK_BASE_API_URL="https://api.weatherlink.com/v2/"
  WEATHER_LINK_STATION_ID=<your_weather_station_id_from_weather_link_account>
  WEATHER_LINK_SUMMARY_URL=<your_weather_station_weather_link_live_summary_url>
  ```

### Run the Project
When you are ready to run the project locally:

1. Ensure `docker` is started on your machine.
1. Navigate to the root of this project's directory on your machine.
1. Run `make up`.
   - This will use `docker compose` to start both the front-end web application and the backend instance of `memcached` for you.
   - By default, port `3000` is used for the web application. You can specify a different port (so long that it is not used) by running `make up PORT=xxxx` where `xxxx` is your numerical port number (e.g. `3001`)
1. Once the `make up` command completes, visit `localhost:3000` in your browser and you should see the website running on your local machine using your own weather station's data!
1. Remember that if you change any of the code locally, you will need to re-build the container running the front-end web application. You can do this by running `make rebuild`.
1. When you are done, you can run `make down` and all Docker resources will be cleaned up for you.

## Modifying What Weather Data is Displayed
You can easily change what weather data is pulled from your WeatherLink weather station by modifying `parseWeatherLinkAPIResponse(data)` within `/src/utils/weather-link.js`. 

You will then also need to update the `/src/pages/index.js` view with the updated data that you are pulling from the WeatherLink API response.

Information about what type of weather data is available within the WeatherLink API from different weather stations and sensors can be found here: [https://weatherlink.github.io/v2-api/interactive-sensor-catalog](https://weatherlink.github.io/v2-api/interactive-sensor-catalog).

Don't forget to re-build your container (`make rebuild`) for your changes to take effect on your local environment.

## Contributing
All contributions are welcome! First, open an issue to discuss what contributions you would like to make. All contributions should be conducted in a `feature/` branch as a PR will be required before any changes are merged into the `main` branch.

## License
Distributed under the MIT License. See `LICENSE.txt` for more information.

## References
- [WeatherLink Developer Portal](https://weatherlink.github.io)
- [WeatherLink Portal](https://www.weatherlink.com)
- [Stackoverflow: Converting Wind direction from degrees to text](https://stackoverflow.com/questions/61077150/converting-wind-direction-from-degrees-to-text)
