const axios = require('axios');

const API_KEY = '39961e7bcb1735ec8409d1599b0a5aab';
const CITY_NAME = 'Colombo'; // Replace with the name of the city you want weather data for

const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${API_KEY}&units=metric`;

axios.get(url)
  .then(response => {
    const weatherData = response.data;
    console.log('Weather Data:', weatherData);
  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
  });
