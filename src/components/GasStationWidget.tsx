import Button from "@mui/material/Button";
import "../styles.css";
import calculateETA from "../functions/calculateETA";
import { useEffect, useState } from "react";

interface props {
  selectedStation: google.maps.places.PlaceResult | null;
  gasDirections: google.maps.DirectionsResult | null;
  onClick: () => void;
}

// const getDayName = (dayNumber: number) => {
//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   return days[dayNumber];
// };

// const formatTime = (time: string) => {
//   const [hours, minutes] = time.split(":");
//   return `${hours}:${minutes}`;
// };
const GasStationWidget = ({
  selectedStation,
  gasDirections,
  onClick,
}: props) => {
  const [eta, setEta] = useState<Date | String>();
  useEffect(() => {
    if (gasDirections) {
      setEta(calculateETA(gasDirections));
    }
  }, [gasDirections]);

  const handleUseGasStation = () => {
    onClick();
  };

  return (
    <div className="station-widget">
      {selectedStation ? (
        <>
          <h2>{selectedStation.name}</h2>
          {/* <p>Opening Hours:</p>
          <ul>
            {selectedStation.opening_hours?.periods?.map((period, index) => (
              <li key={index}>
                {getDayName(period.open.day)}: {formatTime(period.open.time)} -{" "}
                {period.close && formatTime(period.close.time)}
              </li>
            ))}
          </ul> */}
          {eta instanceof Date ? (
            <p>
              ETA:{" "}
              {`${eta.getHours()}:${String(eta.getMinutes()).padStart(
                2,
                "0"
              )}:${String(eta.getSeconds()).padStart(2, "0")}`}
            </p>
          ) : (
            <p>No ETA found</p>
          )}
          <p>Rating: {selectedStation.rating}</p>
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
