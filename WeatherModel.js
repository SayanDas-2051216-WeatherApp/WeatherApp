const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  temperature: { type: Number, required: true },
  description: { type: String, required: true },
  humidity: { type: Number, required: true },
  pressure: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  visibility: { type: Number, required: true },
  cloudiness: { type: Number, required: true }, // Added cloudiness field
  sunrise: { type: String, required: true }, // Added sunrise field
  sunset: { type: String, required: true }, // Added sunset field
  weatherIcon: { type: String, required: true }, // Added weatherIcon field
  rainVolume: { type: Number, required: true }, // Added rainVolume field
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Weather', weatherSchema);
