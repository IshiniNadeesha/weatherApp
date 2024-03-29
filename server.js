// server.js

const express = require('express');
const app = express();

// Dummy weather data for demonstration
const weatherData = [
  { district: 'Colombo', temperature: 28, humidity: 80, air_pressure: 1010, latitude: 6.9271, longitude: 79.8612 },
  { district: 'Kandy', temperature: 25, humidity: 75, air_pressure: 1015, latitude: 7.2906, longitude: 80.6337 },
  // Add more weather data as needed
];

// Endpoint to fetch weather data
app.get('/weather', (req, res) => {
  res.json(weatherData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
