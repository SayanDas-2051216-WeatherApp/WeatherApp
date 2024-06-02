require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const Weather = require('./WeatherModel'); // Import the Weather model

const app = express();
const PORT = process.env.PORT || 5000;
const apiKey = process.env.WEATHER_API_KEY;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// GET endpoint to fetch weather data without saving
app.get("/api/weather", async (req, res) => {
  const { city } = req.query;
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: apiKey,
          units: "metric",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// POST endpoint to save weather data
app.post("/api/save-weather", async (req, res) => {
  try {
    const {
      city,
      temperature,
      description,
      humidity,
      pressure,
      windSpeed,
      visibility,
      cloudiness,
      sunrise,
      sunset,
      weatherIcon,
      rainVolume
    } = req.body;

    const weatherData = new Weather({
      city,
      temperature,
      description,
      humidity,
      pressure,
      windSpeed,
      visibility,
      cloudiness,
      sunrise,
      sunset,
      weatherIcon,
      rainVolume,
      timestamp: new Date(), // Save the current date and time as timestamp
    });

    await weatherData.save(); // Save the weather data to MongoDB
    res.status(201).send("Weather data saved successfully");
  } catch (error) {
    console.error("Error saving weather data:", error);
    res.status(500).json({ error: "Failed to save weather data" });
  }
});


// GET endpoint to retrieve saved weather data
app.get("/api/saved-weather", async (req, res) => {
  const { city } = req.query;
  try {
    const weatherData = await Weather.find({ city }).sort({ timestamp: -1 });
    console.log("Retrieved weather data:", weatherData); // Log the data
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});