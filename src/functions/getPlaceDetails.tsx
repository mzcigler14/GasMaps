//need to give directions and calculate next point to calc from
interface FindGasResults {
  GasStations: google.maps.places.PlaceResult[] | null;
  center: React.SetStateAction<google.maps.LatLng>;
  zoom: number;
}

const getPlaceDetails = (
  place: google.maps.places.PlaceResult
): Promise<google.maps.places.PlaceResult> => {
  const placesService = new google.maps.places.PlacesService(
    document.createElement("div")
  );

  return new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
    let placeDetails: google.maps.places.PlaceResult;

    const getDetails = () => {
      if (place.place_id) {
        placesService.getDetails(
          { placeId: place.place_id },
          (result, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              result
            ) {
              placeDetails = result;
            } else {
              console.error("Error fetching gas station results:", status);
            }
          }
        );
      }
      resolve(placeDetails);
    };

    // Start searching for gas stations
    getDetails();
  });
};

export default getPlaceDetails;
