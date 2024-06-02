import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import "./WeatherDetailsPopup.css";

const WeatherDetailsPopup = ({
  open,
  onClose,
  weatherDetails,
  isFahrenheit,
}) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (open) {
      setFade(true);
    } else {
      const timeout = setTimeout(() => setFade(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <Dialog
      open={fade}
      onClose={onClose}
      className={`dialog ${open ? "fade-in" : "fade-out"}`}
    >
      <DialogTitle className="dialog-title">
        <span role="img" aria-label="weather">
          ☀️
        </span>{" "}
        Weather Details
      </DialogTitle>
      <DialogContent className="dialog-content">
        <DialogContentText component="div">
          <div className="weather-icon">
            <img src={weatherDetails?.weatherIcon} alt="Weather icon" />
          </div>
          <div className="weather-info">
            <p>
              <span role="img" aria-label="city">
                🌆
              </span>{" "}
              City: {weatherDetails?.city}
            </p>
            <p>
              <span role="img" aria-label="cloudiness">
                ☁️
              </span>{" "}
              Cloudiness: {weatherDetails?.cloudiness} %
            </p>
            <p>
              <span role="img" aria-label="sunrise">
                🌅
              </span>{" "}
              Sunrise Time: {weatherDetails?.sunrise}
            </p>
            <p>
              <span role="img" aria-label="sunset">
                🌇
              </span>{" "}
              Sunset Time: {weatherDetails?.sunset}
            </p>
            <p>
              <span role="img" aria-label="rain">
                🌧️
              </span>{" "}
              Rain Volume (last 3 hrs): {weatherDetails?.rainVolume} mm
            </p>
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} className="close-button">
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeatherDetailsPopup;
