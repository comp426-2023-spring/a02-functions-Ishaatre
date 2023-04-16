#!/usr/bin/env node

import minimist from 'minimist';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

//get the args object from argv and using minimist
const args = minimist(process.argv.slice(2));

//following function is responsible for printing out help when supplied with -h
function printHelp() {
    console.log(
        `Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
            -h            Show this help message and exit.
            -n, -s        Latitude: N positive; S negative.
            -e, -w        Longitude: E positive; W negative.
            -z            Time zone: uses tz.guess() from moment-timezone by default.
            -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
            -j            Echo pretty JSON from open-meteo API and exit.`
        );
    process.exit(0);
  }

  if (args.h) {
    printHelp();
  }

  //this is async function responsible for getting weather data asynchronously
  async function getWeatherData(latitude, longitude, timezone, day) {
    // create API URL using the parameters
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=${timezone}`
  
    // verify the input parameters
    if ((!latitude || !longitude) && !args.j) {
        console.error('Error: Latitude and longitude must be provided.');
        printHelp();
      }

    try {
      // use fetch function to get data from the url
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (args.j) {
        console.log(JSON.stringify(data, null, 2));
        process.exit(0);
      }
  
      // Return the weather data for the specified day
      return data.daily.precipitation_hours[day];
    } catch (error) {
      console.error('Error fetching weather data:', error);
      process.exit(1);
    }
  }


  //following is an async main function responsible for executing the process
  async function main() {
    // handle command line arguments and set defaults
    const latitude = args.n || args.s;
    const longitude = args.e || args.w;
    const timezone = args.z || moment.tz.guess();
    const day = args.d !== undefined ? args.d : 1;

  
    // get weather data and print the result
    const precipitationHours = await getWeatherData(latitude, longitude, timezone, day);

    console.log(precipitationHours > 0 ? "You might need your galoshes " : "You will not need your galoshes ");
  
    if (day === 0) {
      console.log("today.");
    } else if (day > 1) {
      console.log("in " + day + " days.");
    } else {
      console.log("tomorrow.");
    }
  }
  
  main();
	
