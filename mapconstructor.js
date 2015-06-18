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

    /**
     * Add a line to the map passing through a set of points.
     * @param id The unique id of the line. 
     * @param coordinates The array of coordinates that the line should pass
     *  through. Of the form [[lng,lat], [lng,lat]]. Must contain at
     *  least two points.
     * @param name The name of the line to be added. This name will be spoken
     *  when the user touches the line.
     */
    this.addLine = function (id, coordinates, name) {
	var line = new MapPolyShape (id,
				coordinates,
				name,
				this.centre, this.mapCentre, this.width, this.height);
	// line must pass through at least 2 points on the map
	if (line.coordinates.length > 1) {
	    this.mapLines[this.mapLines.length] = line;
	}
    }

    /**
     * Add a polygon shape on the map. Useful for displaying buildings.
     * @param id The id of the polygon. 
     * @param coordinates The array of coordinates that the polygon
     *  includes. [[lng,lat],[lng,lat],[lng,lat]] must include 3 or more
     *  points.
     * @param name The name of the polygon (will be spoken to the user).
     */
    this.addPolygon = function (id, coordinates, name) {
	var polygon = new MapPolyShape (id,
				coordinates,
				name,
				this.centre, this.mapCentre, this.width, this.height);
	// must include 3 points
	if (polygon.coordinates.length > 2) {
	    this.mapPolygons[this.mapPolygons.length] = polygon;
	}
    }

    /**
     * Produces a PolyShape object with a name, id and a set of points that
     *  the shape includes.
     * @param id The id of this shape. 
     * @param coordinates The array of coordinates that this shape
     *  includes. [[lng,lat],[lng,lat],]
     * @param name The name of this shape.
     * @param centre The location that the map is centred around. Must have a
     *  lat and lng properties. 
     * @param mapCentre The centre of the map. Has x and y properties. 
     * @param width The width of the map 
     * @param height The height of the map
     */
    function MapPolyShape (id, coordinates, name, centre, mapCentre, width, height) {
	this.id = id;
	// escape name and replace %20 with space
	this.name = escape(name.trim()).replace(/%20/g, " ");
	this.coordinates = new Array();
	// for each pair of coordinates scale them to fit on the map and create
	// a flat array of x, y coords on the map.
	for (var i = 0; i < coordinates.length; i++) {
	    var point = {lat:coordinates[i][1], lng:coordinates[i][0]};
	    var distance = utilities.distance(centre, point);
	    var bearing = utilities.initialBearing(centre, point);
	    var dx = Math.sin(utilities.toRadians(bearing)) * distance;
	    var dy = Math.cos(utilities.toRadians(bearing)) * distance;
	    var xCord = mapCentre.x + dx;	    
	    var yCord = mapCentre.y - dy;
	    // make sure this point fits on our image
	    if (xCord > 0 && xCord < width && yCord > 0 
		&& yCord < height) {
		this.coordinates[this.coordinates.length] = xCord;
		this.coordinates[this.coordinates.length] = yCord;
	    }
	}
    }

    /**
     * Create a MapPoint object which is a single point on a map.
     * @param point The point which is being added needs (name and id properties)
     * @param distance The distance from the centre of the map to the point
     *  in question.
     * @param angle The bearing or angle from the centre of the map to the
     *  point in question. Specify in degrees.
     * @param centre The geographical point the map is centred around. Must
     *  be an object with lat and lng properties.
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

/**
 * Callback to be called which produces the svg. Should be called after
 *  the map has been produced. 
 * @param map The map to produce an svg for. If undefined it means there
 *  was an error and no svg output will be produced. 
 */
svgCallback = function (map) {
    if (map != undefined) { // no errors write svg to file 
	writeFile(toSVG(map));
    } else {
	console.log("An error occurred not generating svg.");
    }
};

/**
 * Callback which invokes the route API if desired. This should be called
 *  after any other map operations have finished. Routing api only
 *  called upon if the points global variable has items.
 * @param map The map object which requires routing data to be attached
 *  to it.  */
callback = function (map) {
    if (points != undefined) { // we have a route to plot 
	route.readRoute(points, map, svgCallback);
    } else { // no route needed so call svg directly 
	svgCallback(map);
    }
};

/**
 * Handles the command line arguments and sets up global variables for
 *  subsequent requests.
 * @param argv The argv vector of command line arguments. The first
 *  command line argument is argv[2].
 * @return true if processing can continue otherwise false if an error
 *  occurred or help was triggered and the application should terminate.
 */
function handleCommandLineArguments (argv) {
    if (argv[2] == "--help" || argv[2] == "-h") {
	printUsage(argv);
	return false;
    } else if (argv.length <= 2) { // no args supplied
	printUsage(argv);
	return false;
    } else { // handle arguments
	outputFile = argv[2]; // set the output file
	// handle each command line argument
	for (var i = 3; i < argv.length; i++) {
	    if (!handleArgument(argv[i])) { // this argument produced an error exit
		console.log("Invalid argument: " + argv[i]);
		printUsage(argv);
		return;
	    }
	}
	// check manditory arguments were provided
	if (radius == undefined || centre == undefined) {
	    console.log("You did not provide all the manditory"
			+ " arguments.");
	    return false;
	} if (Object.keys(parameters).length == 0) { // require at least one search filter
	    console.log ("You must provide at least one search parameter.");
	    return false;
	}
	return true; // enough acceptable arguments provided
    }
}

/**
 * Print program usage information.
 * @param argv The argv array of command line elements for this instance
 *  of the program.
 */
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

/**
 * Handle one single command line argument that was supplied. Set any
 *  global variables appropriately for requests.
 * @param argument One of the command line arguments provided. That is an
 *  element of process.argv
 * @return true If argument was acceptable else false.
 */
function handleArgument(argument) {
    // all of the search params that can take an array of values 
    var arrayParams = ["highway", "railway", "sport", "amenity"];
    // search filters that take only one value
    var singleValueParams = ["building"];
    // argument=value split into argument and value
    var arguments = argument.split('=');
    if (arguments.length < 2) { // argument=value wasn't supplied 
	return false;
    }

    // set up the centre parameter if this argument is "centre"
    if (arguments[0] == "centre") {
	var values = arguments[1].split(",");
	// need lat,lng,name,radius values supplied separated by commas 
	if (values.length == 4) {
	    centre = {lat:values[0],lng:values[1],name:values[2]}
	    radius = values[3];
	    return true;
	}
    }
    // handle an array search parameter
    if (arrayParams.indexOf(arguments[0]) > -1) {
	parameters[arguments[0]] = arguments[1].split(",");
	return true;
    }
    // handle a single value search parameter
    if (singleValueParams.indexOf(arguments[0]) > -1) {
	parameters[arguments[0]] = arguments[1];
	return true;
    }
    // handle the pathway=lat1,lng1,lat2,lng2 argument
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

/**
 * Write a string to outputFile.
 * @param text The string of text to write.
 */
function writeFile (text) {
    fs.writeFile (outputFile, text, function (err) {
	if (err) {
	    console.log("An error occurred writing the svg to " + outputFile);
	} else {
	    console.log("The map was written to: " + outputFile);
	}
    });
}

var radius; // radius of roads and places to be included from centre
var parameters = {}; // search filter parameters
var centre; // The geograpical point map is centred around
var points; // The points that are involved in a route
var outputFile; // file path to write output svg
// check if command line arguments are valid
if (handleCommandLineArguments(process.argv)) {
    // construct the map 
    var map = new Map (centre, radius);
    // collect data from OSM and then invoke callback(map)
    openStreet.readFromOSM(map, callback, parameters);
}
