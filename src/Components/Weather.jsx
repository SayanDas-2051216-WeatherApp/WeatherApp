import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import WeatherDetailsPopup from "./WeatherDetailsPopup";
import "./Weather.css";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { TextField, Button, Typography } from "@mui/material";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [citiesWeather, setCitiesWeather] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [error, setError] = useState(null);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

  useEffect(() => {
    const container = document.querySelector(".weather-container");
    container.classList.remove("animate");
    void container.offsetWidth; // Trigger reflow
    container.classList.add("animate");
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(baseUrl, {
        params: {
          q: city,
          appid: apiKey,
          units: "metric",
        },
      });

      const newWeatherData = {
        id: response.data.id,
        city: response.data.name,
        weather: response.data.weather[0].description,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        windSpeed: response.data.wind.speed,
        visibility: response.data.visibility,
        cloudiness: response.data.clouds.all,
        sunrise: new Date(
          response.data.sys.sunrise * 1000
        ).toLocaleTimeString(),
        sunset: new Date(response.data.sys.sunset * 1000).toLocaleTimeString(),
        weatherIcon: `http://openweathermap.org/img/w/${response.data.weather[0].icon}.png`,
        rainVolume: response.data.rain ? response.data.rain["3h"] || 0 : 0,
      };

      setWeather(newWeatherData);
      setCitiesWeather((prev) => [...prev, newWeatherData]);
      setLoading(false);
    } catch (err) {
      setError("City not found");
      setWeather(null);
      setLoading(false);
    }
  };

  const saveWeatherToDatabase = async () => {
    try {
      await Promise.all(
        citiesWeather.map(async (cityWeather) => {
          const payload = {
            city: cityWeather.city,
            temperature: cityWeather.temperature,
            description: cityWeather.weather,
            humidity: cityWeather.humidity,
            pressure: cityWeather.pressure,
            windSpeed: cityWeather.windSpeed,
            visibility: cityWeather.visibility,
            cloudiness: cityWeather.cloudiness,
            sunrise: cityWeather.sunrise,
            sunset: cityWeather.sunset,
            weatherIcon: cityWeather.weatherIcon,
            rainVolume: cityWeather.rainVolume,
          };
          console.log("Saving weather data:", payload); // Log payload
          await axios.post("http://localhost:5000/api/save-weather", payload);
        })
      );

      alert("All weather data saved successfully!");
    } catch (error) {
      console.error("Failed to save weather data:", error);
      alert("Failed to save weather data");
    }
  };

  const loadSavedWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/saved-weather?city=${city}`
      );
      if (Array.isArray(response.data)) {
        const dataWithIds = response.data.map((item, index) => ({
          id: item._id || index,
          city: item.city,
          weather: item.description,
          temperature: item.temperature,
          humidity: item.humidity,
          pressure: item.pressure,
          windSpeed: item.windSpeed,
          visibility: item.visibility,
          cloudiness: item.cloudiness || 0,
          sunrise: item.sunrise || "",
          sunset: item.sunset || "",
          weatherIcon: item.weatherIcon || "",
          rainVolume: item.rainVolume || 0,
        }));
        console.log("Loaded weather data:", dataWithIds);
        setCitiesWeather((prev) => [...prev, ...dataWithIds]);
      } else {
        setCitiesWeather([]);
        setError("No data found for this city.");
      }
      setLoading(false);
    } catch (error) {
      setError("Failed to load saved weather data");
      setLoading(false);
    }
  };

  const toggleUnit = () => {
    setIsFahrenheit(!isFahrenheit);
    const updatedCitiesWeather = citiesWeather.map((city) => {
      const currentTemp = parseFloat(city.temperature);
      const convertedTemp = isFahrenheit
        ? ((currentTemp - 32) * 5) / 9
        : (currentTemp * 9) / 5 + 32;
      return {
        ...city,
        temperature: convertedTemp.toFixed(2),
      };
    });
    setCitiesWeather(updatedCitiesWeather);
  };



  const handleCellDoubleClick = (params) => {
    console.log("Double-clicked row data:", params.row);
    setSelectedCity(params.row);
    setOpenPopup(true);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(citiesWeather);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CitiesWeather");
    XLSX.writeFile(wb, "CitiesWeather.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "ID",
          "City",
          "Weather",
          "Temperature",
          "Humidity",
          "Pressure",
          "Wind Speed",
          "Visibility",
        ],
      ],
      body: citiesWeather.map((city) => [
        city.id,
        city.city,
        city.weather,
        `${city.temperature} ${isFahrenheit ? "°F" : "°C"}`,
        city.humidity,
        city.pressure,
        city.windSpeed,
        city.visibility,
      ]),
    });
    doc.save("CitiesWeather.pdf");
  };

  return (
    <div className="weather-container">
      <Typography
        variant="h2"
        className="head"
        sx={{ color: "bisque",
         textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" ,
         
        }}
      >
        Weather Dashboard
      </Typography>

      <div className="form-container">
        <TextField
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          variant="outlined"
          sx={{ bgcolor: "rgba(255, 255, 255, 0.7)", borderRadius: "5px" }}
        />
        <Button
          onClick={fetchWeather}
          disabled={loading}
          variant="contained"
          sx={{
            bgcolor: "#6a11cb",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
            fontWeight: "bold",
            borderRadius:20,
            "&:hover": {
              background: "linear-gradient(to right, #2575fc, #6a11cb)",
            },
          }}
        >
          {loading ? "Loading..." : "Get Weather"}
        </Button>


        <Button 
          onClick={saveWeatherToDatabase}
          disabled={loading || citiesWeather.length === 0}
          variant="contained"
          sx={{
            bgcolor: "#6a11cb",
            fontWeight: "bold",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color:"white",
            borderRadius:20,
            "&.Mui-disabled": {
              color: "white",
            },

            "&:hover": {
              background: "linear-gradient(to right, #2575fc, #6a11cb)",
            },
          }}
        >
          {loading ? "Loading..." : "Save to Database"}
        </Button>
        <Button
          onClick={loadSavedWeatherData}
          disabled={loading || !city}
          variant="contained"
          sx={{
            bgcolor: "#6a11cb",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
            fontWeight: "bold",
            borderRadius:20,
            "&.Mui-disabled": {
              color: "white",
              
            },


            "&:hover": {
              background: "linear-gradient(to right, #2575fc, #6a11cb)",
            },
          }}
        >
          {loading ? "Loading..." : "Load Saved Weather Data"}
        </Button>
        <Button
          onClick={toggleUnit}
          variant="contained"
          sx={{
            bgcolor: "#6a11cb",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
            fontWeight: "bold",
            borderRadius:20,
            "&:hover": {
              background: "linear-gradient(to right, #2575fc, #6a11cb)",
            },
          }}
        >
          Toggle to {isFahrenheit ? "Celsius" : "Fahrenheit"}
        </Button>
        <Button
          onClick={exportToExcel}
          disabled={loading}
          variant="contained"
          
          sx={{
            bgcolor: "#6a11cb",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
            fontWeight: "bold",
            borderRadius:20,
            "&:hover": {
              background: "linear-gradient(to right, #2575fc, #6a11cb)",
            },
          }}
        >
          Export to Excel
        </Button>
        <Button
          onClick={exportToPDF}
          disabled={loading}
          variant="contained"
          sx={{
            bgcolor: "#6a11cb",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "white",
            fontWeight: "bold",
            borderRadius:20,
            "&:hover": {
              background: "linear-gradient(to right, #2575fc, #6a11cb)",
            },
          }}
        >
          Export to PDF
        </Button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="data-grid-container">
  <DataGrid
    rows={citiesWeather}
    columns={[
      {
        field: "city",
        headerName: "City",
        width: 200,
        sortable: true,
        filterable: true,
      },
      {
        field: "weather",
        headerName: "Weather",
        width: 200,
        sortable: true,
        filterable: true,
      },
      {
        field: "temperature",
        headerName: "Temperature",
        width: 200,
        sortable: true,
        filterable: true,
        renderCell: (params) => `${params.value} ${isFahrenheit ? "°F" : "°C"}`,
      },
      {
        field: "humidity",
        headerName: "Humidity",
        width: 200,
        sortable: true,
        filterable: true,
        renderCell: (params) => `${params.value} %`,
      },
      {
        field: "pressure",
        headerName: "Pressure",
        width: 200,
        sortable: true,
        filterable: true,
        renderCell: (params) => `${params.value} hPa`,
      },
      {
        field: "windSpeed",
        headerName: "Wind Speed",
        width: 200,
        sortable: true,
        filterable: true,
        renderCell: (params) => `${params.value} m/s`,
      },
      {
        field: "visibility",
        headerName: "Visibility",
        width: 200,
        sortable: true,
        filterable: true,
        renderCell: (params) => `${params.value} m`,
      },
    ]}
    pageSize={5}
    rowsPerPageOptions={[5, 10, 20]}
    key={isFahrenheit ? "fahrenheit" : "celsius"}
    onCellDoubleClick={handleCellDoubleClick}
    sx={{
      "& .MuiDataGrid-cell": {
        color: "black",
        wordWrap: "break-word",
        whiteSpace: "normal",
      },
      "& .MuiDataGrid-row": {
        backgroundColor: "white",
      },
      "& .MuiDataGrid-columnHeaders": {
        borderBottom: "1px solid rgba(224, 224, 224, 1)",
      },
      "& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell": {
        overflow: "auto",
      },
    }}
  />
</div>

      <WeatherDetailsPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        weatherDetails={selectedCity}
        isFahrenheit={isFahrenheit}
      />
    </div>
  );
};

export default Weather;