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
    for (let i = 1; i < path.length; i++) {
      latLng = nextLatLng;
      nextLatLng = path[i];
      let ptDistance = distanceLatLngPts(
        latLng.lat(),
        latLng.lng(),
        nextLatLng.lat(),
        nextLatLng.lng()
      );

      //need to fix this I have no idea why distance needs to multiply
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
