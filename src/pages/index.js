import Head from 'next/head';
import { useState, useEffect } from 'react';

import StatPack from '../components/Packs/StatPack';
import BottomBanner from '../components/BottomBanner';
import FailureDialog from '../components/Dialog/Nondismissable/Failure';
import WideSlideover from '../components/Slideover/Wide';

const axios = require('axios');
const memjs = require('memjs');

const weatherLinkUtil = require("../utils/weather-link.js");

export default function Homepage(props) {
  const [fetchingData, setFetchingData] = useState(true);

  const [openDebugSlideover, setOpenDebugSlideover] = useState(false);
  const closeDebugSlideover = () => setOpenDebugSlideover(false);

  const [temp, setTemp] = useState(0.0);
  const [pressureData, setPressureData] = useState([]);
  const [waterContentData, setWaterContentData] = useState([]);
  const [windData, setWindData] = useState([]);
  const [precipData, setPrecipData] = useState([]);

  useEffect(() => {
    if (props.error.title !== "") {
      return;
    }

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
        { name: 'Wind', stat: props.wxData.wind_dir_scalar_avg_last_10_min + " @ " + props.wxData.wind_speed_avg_last_10_min, unit: ' MPH' },
        { name: 'Wind Gust', stat: props.wxData.wind_dir_at_hi_speed_last_10_min + " @ " + props.wxData.wind_speed_hi_last_10_min, unit: ' MPH' },
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

      {
        props.error.title !== "" ?
          <FailureDialog
            title={props.error.title || "An Error Occurred"}
            msg={props.error.msg || "An error has occurred. Please contact a site administrator."}
          />
          :
          null
      }

      <div className="p-8 pb-24 space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
              onClick={() => setOpenDebugSlideover(true)}
            >
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

        <WideSlideover 
          open={openDebugSlideover}
          onClose={closeDebugSlideover}
          title="Debug Data"
        >
          <pre>
            {JSON.stringify(props.wxData, null, 2)}
          </pre>
        </WideSlideover>

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

        {
          !fetchingData ?
            <BottomBanner msg={"Weather Measurements Taken @ " + props.wxData.generated_at} />
            :
            null
        }

      </div>
    </>
  );
}

export async function getServerSideProps(context) {

  const KW_LOG_PREFIX = "[KW]: ";
  const KW_MEMCACHED_KEY = "kwx-data";
  const KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS = 300;

  let error = {
    title: "",
    msg: "",
  };

  let mc = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
    username: process.env.MEMCACHEDCLOUD_USERNAME,
    password: process.env.MEMCACHEDCLOUD_PASSWORD,
  });

  let dataInCache = false;

  try {
    let { value } = await mc.get(KW_MEMCACHED_KEY);
    if (value != null) {
      dataInCache = true;

      let parsedCacheData = JSON.parse(value.toString('utf-8'));

      return {
        props: {
          wxData: parsedCacheData.wxData,
          error: parsedCacheData.error,
        },
      }
    }
  } catch (err) {
    console.log(KW_LOG_PREFIX + "Failure to Query Cache", err);
    
    return {
      props: {
        wxData: {},
        error: {
          title: "Failure to Query Cache",
          msg: "Unable to retrieve cached data. Please contact a site administrator to have the issue investigated."
        }
      }
    }
  }

  if (!dataInCache) {
    console.log(KW_LOG_PREFIX + "Making External WL API Query");

    try {
      var res = await axios.get(
        "https://api.weatherlink.com/v2/current/" + process.env.WEATHER_LINK_STATION_ID + "?api-key=" + process.env.WEATHER_LINK_API_KEY,
        {
          headers: {
            "X-Api-Secret": process.env.WEATHER_LINK_API_SECRET,
          }
        }
      );
    } catch (err) {
      console.log(KW_LOG_PREFIX + "Failure Making WL API Query", err)
      
      return {
        props: {
          wxData: {},
          error: {
            title: "Failure Making WL API Query",
            msg: "Unable to query WeatherLink API for up-to-date data. Please contact a site administrator to have the issue investigated.",
          }
        }
      }
    }

    try {
      var parsedWeatherData = weatherLinkUtil.parseWeatherLinkAPIResponse(res.data);

      let dataToCache = {
        wxData: parsedWeatherData, 
        error: error,
      }

      let { value } = await mc.set(
        KW_MEMCACHED_KEY,
        JSON.stringify(dataToCache),
        { expires: KW_MEMCACHED_TIMEOUT_DURATION_IN_SECONDS }
      );

    } catch (error) {
      console.log(KW_LOG_PREFIX + "Error Caching Data", err)
      error = {
        title: 'Error Caching Data',
        msg: "Unable to cache WL data. Please contact a site administrator.",
      }
    }
  }

  return {
    props: {
      wxData: parsedWeatherData,
      error: error,
    },
  }
}