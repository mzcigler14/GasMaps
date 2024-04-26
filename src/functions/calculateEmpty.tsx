/*
 * File: calculateEmpty.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: Function that will calculat the point that your car will reach empty
 * based off the directions and the distance to empty.
 */

import distanceLatLngPts from "./distanceLatLngPts";
//searchRadius in m everthing else in km
//radius represents the search radius, this will be subtracted from the distance
//to empty to ensure the gas station is within the range of the car
const calculateEmpty = (
  directions: google.maps.DirectionsResult,
  distance: number,
  searchRadius: number
): google.maps.LatLng | null => {
  const route = directions?.routes[0];
  const path = route?.overview_path;
  if (path !== null && path !== undefined) {
    let totalLength = 0;
    let latLng = path[0];
    let nextLatLng = path[0];
    //for each section of the path the distance between the previous and current point
    //is calculated
    for (let i = 1; i < path.length; i++) {
      latLng = nextLatLng;
      nextLatLng = path[i];
      let ptDistance = distanceLatLngPts(
        latLng.lat(),
        latLng.lng(),
        nextLatLng.lat(),
        nextLatLng.lng()
      );
      //if the total length is within the distance to empty the new distance is added to the total length,
      //other wise the current point is the empty pt and it is returned to the main app
      if (totalLength + ptDistance < distance * 10 - searchRadius / 1000) {
        totalLength += ptDistance;
      } else {
        return latLng;
      }
    }
  }
  console.log("an issue with calculating route occured");
  return null;
};

export default calculateEmpty;
