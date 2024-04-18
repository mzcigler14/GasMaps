import { useEffect, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import Header from "./components/Header";
import InputBar from "./components/InputBar";
import GasStationWidget from "./components/GasStationWidget";
import calculateRoute from "./functions/calculateRoute";
import calculateEmpty from "./functions/calculateEmpty.js";
import findGasStations from "./functions/findGasStations.js";
import distanceLatLngPts from "./functions/distanceLatLngPts.js";
interface InputState {
  origin: google.maps.LatLng;
  destination: google.maps.LatLng;
  distance: number;
}

//ISSUES:
//When the user updates the distance or origin or location the site does not work
//for instance changing the distance will work but will not reset the search radius
//leading the suboptimal results
function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_REACT_APP_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <p>Loading in Progress</p>;
  }
  return <AppLoaded />;
}

export default App;

function AppLoaded() {
  const [refreshMap, setRefreshMap] = useState<number>(0);
  const [emptyPt, setEmptyPt] = useState<google.maps.LatLng | null>(null);
  const [inputState, setInputState] = useState<InputState>({
    origin: new google.maps.LatLng(0, 0),
    destination: new google.maps.LatLng(0, 0),
    distance: 0,
  });
  const [mapOrigin, setMapOrigin] = useState<google.maps.LatLng>(
    new google.maps.LatLng(0, 0)
  );
  const [zoom, setZoom] = useState<number>(10);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [gasDirections, setGasDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [gasStations, setGasStations] = useState<
    google.maps.places.PlaceResult[] | null
  >([]);
  const [selectedGasStation, setSelectedGasStation] =
    useState<google.maps.places.PlaceResult | null>();
  const [searchOffset, setSearchOffset] = useState<number>(5000);

  const handleSearch = (
    org: google.maps.LatLng,
    dest: google.maps.LatLng,
    dist: number
  ) => {
    setInputState({
      origin: org,
      destination: dest,
      distance: dist,
    });
  };

  const Route = async (
    orig: google.maps.LatLng,
    dest: google.maps.LatLng,
    setAction: React.Dispatch<
      React.SetStateAction<google.maps.DirectionsResult | null>
    >
  ) => {
    try {
      calculateRoute(orig, dest)
        .then((result) => {
          setAction(result);
        })
        .catch((error) => {
          alert(error.message);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const allGasStations = async (
    setMapOrigin: React.Dispatch<React.SetStateAction<google.maps.LatLng>>,
    setZoom: React.Dispatch<React.SetStateAction<number>>,
    setGasStations: React.Dispatch<
      React.SetStateAction<google.maps.places.PlaceResult[] | null>
    >
  ) => {
    try {
      if (emptyPt && directions) {
        findGasStations(
          directions,
          inputState.distance,
          searchOffset,
          emptyPt,
          inputState.origin,
          searchOffset
        )
          .then((result) => {
            console.log(result.GasStations);
            setGasStations((prev) =>
              prev
                ? prev.concat(
                    result.GasStations as google.maps.places.PlaceResult[]
                  )
                : []
            );
            setZoom(result.zoom);
            setMapOrigin(result.center);
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    } catch (error) {
      console.error("Error getting gas stations:", error);
    }
  };

  const EmptyCalc = (
    directions: google.maps.DirectionsResult | null,
    setAction: React.Dispatch<React.SetStateAction<google.maps.LatLng | null>>,
    distance: number,
    searchOffset: number
  ) => {
    if (directions) {
      setAction(calculateEmpty(directions, distance, searchOffset));
    }
  };

  useEffect(() => {
    setDirections(null);
    setGasDirections(null);
    setGasStations([]);
    setSelectedGasStation(null);
    setMapOrigin(inputState.origin);
    Route(inputState.origin, inputState.destination, setDirections);
  }, [inputState]);

  //if not route yet, route is found otherwise the
  //location where gas will run out (minus 5km) is found
  useEffect(() => {
    if (directions === null) {
      Route(inputState.origin, inputState.destination, setDirections);
    } else {
      EmptyCalc(directions, setEmptyPt, inputState.distance, searchOffset);
    }
  }, [directions]);

  //on the emptyPt (location of gas being empty minus the searchOffset) being calculated
  //gasstations within the search radius are searched for, if non are found the serach radius
  // is incremented and the next useEffect is triggered
  useEffect(() => {
    if (emptyPt) {
      allGasStations(setMapOrigin, setZoom, setGasStations);
    }
  }, [emptyPt]);

  useEffect(() => {
    if (
      selectedGasStation &&
      selectedGasStation.geometry &&
      selectedGasStation.geometry.location
    ) {
      Route(
        inputState.origin,
        new google.maps.LatLng({
          lat: selectedGasStation.geometry.location.lat(),
          lng: selectedGasStation.geometry.location.lng(),
        }),
        setGasDirections
      );
    } else {
      console.log("no station selected");
    }
  }, [selectedGasStation]);

  const handleStationChosen = () => {
    if (
      selectedGasStation &&
      selectedGasStation.geometry &&
      selectedGasStation.geometry.location
    ) {
      Route(
        inputState.origin,
        new google.maps.LatLng({
          lat: selectedGasStation.geometry.location.lat(),
          lng: selectedGasStation.geometry.location.lng(),
        }),
        setGasDirections
      );
    } else {
      console.log("no station selected");
    }
  };

  return (
    <>
      <Header></Header>
      <InputBar onSearch={handleSearch}></InputBar>
      <div className="map-style">
        <GoogleMap
          mapContainerClassName="map-style"
          center={mapOrigin}
          zoom={zoom}
        >
          {directions !== null && (
            <DirectionsRenderer directions={directions} />
          )}
          {gasStations &&
            gasStations?.length > 0 &&
            gasStations.map(
              (station, index) =>
                station.geometry &&
                station.geometry.location && (
                  <Marker
                    key={index}
                    position={{
                      lat: station.geometry.location.lat(),
                      lng: station.geometry.location.lng(),
                    }}
                    onClick={() => {
                      setSelectedGasStation(station);
                      if (station.geometry && station.geometry.location) {
                        setMapOrigin(
                          new google.maps.LatLng({
                            lat: station.geometry.location.lat(),
                            lng: station.geometry.location.lng(),
                          })
                        );
                      }
                    }}
                  />
                )
            )}
          ;
          {emptyPt && (
            <Marker
              position={{
                lat: emptyPt.lat(),
                lng: emptyPt.lng(),
              }}
              label={{
                text: "Point of Empty",
                color: "black",
                fontSize: "16px",
              }}
            />
          )}
          ;
        </GoogleMap>
        {selectedGasStation && (
          <GasStationWidget
            selectedStation={selectedGasStation}
            gasDirections={gasDirections}
            onClick={handleStationChosen}
          ></GasStationWidget>
        )}
      </div>
    </>
  );
}
//need to render a second map that gives the directions from
