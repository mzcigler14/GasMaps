/*
 * File: GasStationWidget.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: When a gas station is selected this widget pops up and give information about
 * the specific gas station.
 */

import Button from "@mui/material/Button";
import "../styles.css";
import calculateETA from "../functions/calculateETA";
import { useEffect, useState } from "react";

interface props {
  selectedStation: google.maps.places.PlaceResult | null;
  gasDirections: google.maps.DirectionsResult | null;
  datetime: Date;
  onClick: () => void;
}

const GasStationWidget = ({
  selectedStation,
  gasDirections,
  datetime,
  onClick,
}: props) => {
  const [eta, setEta] = useState<Date | String>();
  //when a new gas station is selected and the directions are passed in the
  //eta is calculated.
  useEffect(() => {
    if (gasDirections) {
      setEta(calculateETA(gasDirections, datetime));
    }
  }, [gasDirections]);

  //when gas find route button is clicked the route to the selectedd gas station is displayed.
  const handleUseGasStation = () => {
    onClick();
  };

  return (
    <div className="station-widget">
      {selectedStation ? (
        <>
          <h2>{selectedStation.name}</h2>

          {eta instanceof Date ? (
            <p>
              ETA:{" "}
              {`${eta.getHours()}:${String(eta.getMinutes()).padStart(2, "0")}`}
            </p>
          ) : (
            <p>No ETA found</p>
          )}

          <p>Rating: {selectedStation.rating}</p>
          <p>
            {selectedStation.opening_hours?.weekday_text
              ? selectedStation.opening_hours.weekday_text[
                  datetime.getDay() == 0 ? 7 : datetime.getDay() - 1
                ]
              : "No Hours"}
          </p>
        </>
      ) : (
        <p>No gas station selected.</p>
      )}
      <Button
        style={{ height: "30px", fontSize: "1.5rem", fontWeight: "bold" }}
        variant="contained"
        onClick={handleUseGasStation}
      >
        Find Route
      </Button>
    </div>
  );
};

export default GasStationWidget;
