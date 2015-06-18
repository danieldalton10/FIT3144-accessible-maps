/**
 * Copyright (c) 2015 Daniel Dalton
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
