/*
 * File: App.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: This is the main app component that brings together the web app.
 * At a high level it displays the headerr, input bar and google map.
 */
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import distanceLatLngPts from "./functions/distanceLatLngPts.js";
import SearchLoadingWidget from "./components/SearchLoadingWidget";
interface InputState {
  origin: google.maps.LatLng;
  destination: google.maps.LatLng;
  distance: number;
  departure: Date;
}

function App() {
  //show load page until the api is ready
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
    departure: new Date(),
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
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  //when the user clicks search the input state is set
  const handleSearch = (
    org: google.maps.LatLng,
    dest: google.maps.LatLng,
    dist: number,
    dept: Date
  ) => {
    setLoadingSearch(true);
    setInputState({
      origin: org,
      destination: dest,
      distance: dist,
      departure: dept,
    });
  };

  //once the input state is set all old states are cleared from the map
  useEffect(() => {
    setGasStations([]);
    setSelectedGasStation(null);
    setMapOrigin(inputState.origin);
    //if it is the first search (directions are null), the route is calculated
    if (directions === null) {
      Route(inputState.origin, inputState.destination, setDirections);
      //if the directions are not null, they are cleared
    } else {
      setDirections(null);
    }
  }, [inputState]);

  useEffect(() => {
    //on the directions statte being updated if the directions are null then they
    //are calculated
    if (directions === null) {
      Route(inputState.origin, inputState.destination, setDirections);
      //if the directions are present than the point of empty on the route is calculated
    } else {
      EmptyCalc(directions, setEmptyPt, inputState.distance, searchOffset);
    }
  }, [directions]);

  //on the emptyPt calculations and state update (location of gas being empty minus the searchOffset)
  //gasstations within the search radius are searched for
  useEffect(() => {
    if (emptyPt) {
      allGasStations(setMapOrigin, setZoom, setGasStations);
    }
  }, [emptyPt]);

  //asynchronous function to find a route, proper way to use is call and then have a useEffect
  //that catches the state update from its results to avoid outdated or empty states
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

  //finds all relavent gas stations, then sets the gas stations states once completed
  //again use a useEffect with the gas station state to ensure gas stations are up to date
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
          searchOffset,
          inputState.departure
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
            setLoadingSearch(false);
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    } catch (error) {
      console.error("Error getting gas stations:", error);
    }
  };
  //calculate the point where the car will be on empty
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

  //when the use selectes a gas station the route is found so that the eta within th
  //gas station widget can be calculated
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

  //when a gas station is confirmed (find route clicked)
  //directions to that gas station are displayed.
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
        setDirections
      );
    } else {
      console.log("no station selected");
    }
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Header></Header>
        <InputBar onSearch={handleSearch}></InputBar>
        {loadingSearch && <SearchLoadingWidget></SearchLoadingWidget>}
        <div className="map-style">
          <GoogleMap
            mapContainerClassName="map-style"
            center={mapOrigin}
            zoom={zoom}
          >
            {directions && <DirectionsRenderer directions={directions} />}
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
                  text: "Empty",
                  color: "black",
                  fontSize: "18px",
                  fontWeight: "bold",
                  className: "custom-marker-label",
                }}
              />
            )}
            ;
          </GoogleMap>
          {selectedGasStation && (
            <GasStationWidget
              selectedStation={selectedGasStation}
              gasDirections={gasDirections}
              datetime={inputState.departure}
              onClick={handleStationChosen}
            ></GasStationWidget>
          )}
        </div>
      </LocalizationProvider>
    </>
  );
}
