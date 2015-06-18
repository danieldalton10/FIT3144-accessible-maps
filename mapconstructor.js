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
 * Functions used to construct an svg map
 * Also facilitates running of the entire program to generate the map
 * based on supplied parameters and interactions with external modules.
*/

var utilities = require("./utilities.js");
var openStreet = require("./openStreet.js");
var route = require("./route.js");
var fs = require('fs');

/**
 * Define a map object. This object contains methods related to
 *  manipulating the map data stored as members of the object.
 * @param centre An object with lat, lng and name properties which the map will be
 *  centred around.
 * @param radius The radius such that points within this radius from the
 * centre will be included in the map.
 */
function Map (centre, radius) {
    // compute height and width based on radius 
    this.height = Math.round(radius * 2);
    this.width = Math.round(radius * 6/3);
    this.centre = centre;
    this.mapPoints = new Array();
    this.mapLines = new Array();
    this.mapPolygons = new Array();
    this.mapCentre = {x:this.width/2, y:this.height/2};

/**
 * Add a point (svg circle) to the map. Specified as a geographical
 * location as a lat,lng and is scaled and placed on map accordingly.
 * @param id The unique id of this object.
 * @param lat The latitude of the point to be added.
 * @param lng The longitude of the point to be added.
 * @param name The name of this object to be spoken to the user.
 * @param description The more detailed description of this object to
 * also be spoken.
 */
    this.addPoint = function (id, lat, lng, name, description) {
	// construct a point object
	point = {lat:lat, lng:lng, name:name, description:description, id:id};
	var distance = utilities.distance(centre, point);
	var bearing = utilities.initialBearing(centre, point);
	var circle = new MapPoint (point, distance, bearing, this.mapCentre);
	// check circle x/y coords fit on this map's dimensions 
	if (circle.x > 0 && circle.x < this.width && circle.y > 0 
	    && circle.y < this.height) {
	    this.mapPoints[this.mapPoints.length] = circle;
	}
    }

    this.addLine = function (id, coordinates, name) {
	var line = new MapPolyShape (id,
				coordinates,
				name,
				this.centre, this.mapCentre, this.width, this.height);
	if (line.coordinates.length > 1) {
	    this.mapLines[this.mapLines.length] = line;
	}
    }

    this.addPolygon = function (id, coordinates, name) {
	var polygon = new MapPolyShape (id,
				coordinates,
				name,
				this.centre, this.mapCentre, this.width, this.height);
	if (polygon.coordinates.length > 2) {
	    this.mapPolygons[this.mapPolygons.length] = polygon;
	}
    }

    function MapPolyShape (id, coordinates, name, centre, mapCentre, width, height) {
	this.id = id;
	this.name = escape(name.trim()).replace(/%20/g, " ");
	this.coordinates = new Array();
	for (var i = 0; i < coordinates.length; i++) {
	    var point = {lat:coordinates[i][1], lng:coordinates[i][0]};
	    var distance = utilities.distance(centre, point);
	    var bearing = utilities.initialBearing(centre, point);
	    var dx = Math.sin(utilities.toRadians(bearing)) * distance;
	    var dy = Math.cos(utilities.toRadians(bearing)) * distance;
	    var xCord = mapCentre.x + dx;	    
	    var yCord = mapCentre.y - dy;
	    if (xCord > 0 && xCord < width && yCord > 0 
		&& yCord < height) {
		this.coordinates[this.coordinates.length] = xCord;
		this.coordinates[this.coordinates.length] = yCord;
	    }
	}
    }

    /**
     * Calculate the x and y values for a geographical point on a flat grid.
     * @param distance The distance from the centre of the map to the point
     *  in question.
     * @param angle The bearing or angle from the centre of the map to the
     *  point in question. Specify in degrees.
     * @param centre The geographical point the map is centred around. Must
     *  be an object with lat and lng properties.
     * @return An object with x and y properties where the values are grid
     *  coordinates that can be scaled for a map.
     */
    function MapPoint (point, distance, angle, centre) {
	var dx = Math.sin(utilities.toRadians(angle)) * distance;
	var dy = Math.cos(utilities.toRadians(angle)) * distance;
	this.x = centre.x + dx;
	this.y = centre.y - dy;
	this.name = point.name + " " + point.description;
	this.name = escape (this.name.trim()).replace(/%20/g, " ");
	this.id = point.id;
	this.description = point.description;
    }
}

svgCallback = function (map) {
    if (map != undefined) {
	writeFile(toSVG(map));
    } else {
	console.log("An error occurred not generating svg.");
    }
};

callback = function (map) {
    if (points != undefined) {
	route.readRoute(points, map, svgCallback);
    } else {
	svgCallback(map);
    }
};

function run (argv) {
    if (argv[2] == "--help" || argv[2] == "-h") {
	printUsage(argv);
	return false;
    } else if (argv.length <= 2) {
	printUsage(argv);
	return false;
    } else {
	outputFile = argv[2];
	for (var i = 3; i < argv.length; i++) {
	    if (!handleArgument(argv[i])) {
		console.log("Invalid argument: " + argv[i]);
		printUsage(argv);
		return;
	    }
	}
	if (radius == undefined || centre == undefined) {
	    console.log("You did not provide all the manditory"
			+ " arguments.");
	    return false;
	} if (Object.keys(parameters).length == 0) {
	    console.log ("You must provide at least one search parameter.");
	    return false;
	}
	return true;
    }
}

function printUsage(argv) {
    console.log("Usage: " + argv[0] + " " + argv[1] + " output_file options\n");
    console.log("Options are given in the form optionName=value or"
		+ " optionName=value1,value2,value3");
    console.log("\nManditory option is:");
    console.log ("centre=lat,lng,name,radius - area to centre the map"
		 + " around with a given name and circular radius");
    console.log("\nNote at least one of the following options must be given:");
    console.log("building=true/false - Show buildings");
    console.log("highway=type1,type2,...,type_n - The types of highways to"
		+ " show on map.");
    console.log("railway=value1,value2,...,value_n - The type of railway"
		+ " networks to show");
    console.log("amenity=value1,value2,...,value_n - The types of"
		+ " amenities to show.");
    console.log("sport=value1,value2,...,value_n - Show sporting"
		+ " facilities matching any of these types.");
    console.log("\nThe following options are completely optional");
    console.log("pathway=lat1,lng1,lat2,lng2 - Mark the path between"
		+ " (lat1,lng1) and (lat2,lng2) on the map");
}

function handleArgument(argument) {
    var arrayParams = ["highway", "railway", "sport", "amenity"];
    var singleValueParams = ["building"];
    var arguments = argument.split('=');
    if (arguments.length < 2) {
	return false;
    }

    if (arguments[0] == "centre") {
	var values = arguments[1].split(",");
	if (values.length == 4) {
	    centre = {lat:values[0],lng:values[1],name:values[2]}
	    radius = values[3];
	    return true;
	}
    }
    if (arrayParams.indexOf(arguments[0]) > -1) {
	parameters[arguments[0]] = arguments[1].split(",");
	return true;
    }
    if (singleValueParams.indexOf(arguments[0]) > -1) {
	parameters[arguments[0]] = arguments[1];
	return true;
    }
    if (arguments[0] == "pathway") {
	var pointsList = arguments[1].split(",");
	if (pointsList.length == 4) {
	    points = [{lat:pointsList[0],lng:pointsList[1]},
		      {lat:pointsList[2],lng:pointsList[3]}];
	    return true;
	}
    }
    return false;
}

function writeFile (text) {
    fs.writeFile (outputFile, text, function (err) {
	if (err) {
	    console.log("An error occurred writing the svg to " + outputFile);
	} else {
	    console.log("The map was written to: " + outputFile);
	}
    });
}

var radius;
var parameters = {};
var centre;
var points;
var outputFile;
if (run(process.argv)) {
    var map = new Map (centre, radius);
    openStreet.readFromOSM(map, callback, parameters);
}
