const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(cors());

// Define Swagger options
const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Real-Time Weather API',
      version: '1.0.0',
      description: 'API documentation for the Real-Time Weather application',
    },
    servers: [
      {
        url: 'https://polar-lake-41582-635243186dd0.herokuapp.com', 
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Connect to MongoDB
mongoose.connect("mongodb+srv://ishini99:ishini1999@cluster0.rhzdeka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
}).then(() => {
  console.log("Connected to MongoDB Atlas successfully!");
}).catch(err => {
  console.error("Error connecting to MongoDB Atlas:", err);
});


// Define the Weather schema
const weatherSchema = new mongoose.Schema({
  district: String,
  temperature: Number,
  humidity: Number,
  air_pressure: Number,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
});

// Create the Weather model
const Weather = mongoose.model('Weather', weatherSchema);

// List of cities with their coordinates
const cities = [
  { name: 'Colombo', lat: 6.927079, lon: 79.861244 },
      { name: 'Kandy', lat: 7.2906, lon: 80.6337 },
      { name: 'Trincomalee', lat: 8.592200, lon: 81.196793 },
      { name: 'Jaffna', lat: 9.6615, lon: 80.0255 },
      { name: 'Galle', lat: 6.053519, lon: 80.220978 },
      { name: 'Kilinochchi', lat: 9.3803, lon: 80.3770 },
      { name: 'Mannar', lat: 8.9810, lon: 79.9044 },
      { name: 'Mullaitivu', lat: 9.2671, lon: 80.8142 },
      { name: 'Vavuniya', lat: 8.7542, lon: 80.4982 },
      { name: 'Puttalam', lat: 8.0408, lon: 79.8394 },
      { name: 'Kurunegala', lat: 7.4818, lon: 80.3609 },
      { name: 'Gampaha', lat: 7.0840, lon: 80.0098 },
      { name: 'Kalutara', lat: 6.5854, lon: 79.9607 },
      { name: 'Anuradhapura', lat: 8.3114, lon: 80.4037 },
      { name: 'Polonnaruwa', lat: 7.9403, lon: 81.0188 },
      { name: 'Matale', lat: 7.4675, lon: 80.6234 },
      { name: 'Nuwara Eliya', lat: 6.9497, lon: 80.7891 },
      { name: 'Kegalle', lat: 7.2513, lon: 80.3464 },
      { name: 'Batticaloa', lat: 7.7249, lon: 81.6967 },
      { name: 'Ampara', lat: 7.3018, lon: 81.6747 },
      { name: 'Badulla', lat: 6.9934, lon: 81.0550 },
      { name: 'Monaragala', lat: 6.8906, lon: 81.3454 },
      { name: 'Hambantota', lat: 6.1429, lon: 81.1212 },
      { name: 'Matara', lat: 5.9496, lon: 80.5469 },
      { name: 'Ratnapura', lat: 6.7056, lon: 80.3847 }
  // Other cities omitted for brevity
];

// Schedule task to fetch weather data for all cities every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    for (const city of cities) {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=39961e7bcb1735ec8409d1599b0a5aab&units=metric`);
      const data = response.data;

      // Save weather data to MongoDB
      const weatherData = new Weather({
        district: city.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        air_pressure: data.main.pressure,
        latitude: data.coord.lat,
        longitude: data.coord.lon
      });
      await weatherData.save();
      console.log('Weather data saved to MongoDB:', weatherData);
    }
  } catch (error) {
    console.error('Error fetching or saving weather data:', error);
  }
});

// Endpoint to fetch weather data for all cities
/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get weather data for all cities
 *     description: Retrieve weather data for all cities from the database
 *     responses:
 *       200:
 *         description: Successful response with weather data
 *       500:
 *         description: Internal server error
 */
app.get('/weather', async (req, res) => {
  try {
    const weatherData = await Weather.find().sort({ timestamp: -1 }).limit(10);
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
