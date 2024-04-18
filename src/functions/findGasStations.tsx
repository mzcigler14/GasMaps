import distanceLatLngPts from "../functions/distanceLatLngPts.js";
import calculateEmpty from "../functions/calculateEmpty.js";

//need to give directions and calculate next point to calc from
interface FindGasResults {
  GasStations: google.maps.places.PlaceResult[] | null;
  center: React.SetStateAction<google.maps.LatLng>;
  zoom: number;
}

const findGasStations = (
  directions: google.maps.DirectionsResult,
  distance: number,
  searchRadius: number,
  emptyPt: google.maps.LatLng,
  origin: google.maps.LatLng,
  searchOffset: number
): Promise<FindGasResults> => {
  const placesService = new google.maps.places.PlacesService(
    document.createElement("div")
  );

  return new Promise<FindGasResults>((resolve, reject) => {
    const gasStations: google.maps.places.PlaceResult[] = [];
    let zoomLevel = 5; // Default zoom level
    let i = 0;
    const searchGasStations = (center: google.maps.LatLng) => {
      if (
        distanceLatLngPts(
          origin.lat(),
          origin.lng(),
          center.lat(),
          center.lng()
        ) >= 5
      ) {
        const request = {
          location: center,
          radius: 5000,
          type: "gas_station",
        };
        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            gasStations.push(...results);
            // Adjust zoom level if necessary
            zoomLevel = Math.round(
              14 - Math.log(searchOffset / 500) / Math.LN2
            );
            // Adjust center for the next search
            // For now, let's assume center remains the same
            // You might need to adjust this based on your requirements
            // For example, if you want to move the center to the last found gas station
          } else {
            console.error("Error fetching gas stations:", status);
          }
          // Continue searching
          i++;
          const nextPt = calculateEmpty(
            directions,
            distance,
            searchRadius + 5000 * i
          );
          if (nextPt) {
            searchGasStations(nextPt);
          }
        });
      } else {
        // Resolve the promise with the accumulated gas stations
        resolve({
          GasStations: gasStations.length > 0 ? gasStations : null,
          zoom: zoomLevel,
          center: emptyPt,
        });
      }
    };

    // Start searching for gas stations
    searchGasStations(emptyPt);
  });
};

export default findGasStations;
