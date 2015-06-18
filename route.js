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
 * This module provides an interface to functions that plot a path on a
 *  map between multiple geographical points.
 */

var request = require ('request'); // http request 
var cheerio = require ('cheerio'); // light weight jQuery for manipulating html
var fs = require ('fs'); // file system access

/**
 * Plot the route between two geographical locations on a map. Use the
 * here maps api to gather the path.
 * @param points The points to be included on the path. Takes the form
 * [{lat:lat,lng:lng},{lat:lat,lng:lng}]
 * @param map A Map object to plot the path on.
 * @param callback A callback method to call once the request has been
 * fulfilled or possibly failed. Takes the form callback(Map).
 */
readRoute = function (points, map, callback) {
    // here map specific parameters
    var appId = "app_id=qA8ImB6FZ5bOwaYwwvZK";
    var appCode = "app_code=LrelYfkBW7yosCLGqD_WiQ";
    // set way points (start points[0], end points[1])
    var way0 = "waypoint0=geo!" + points[0].lat + "," + points[0].lng;
    var way1 = "waypoint1=geo!"+points[1].lat + "," + points[1].lng;
    // extra parameters for the request
    var extra = "mode=fastest;car;traffic:disabled";
    // construct the url for the request
    var url = "http://route.cit.api.here.com/routing/7.2/calculateroute.json?" + appId + "&" + appCode
	    + "&" + way0 + "&" + way1 + "&" + extra;
    request(url, function (error, response, body) {
	if (!error && response.statusCode == 200) { // success
	    results = JSON.parse(body); // parse as json
	    pushToMap(map, results);
	    callback(map);
	} else {
	    console.log(response);
	    callback(undefined);
	}
    });
};

/**
 * Plot the route between two geographical locations (specified in a
 * file) on a map. 
 * Use the provided file to extract the path data from.
 * @param file The path to the file containing the json data with the
 * path between two points.
 * @param map A Map object to plot the path on.
 * @param callback A callback method to call once the request has been
 * fulfilled or possibly failed. Takes the form callback(Map).
 */
readRouteFromFile = function (file, map, callback) {
    fs.readFile(file, 'utf8', function (err,data) {
	if (!err) { // successfully read file
	    results = JSON.parse(data);
	    pushToMap(map, results);
	    callback(map);
	} else {
	    callback(undefined);
	}
    });
};

/**
 * Use the extracted json data and actually plot the path on the given
 * Map object.
 * @param map The map to put the path on.
 * @param results A json object containing results from a here maps
 * query.
 */
function pushToMap (map, results) {
    // for each leg
    for (var i = 0; i < results.response.route[0].leg.length; i++) {
	var leg = results.response.route[0].leg[i];
	// for each step in the leg
	for (var j = 0; j < leg.maneuver.length-1; j++) {
	    // format the coordinates to be plotted 
	    var coords = [[leg.maneuver[j].position.longitude, leg.maneuver[j].position.latitude],
			  [leg.maneuver[j+1].position.longitude, leg.maneuver[j+1].position.latitude]];
	    addDescriptionPoint(map, coords, leg.maneuver[j]);
	}
	// join the destination to the second last point and plot the
	// destination 
	var coords = [[leg.maneuver[leg.maneuver.length-1].position.longitude, leg.maneuver[leg.maneuver.length-1].position.latitude],
			  [leg.maneuver[leg.maneuver.length-2].position.longitude, leg.maneuver[leg.maneuver.length-2].position.latitude]];
	addDescriptionPoint(map, coords, leg.maneuver[leg.maneuver.length-1]); // add the last point the loop misses
    }
}

/**
 * Add a line depicting the path between two points that lie on the
 * path. Also plot circles at the two points which give guidence about
 * how to continue on the path (directions).
 * @param map A Map object that the path is added to.
 * @param coordinates The two pairs of coordinates
 * involved. [[lng,lat],[lng,lat]]
 * @param maneuver The json data about this maneuver eg. between these
 * two coordinate pairs.
 */
function addDescriptionPoint (map, coords, maneuver) {
    var instruction = maneuver.instruction;
    // so we can perform jQuery like operations
    var document = cheerio.load(instruction);
    // extract road name 
    var name = document('span.next-street').text();
    if (name == "") { // try a different field 
	name = document('span.street').text();
    }
    var pointDescription = "";

    if (maneuver.length == 0) { // distance = 0 so at destination
	pointDescription = "At destination";
    } else { // not at dest
	if (maneuver.id == "M1") { // at the start
	    pointDescription += "from the start ";
	} if (document('span.heading').text() != "") { // extract heading string if it exists
	    pointDescription += "Head " + document('span.heading').text() + " on "  + name;
	} else { // extract the direction string 
	    pointDescription += document('span.direction').text() + " onto " + name;
	}
	// append the distance to travel.
	// TODO extract this from the instruction for better English text eg. units
	pointDescription += " for " + maneuver.length + " metres";
    }
    // add the line between the points (path)
    map.addLine(maneuver.id, coords, "on path " + name);
    // add the descriptive point at this stage
    map.addPoint("n/"+maneuver.id, coords[0][1], coords[0][0], "", pointDescription);
}

// export functions to be used by external modules 
exports.readRoute=readRoute;
exports.readRouteFromFile=readRouteFromFile;
