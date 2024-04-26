/*
 * File: calculateETA.tsx
 * Author: Matjaz Cigler
 * Project: GasMaps
 * Date: 2023-04-26
 * Description: Function that calulates the estimated time of arrival to a point
 * based off the directions to that point and the time of departure.
 */

const calculateETA = (
  directions: google.maps.DirectionsResult,
  datetime: Date
) => {
  //in seconds
  let duration = 0;
  //using each leg of the directions the total time until arrival is calculated.
  for (let i = 0; i < directions.routes[0].legs.length; i++) {
    let leg = directions.routes[0].legs[i];
    if (leg && leg.duration && leg.duration.value !== undefined) {
      duration += leg.duration.value;
    } else {
      return new Date();
    }
  }
  const currentTime = datetime;
  //getTime returns in milliseconds
  const eta = new Date(currentTime.getTime() + duration * 1000);
  return eta;
};
export default calculateETA;
