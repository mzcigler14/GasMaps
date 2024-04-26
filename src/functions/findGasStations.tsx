/*
 * File: findGasStations.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: This function finds all of the gas stations between the empty point
 * and the origin that will be open at the time of arrival.
 */

import distanceLatLngPts from "../functions/distanceLatLngPts.js";
import calculateEmpty from "../functions/calculateEmpty.js";
import calculateRoute from "./calculateRoute.js";
import calculateETA from "./calculateETA.js";

interface FindGasResults {
  GasStations: google.maps.places.PlaceResult[] | null;
  center: React.SetStateAction<google.maps.LatLng>;
  zoom: number;
}
//function promised a return of the FindGasresults
const findGasStations = (
  directions: google.maps.DirectionsResult,
  distance: number,
  searchRadius: number,
  emptyPt: google.maps.LatLng,
  origin: google.maps.LatLng,
  searchOffset: number,
  datetime: Date
): Promise<FindGasResults> => {
  //instantiate google maps places service
  const placesService = new google.maps.places.PlacesService(
    document.createElement("div")
  );
  //return the promise
  return new Promise<FindGasResults>((resolve, reject) => {
    const gasStations: google.maps.places.PlaceResult[] = [];
    let zoomLevel = 5; // Default zoom level
    let i = 0;
    //serch gas stations is called (this is recursive and will search a 5km
    //radius from the empty point to the origin)
    const searchGasStations = (center: google.maps.LatLng) => {
      //if the distance from the origin to the search center is < 5km the search
      //is complete and results are returned
      if (
        distanceLatLngPts(
          origin.lat(),
          origin.lng(),
          center.lat(),
          center.lng()
        ) >= 5
      ) {
        //claculated the route from the origin to the next point (start at empty pt
        //work backwards)
        //route calculation to the center of the search radius instead of each gas station
        //minimizes API call volume
        calculateRoute(origin, center)
          .then((result) => {
            let route = result;
            if (route) {
              //calculate eta at the center of the search radius
              let eta = calculateETA(route, datetime);
              //search nearby to the center of the search radius for gas stations
              searchNearby(eta, center, route);
            }
          })
          .catch((error) => {
            alert(error.message);
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

    const searchNearby = (
      eta: Date,
      center: google.maps.LatLng,
      route: google.maps.DirectionsResult
    ) => {
      //find gas stations within 5kmn of the center point
      const request = {
        location: center,
        radius: 5000,
        type: "gas_station",
      };
      placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          //if the request is successful, each gas station is checked if it will be open
          //at the time of arrival
          results.forEach(function (placei) {
            checkOpen(eta, center, route, placei);
          });
          // Adjust zoom level if necessary
          zoomLevel = Math.round(14 - Math.log(searchOffset / 500) / Math.LN2);
          // Adjust center for the next search
          // For now, let's assume center remains the same
          // You might need to adjust this based on your requirements
          // For example, if you want to move the center to the last found gas station
        } else {
          console.error("Error fetching gas stations:", status);
        }
        // once all gas stations are found and check, the next point (5km closer to the origin)
        //is calculated
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
    };

    const checkOpen = (
      eta: Date,
      center: google.maps.LatLng,
      route: google.maps.DirectionsResult,
      placei: google.maps.places.PlaceResult
    ) => {
      let placeid = placei?.place_id;
      if (placeid) {
        //the details of each gas stations are requested, if the details indicated,
        //the gas station will be open at time of arrival then the gas station is pushed to
        // the list of relavent gas stations
        placesService.getDetails({ placeId: placeid }, (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            let placeDetails = result;
            if (placeDetails.opening_hours?.isOpen(eta)) {
              gasStations.push(...[placeDetails]);
            }
          }
        });
      }
    };

    // Start searching for gas stations
    searchGasStations(emptyPt);
  });
};

export default findGasStations;
