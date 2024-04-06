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
