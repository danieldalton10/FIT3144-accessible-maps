var fs = require('fs')

readFromOSM = function (map, callback, parameters) {
    fs.readFile('glen.json', 'utf8', function (err,data) {
	if (!err) {
	    results = JSON.parse(data);
	}
	openStreetService(map, callback, parameters, results, err);
    });
};

openStreetService = function (map, callback, parameters, results, err) {
    if (err) {
	callback (undefined);
	return;
    }
    points = new Array();
    for (var i = 0; i < results.features.length; i++) {
	addFeatureToMap (map, results.features[i], parameters);
    }
//    map.addPoint(map.centre.id, map.centre.lat, map.centre.lng, map.centre.name, "");
    callback(map);
};

function addFeatureToMap (map, feature, parameters) {
    if (!shouldAdd(feature, parameters)) {
	return false;
    }
    if (feature.geometry.type == "Point") {
	map.addPoint(feature.id, feature.geometry.coordinates[1],
		     feature.geometry.coordinates[0],
		     feature.properties.name, "");
    } else if (feature.geometry.type == "Polygon") {
	map.addPolygon(feature.id, feature.geometry.coordinates[0],
		       feature.properties.name);
    } else if (feature.geometry.type == "LineString") {
	map.addLine(feature.id, feature.geometry.coordinates,
		       feature.properties.name);
    } else { // unsupported shape
	return false;
    }
    return true;
}

function shouldAdd (feature, parameters) {
    if (feature.properties.name == undefined) {
	return false;
    }
    if (parameters.building && feature.properties.building == "yes") {
	return true;
    }
    return matchesParameterArray(parameters.highway, feature.properties.highway) 
	|| matchesParameterArray(parameters.amenity, feature.properties.amenity)
	|| matchesParameterArray(parameters.railway, feature.properties.railway)
	|| matchesParameterArray(parameters.sport, feature.properties.sport);
}

function matchesParameterArray (specified, feature) {
    if (specified != undefined) {
	for (var i = 0; i < specified.length; i++) {
	    if (feature == specified[i]) {
		return true;
	    }
	}
    }
    return false;
}

exports.readFromOSM=readFromOSM;

