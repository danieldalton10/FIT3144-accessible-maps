var fs = require('fs')

readFromOSM = function (map, callback) {
    fs.readFile('glen.json', 'utf8', function (err,data) {
	if (!err) {
	    results = JSON.parse(data);
	}
	openStreetService(map, callback, results, err);
    });
};

openStreetService = function (map, callback, results, err) {
    if (err) {
	callback (undefined);
	return;
    }
    points = new Array();
    for (var i = 0; i < results.features.length; i++) {
	if (results.features[i].properties.highway == "trunk" ||
	    results.features[i].properties.highway == "primary" ||
	    results.features[i].properties.highway == "secondary"
	    || results.features[i].properties.highway == "resi") {
	    if (results.features[i].properties.name != undefined) {
		map.addLine (results.features[i].id,
			     results.features[i].geometry.coordinates, results.features[i].properties.name);
	    }
	}
    }
    map.addPoint(map.centre.id, map.centre.lat, map.centre.lng, map.centre.name, "");
    callback(map);
};

exports.readFromOSM=readFromOSM;

