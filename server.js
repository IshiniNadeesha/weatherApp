const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios'); // Use Axios instead of node-fetch
const cron = require('node-cron');
const cors = require('cors');

const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/weather_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Weather schema
const weatherSchema = new mongoose.Schema({
  district: String,
  temperature: Number,
  humidity: Number,
  air_pressure: Number,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
});

const Weather = mongoose.model('Weather', weatherSchema);

// Schedule task to fetch weather data every 2 minutes
cron.schedule('*/2 * * * *', async () => {
  try {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Colombo&appid=39961e7bcb1735ec8409d1599b0a5aab&units=metric');
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();

    // Save weather data to MongoDB
    const weatherData = new Weather({
      district: 'Colombo', // Example: Set the district name
      temperature: data.main.temp,
      humidity: data.main.humidity,
      air_pressure: data.main.pressure,
      latitude: data.coord.lat,
      longitude: data.coord.lon
    });
    await weatherData.save();
    console.log('Weather data saved to MongoDB:', weatherData);
  } catch (error) {
    console.error('Error fetching or saving weather data:', error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
