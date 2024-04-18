const calculateRoute = (
  origin: google.maps.LatLng,
  destination: google.maps.LatLng
): Promise<google.maps.DirectionsResult | null> => {
  const directionsService = new google.maps.DirectionsService();
  return new Promise<google.maps.DirectionsResult | null>((resolve, reject) => {
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          console.error(`error fetching directions ${result}`);
          resolve(null);
        }
      }
    );
  });
};
export default calculateRoute;
