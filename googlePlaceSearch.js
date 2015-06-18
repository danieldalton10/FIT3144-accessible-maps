var GooglePlaces = require("googleplaces");

var apikey = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Perform a google places search and add places to the map by means of
 *  the callback method map.addPoints
 * @param key Google places API key
 * @param parameters Parameters for the places api.
 * @param map The map to add the places to with the call back method
 *  addPoints(arrayOfPlaces)
 * @return nothing 
 */
nearbySearch = function (parameters, map, callback) {
    var googlePlaces = new GooglePlaces(apikey, "json");
    googlePlaces.placeSearch(parameters, function (error, response) {
	if (error) {
	    callback(undefined);
	}
	for (var i = 0; i < response.results.length; i++) {
	    map.addPoint (response.results[i].id, response.results[i].geometry.location.lat,
			  response.results[i].geometry.location.lng, response.results[i].name,
			  response.results[i].vicinity);
	}
	callback(map);
    });
}

exports.nearbySearch=nearbySearch;
