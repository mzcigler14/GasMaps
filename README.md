GasMaps is a web application I've been developing recently. This React/TypeScript/MaterialUI frontend app utilizes the Google Maps API to assist users in planning gas stations during a road trip through areas where 24-hour gas stations may be sparse. By inputting origin, destination, the remaining distance until your vehicle runs out of gas, and departure date/time, GasMaps calculates and displays gas stations along your route that will be open upon your arrival.

Regrettably, the Google Maps API imposes constraints, there is currently no way to use the “searchNearby” API request and receive gas stations that are open at a certain time (can only use “opennow” which is not useful for road trips where the time of arrival is important). This results in a significant cost of $1-$3 per search, rendering the current approach inefficient. Consequently, I've decided not to deploy the website for public use at this time. In the future, I will investigate other options to create a version of this app where there is little or no cost of use. However, if you're interested in a demo of the app, please feel free to reach out. I'd be happy to discuss potential options for making it accessible. Creating this app has been an amazing learning process and I am excited to research solutions to my cost issues!

Demo Video: https://lnkd.in/gmuR48pd