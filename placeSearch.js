var GooglePlaces = require("googleplaces");
var apikey = process.env.GOOGLE_PLACES_API_KEY;
var parameters;
/**
 * Place search - https://developers.google.com/places/documentation/#PlaceSearchRequests
 */
params = {
    location:[-33.8670522, 151.1957362],
    types:"cafe", 
    radius:150
};
function placeSearch (key, parameters, callback) {
    var googlePlaces = new GooglePlaces(key, "json");
    googlePlaces.placeSearch(parameters, callback);
}

var callback = function (error, response) {
    if (error) {
	throw error;
    }
    for (var i = 0; i < response.results.length; i++) {
	console.log(i + ": " + response.results[i].name);
    }
};

placeSearch(apikey, params, callback);
