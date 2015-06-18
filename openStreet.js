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
    callback(map);
};

function addFeatureToMap (map, feature, parameters) {
    var name = feature.properties.name;
    if (name != undefined) {
	name += generateExtraDescription (feature);
	name = name.trim();
    }
    if (name == undefined || !shouldAdd(feature, parameters)) {
	return false;
    }
    if (feature.geometry.type == "Point") {
	map.addPoint(feature.id, feature.geometry.coordinates[1],
		     feature.geometry.coordinates[0],
		     name, "");
    } else if (feature.geometry.type == "Polygon") {
	map.addPolygon(feature.id, feature.geometry.coordinates[0],
		       name);
    } else if (feature.geometry.type == "LineString") {
	map.addLine(feature.id, feature.geometry.coordinates,
		    name);
    } else { // unsupported shape
	return false;
    }
    return true;
}

function generateExtraDescription (feature) {
    if (feature.geometry.type != "LineString" 
	&& feature.properties.highway != undefined) {
	return " " + feature.properties.highway.replace(/_/g, " ");
    } else if (feature.properties.railway != undefined) {
	return " " + feature.properties.railway.replace(/_/g, " ");
    }
    return "";
}

function shouldAdd (feature, parameters) {
    if (parameters.building != undefined && parameters.building.toString() == true.toString() && feature.properties.building == "yes") {
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
