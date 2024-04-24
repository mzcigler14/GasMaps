import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import NumberInput from "./NumberInput";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs, { Dayjs } from "dayjs";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useState, useEffect } from "react";
import * as React from "react";

type searchHandler = (
  origin: google.maps.LatLng,
  dest: google.maps.LatLng,
  distance: number,
  departure: Date
) => void;

interface props {
  // search: boolean;
  // setOrigin: React.Dispatch<React.SetStateAction<google.maps.LatLng>>;
  // setDestination: React.Dispatch<React.SetStateAction<google.maps.LatLng>>;
  // setDistance: React.Dispatch<React.SetStateAction<number>>;
  // setSearch: React.Dispatch<React.SetStateAction<boolean>>;
  onSearch: searchHandler;
}
const InputBar = ({
  // search,
  // setOrigin,
  // setDestination,
  // setDistance,
  // setSearch,
  onSearch,
}: props) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();
  const [origins, setOrigins] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [destinations, setDestinations] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [origin, setOrigin] = useState<google.maps.LatLng>(
    new google.maps.LatLng(0, 0)
  );
  const [destination, setDestination] = useState<google.maps.LatLng>(
    new google.maps.LatLng(0, 0)
  );
  const [distance, setDistance] = useState<number>();
  const [departure, setDeparture] = useState<Date>(new Date());

  const [o, setO] = useState<string>("");
  const [d, setD] = useState<string>("");
  const [openO, setOpenO] = useState<boolean>(false);
  const [openD, setOpenD] = useState<boolean>(false);
  const loadingO = openO && origins.length === 0 && o != "";
  const loadingD = openD && destinations.length === 0 && d != "";

  const service = new google.maps.places.AutocompleteService();

  const displaySuggestionsO = function (
    predictions: google.maps.places.AutocompletePrediction[] | null,
    status: google.maps.places.PlacesServiceStatus
  ) {
    if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
      alert(status);
      return;
    }
    setOrigins(predictions);
  };

  const displaySuggestionsD = function (
    predictions: google.maps.places.AutocompletePrediction[] | null,
    status: google.maps.places.PlacesServiceStatus
  ) {
    if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
      alert(status);
      return;
    }
    setDestinations(predictions);
  };

  React.useEffect(() => {
    let active = true;

    if (!loadingO) {
      return undefined;
    }

    (async () => {
      if (active) {
        service.getPlacePredictions({ input: o }, displaySuggestionsO);
      }
      setO("");
    })();
    return () => {
      active = false;
    };
  }, [loadingO]);

  React.useEffect(() => {
    let active = true;

    if (!loadingD) {
      return undefined;
    }

    (async () => {
      if (active) {
        service.getPlacePredictions({ input: d }, displaySuggestionsD);
      }
      setD("");
    })();
    return () => {
      active = false;
    };
  }, [loadingD]);

  useEffect(() => {
    if (!openO) {
      setOrigins([]);
    }
  }, [openO]);

  useEffect(() => {
    if (!openD) {
      setDestinations([]);
    }
  }, [openD]);

  const handleSelect = async (
    setAction: React.Dispatch<React.SetStateAction<google.maps.LatLng>>,
    place: google.maps.places.AutocompletePrediction
  ) => {
    const geocoderRequest: google.maps.GeocoderRequest = {
      placeId: place.place_id,
    };
    const latlnggeo = await getGeocode(geocoderRequest);
    const latlng = await getLatLng(latlnggeo[0]);
    const latlngObj = new google.maps.LatLng(latlng.lat, latlng.lng);
    setAction(new google.maps.LatLng(latlng.lat, latlng.lng));
  };

  const handleDistance = (value: number) => {
    setDistance(value);
  };

  const handleDeparture = (e: Dayjs | null) => {
    if (e != null) {
      setDeparture(new Date(1000 * e.unix()));
    }
  };
  const handleFindGas = () => {
    if (origin && destination && distance && departure) {
      onSearch(origin, destination, distance, departure);
    }
  };
  return (
    <div className="input-bar">
      <Autocomplete
        open={openO}
        onOpen={() => {
          setOpenO(true);
        }}
        onClose={() => {
          setOpenO(false);
        }}
        options={origins}
        getOptionLabel={(option) => option.description}
        loading={loadingO}
        sx={{ width: 200 }}
        onChange={(event, newValue) => {
          if (newValue) {
            handleSelect(setOrigin, newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Origin"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loadingO ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            onChange={(event) => {
              setO(event.target.value);
              setOrigins([]);
            }}
          />
        )}
      />
      <Autocomplete
        open={openD}
        onOpen={() => {
          setOpenD(true);
        }}
        onClose={() => {
          setOpenD(false);
        }}
        options={destinations}
        getOptionLabel={(option) => option.description}
        loading={loadingD}
        sx={{ width: 200 }}
        onChange={(event, newValue) => {
          if (newValue) {
            handleSelect(setDestination, newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Destination"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loadingD ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            onChange={(event) => {
              setD(event.target.value);
              setDestinations([]);
            }}
          />
        )}
      />
      <NumberInput setDistance={handleDistance}></NumberInput>
      <div>
        <DateTimePicker
          label="Departure Date/Time"
          value={dayjs(departure)}
          onChange={handleDeparture}
        ></DateTimePicker>
      </div>

      <div>
        <Button
          onClick={handleFindGas}
          style={{ height: "45px", fontSize: "1.25rem", fontWeight: "bold" }}
          variant="contained"
          size="large"
        >
          Find Gas
        </Button>
      </div>
    </div>
  );
};

export default InputBar;
