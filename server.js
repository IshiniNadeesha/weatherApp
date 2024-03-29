const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS middleware

const app = express();
app.use(cors()); // Use CORS middleware

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

// Endpoint to fetch weather data
app.get('/weather', async (req, res) => {
  try {
    const weatherData = await Weather.find().sort({ timestamp: -1 }).limit(10); // Example: Retrieve latest 10 records
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
