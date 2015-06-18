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

var request = require ('request');
var cheerio = require ('cheerio');
var fs = require ('fs');

readRoute = function (points, map, callback) {
    var appId = "app_id=qA8ImB6FZ5bOwaYwwvZK";
    var appCode = "app_code=LrelYfkBW7yosCLGqD_WiQ";
    var way0 = "waypoint0=geo!" + points[0].lat + "," + points[0].lng;
    var way1 = "waypoint1=geo!"+points[1].lat + "," + points[1].lng;
    var extra = "mode=fastest;car;traffic:disabled";
    var url = "http://route.cit.api.here.com/routing/7.2/calculateroute.json?" + appId + "&" + appCode
	    + "&" + way0 + "&" + way1 + "&" + extra;
    request(url, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    results = JSON.parse(body);
	    pushToMap(map, callback, results);
	    callback(map);
	} else {
	    console.log(response);
	    callback(undefined);
	}
    });
};

readRouteFromFile = function (file, map, callback) {
    fs.readFile(file, 'utf8', function (err,data) {
	if (!err) {
	    results = JSON.parse(data);
	    pushToMap(map, callback, results);
	    callback(map);
	} else {
	    callback(undefined);
	}
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
exports.readRouteFromFile=readRouteFromFile;
