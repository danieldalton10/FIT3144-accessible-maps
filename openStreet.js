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

/**
 * This module allows the extraction of data from a geo json file and
 * places certain features on a map. It is designed to work with open
 * street maps data, but can be extended to work with other
 * sources. Currently only works with local files as there is no such
 * web service freely available.
 */
var fs = require('fs');

/**
 * Reads the geographical data from a geo json file and plots the
 * features specified in the parameters to the map before invoking the
 * callback on either successful or unsuccessful completion of this
 * task.
 * @param map The map object to add the features to.
 * @param callback The callback to invoke once the points have been added to the
 * map or if an error occurs.
 * @param parameters The filtering search parameters. This is an object
 * with key pair values restricting inclusion to those features who have
 * a property with a value which matches the corresponding parameter
 * value in the parameters object.
 */
readFromOSM = function (map, callback, parameters) {
    fs.readFile('glen.json', 'utf8', function (err,data) {
	if (!err) { // success parse json 
	    results = JSON.parse(data);
	}
	// filter the data and put the features on the map before invoking callback
	openStreetService(map, callback, parameters, results, err);
    });
};

/**
 * Filter the json data and put the features on the map before invoking
 * the callback.
 * @param map The Map object to place the features on.
 * @param callback The callback to be invoked upon completion or failure.
 * @param parameters The search filtering parameters.
 * @param results A json object with all of the geographic data.
 * @param err The error flag from the retrieval of data.
 */
openStreetService = function (map, callback, parameters, results, err) {
    if (err) { // something went wrong before 
	callback (undefined);
	return;
    }
    // consider each feature in the data 
    for (var i = 0; i < results.features.length; i++) {
	// adds the feature to the map if it is desired 
	addFeatureToMap (map, results.features[i], parameters);
    }
    callback(map); // done invoke callback
};

/**
 * Add the feature to the map given it matches parameters.
 * @param map The Map object which the feature should be added to.
 * @param feature The feature extracted from the geo json to be added.
 * @param parameters The search filtering parameters
 */
function addFeatureToMap (map, feature, parameters) {
    var name = feature.properties.name;
    // see if we can get a more detailed string (but only bother if name
    // isn't undefined)
    if (name != undefined) {
	name += generateExtraDescription (feature);
	name = name.trim();
    }
    // don't add the feature if shouldAdd return false or we don't have a
    // name for feature 
    if (name == undefined || !shouldAdd(feature, parameters)) {
	return false;
    }
    // add feature
    if (feature.geometry.type == "Point") {
	// just a point on the map 
	map.addPoint(feature.id, feature.geometry.coordinates[1],
		     feature.geometry.coordinates[0],
		     name, "");
    } else if (feature.geometry.type == "Polygon") {
	// add as polygon
	map.addPolygon(feature.id, feature.geometry.coordinates[0],
		       name);
    } else if (feature.geometry.type == "LineString") {
	// LineString so add as a polyline
	map.addLine(feature.id, feature.geometry.coordinates,
		    name);
    } else { // unsupported shape
	return false;
    }
    return true; // added feature 
}

/**
 * Returns a string with extra information about the feature that can be appended to the
 * feature name. 
 * @param feature The feature from the geo json data to compile a
 * descriptive string for.
 * @return A string description of the object to append to its name.
 */
function generateExtraDescription (feature) {
    // highway type and not a line eg. isn't a road. Could be a bus stop so
    // indicate this 
    if (feature.geometry.type != "LineString" 
	&& feature.properties.highway != undefined) {
	return " " + feature.properties.highway.replace(/_/g, " ");
    } else if (feature.properties.railway != undefined) { // station or train line
	return " " + feature.properties.railway.replace(/_/g, " ");
    }
    return "";
}

/**
 * Decide if feature should be added to the map based on the supplied
 * parameters.
 * @param feature The feature to be added.
 * @param parameters The search filtering parameters.
 * @return boolean true if the feature should be added otherwise false.
 */
function shouldAdd (feature, parameters) {
    if (parameters.building != undefined && parameters.building.toString() == true.toString() && feature.properties.building == "yes") {
	// parameters.building must be true and feature.properties.building must be yes
	return true;
    }
    // check to see if at least one of the following parameters are matched
    // by this feature.
    // true if 1 or more match, otherwise false.
    return matchesParameterArray(parameters.highway, feature.properties.highway) 
	|| matchesParameterArray(parameters.amenity, feature.properties.amenity)
	|| matchesParameterArray(parameters.railway, feature.properties.railway)
	|| matchesParameterArray(parameters.sport, feature.properties.sport);
}

/**
 * Check if the value of the feature's property matches any values
 * provided in the search parameters.
 * @param specified The specified parameters in the search for one of the
 * parameter key words. This should be an array of values.
 * @param feature The parameter value for this feature.
 */
function matchesParameterArray (specified, feature) {
    if (specified != undefined) {
	for (var i = 0; i < specified.length; i++) {
	    if (feature == specified[i]) {
		// The value of this parameter in the feature matched
		// one of the values in the supplied list. This feature should be included
		// - return true.
		return true;
	    }
	}
    }
    return false;
}

// export functions to be used by external modules 
exports.readFromOSM=readFromOSM;
