
import Head from 'next/head';
import { useState, useEffect } from 'react';

import StatPack from '../components/Packs/StatPack';
import BottomBanner from '../components/BottomBanner';

const axios = require('axios');
const memjs = require('memjs');

const weatherLinkUtil = require("../utils/weather-link.js");

export default function Homepage(props) {
  const [fetchingData, setFetchingData] = useState(true);

  const [temp, setTemp] = useState(0.0);
  const [pressureData, setPressureData] = useState([]);
  const [waterContentData, setWaterContentData] = useState([]);
  const [windData, setWindData] = useState([]);
  const [precipData, setPrecipData] = useState([]);

  useEffect(() => {
    setPressureData(
      [
        { name: 'Absolute Pressure', stat: props.wxData.bar_absolute + '"', includeTrend: true, change: props.wxData.bar_trend, changeType: props.wxData.bar_trend >= 0 ? 'increase' : 'decrease' },
        { name: 'Relative Pressure', stat: props.wxData.bar_sea_level + '"', includeTrend: true, change: props.wxData.bar_trend, changeType: props.wxData.bar_trend >= 0 ? 'increase' : 'decrease' },
      ]
    );

    setWaterContentData(
      [
        { name: 'Dew Point', stat: props.wxData.dew_point, unit: '°F' },
        { name: 'Humidity', stat: props.wxData.hum, unit: '%' },
      ]
    );

    setWindData(
      [
        { name: 'Wind', stat: props.wxData.wind_dir_at_hi_speed_last_10_min + " @ " + props.wxData.wind_speed_hi_last_10_min, unit: ' MPH' },
        { name: 'Wind Gust', stat: props.wxData.wind_dir_scalar_avg_last_10_min + " @ " + props.wxData.wind_speed_avg_last_10_min, unit: ' MPH' },
        { name: 'Wind Chill', stat: props.wxData.wind_chill, unit: '°F' }
      ]
    );

    setPrecipData(
      [
        { name: 'Rainfall (24 HR)', stat: props.wxData.rainfall_last_24_hr_in, unit: '"' },
        { name: 'Rainfall (Month)', stat: props.wxData.rainfall_monthly_in, unit: '"' },
        { name: 'Rainfall (YTD)', stat: props.wxData.rainfall_year_in, unit: '"' },
      ]
    );

    setTemp(props.wxData.temp + "°F")

    setFetchingData(false)
  }, []);

  return (
    <>
      <Head>
        <title>Home - KenyonWX</title>

        <meta name="title" property="og:title" content="Home - KenyonWX" />
        <meta name="description" property="og:description" content="The current weather conditions from a private weather station near Kenyon, MN." />

        <meta property="og:url" content="https://kenyonwx.com" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary"></meta>
      </Head>

      <div className="p-8 pb-24 space-y-8">

        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Kenyon, MN
            </h1>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            {
              fetchingData ?
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 bg-slate-200 rounded px-16"></div>
                  </div>
                </div>
                :
                <p className="inline-flex items-center rounded-md  py-2 text-3xl">{temp}</p>
            }
          </div>
        </div>

        <StatPack
          isLoading={fetchingData}
          stats={pressureData}
          title="Atmospheric Pressure"
        />

        <StatPack
          isLoading={fetchingData}
          stats={waterContentData}
          title="Atmospheric Water Content"
        />

        <StatPack
          isLoading={fetchingData}
          stats={windData}
          title="Wind Conditions"
        />

        <StatPack
          isLoading={fetchingData}
          stats={precipData}
          title="Precipitation"
        />

        <BottomBanner msg={"Weather Measurements Taken @ " + props.wxData.generated_at} />

      </div>
    </>
  );
}

export async function getServerSideProps(context) {

  var mc = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
    username: process.env.MEMCACHEDCLOUD_USERNAME,
    password: process.env.MEMCACHEDCLOUD_PASSWORD,
  });

  const KW_MEMCACHED_KEY = "kwx-data";
  const KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS = 300;

  let dataInCache = false;

  var { err, value } = await mc.get(KW_MEMCACHED_KEY);
  if (err == null && value != null) {
    dataInCache = true;
    return {
      props: {
        wxData: JSON.parse(value.toString('utf-8')),
      },
    }
  }

  let parsedWeatherData = {};

  if (err == null && !dataInCache) {
    const res = await axios.get(
      "https://api.weatherlink.com/v2/current/" + process.env.WEATHER_LINK_STATION_ID + "?api-key=" + process.env.WEATHER_LINK_API_KEY,
      {
        headers: {
          "X-Api-Secret": process.env.WEATHER_LINK_API_SECRET,
        }
      }
    );

    parsedWeatherData = weatherLinkUtil.parseWeatherLinkAPIResponse(res.data);

    mc.set(
      KW_MEMCACHED_KEY,
      JSON.stringify(parsedWeatherData),
      { expires: KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS }
    );
  }

  return {
    props: {
      wxData: parsedWeatherData,
    },
  }
}