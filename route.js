var fs = require('fs')
var cheerio = require ('cheerio');

readRoute = function (file, map, callback) {
    fs.readFile(file, 'utf8', function (err,data) {
	if (!err) {
	    results = JSON.parse(data);
	}
	pushToMap(map, callback, results);
	callback(map);
    });
};

function pushToMap (map, callback, results) {
    for (var i = 0; i < results.response.route[0].leg.length; i++) {
	var leg = results.response.route[0].leg[i];
	for (var j = 0; j < leg.maneuver.length-1; j++) {
	    var coords = [[leg.maneuver[j].position.longitude, leg.maneuver[j].position.latitude],
			  [leg.maneuver[j+1].position.longitude, leg.maneuver[j+1].position.latitude]];
	    addDescriptionPoint(map, coords, leg.maneuver[j]);
	}
	addDescriptionPoint(map, coords, leg.maneuver[leg.maneuver.length-1]);
    }
}

function addDescriptionPoint (map, coords, maneuver) {
    var instruction = maneuver.instruction;
    var document = cheerio.load(instruction);
    var name = document('span.next-street').text();
    if (name == "") {
	name = document('span.street').text();
    }
    var pointDescription = "";
    // TODO extract instructions from html
    if (maneuver.length == 0) {
	pointDescription = "At destination";
    } else {
	if (maneuver.id == "M1") { // at the start
	    pointDescription += "from the start ";
	} if (document('span.heading').text() != "") {
	    pointDescription += "Head " + document('span.heading').text() + " on "  + name;
	} else {
	    pointDescription += document('span.direction').text() + " onto " + name;
	}
	pointDescription += " for " + maneuver.length + " metres";
    }
    map.addLine(maneuver.id, coords, "on path " + name);
    map.addPoint("n/"+maneuver.id, coords[0][1], coords[0][0], "", pointDescription);
}
exports.readRoute=readRoute;
