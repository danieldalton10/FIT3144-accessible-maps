/**
 * Functions used to construct an svg map
*/

var GooglePlaces = require("googleplaces");
var utilities = require("./utilities.js");
var fs = require('fs')

var apikey = process.env.GOOGLE_PLACES_API_KEY;
var centre = new GeographicalPoint("abc", -37.875260, 145.164821, "Centre", "");

/**
 * Place search - https://developers.google.com/places/documentation/#PlaceSearchRequests
 */
var parameters = {
//-33.8670522, 151.1957362
    location:[centre.lat, centre.lng],
    types:"food", 
    radius:1000
};

/**
 * Define a map object. This object contains methods related to
 *  manipulating the map data stored as members of the object.
 * @param width the width of the map in svg pixels 
 * @param height The map height in SVG pixels.
 * @param centre An object with lat lng properties which the map will be
 *  centred around.
*/
function Map (centre, radius) {
    this.height = Math.round(radius * 5/3);
    this.width = Math.round(radius * 5/3);
    this.centre = centre;
    this.mapPoints = new Array();
    this.mapLines = new Array();
    this.mapCentre = {x:this.width/2, y:this.height/2};
    /**
     * Add points to the map. Points are scaled to fit the map. This can
     *  be used as a callback eg. from a function who's job it is to
     *  retrieve this data from the external service.
     * @param points an array of points that have geometry.lat/lng, name, id 
     * and vicinity properties.
     */
    this.addPoint = function (point) {
	// scale for the map
	var distance = utilities.distance(centre, point);
	var bearing = utilities.initialBearing(centre, point);
	this.mapPoints[this.mapPoints.length] = new MapPoint (point, distance, bearing, this.mapCentre);
    }

    this.addLine = function (id, coordinates, name) {
	var line = new MapLine (id,
				coordinates,
				name,
				this.centre, this.mapCentre, this.width, this.height);
	if (line.coordinates.length > 1) {
	    this.mapLines[this.mapLines.length] = line;
	}
    }

    function MapLine (id, coordinates, name, centre, mapCentre, width, height) {
	this.id = id;
	this.name = escape(name).replace(/%20/g, " ");
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
	this.name = escape (this.name).replace(/%20/g, " ");
	this.id = point.id;
	this.description = point.description;
    }
}


/**
 * Perform a google places search and add places to the map by means of
 *  the callback method map.addPoints
 * @param key Google places API key
 * @param parameters Parameters for the places api.
 * @param map The map to add the places to with the call back method
 *  addPoints(arrayOfPlaces)
 * @return nothing 
 */
function locationSearchService (key, parameters, map) {
    var googlePlaces = new GooglePlaces(key, "json");
    googlePlaces.placeSearch(parameters, function (error, response) {
	if (error) {
	    throw error;
	}
	for (var i = 0; i < response.results.length; i++) {
	    var point = new GeographicalPoint(response.results[i].id, response.results[i].geometry.location.lat,
					      response.results[i].geometry.location.lng, response.results[i].name,
					      response.results[i].vicinity);
	    map.addPoint (point);
	}
//	console.log(toSVG(map));
    });
}

function openStreetService (map) {
    fs.readFile('glen.json', 'utf8', function (err,data) {
	if (err) {
	    return console.log(err);
	}
	results = JSON.parse(data);
	points = new Array();
	for (var i = 0; i < results.features.length; i++) {
	    if (results.features[i].properties.name == "Springvale Road") {
		map.addLine (results.features[i].id,
			     results.features[i].geometry.coordinates, results.features[i].properties.name);
	    }
	}
	map.addPoint(map.centre);
	console.log(toSVG(map));
    });
}

function GeographicalPoint (id, lat, lng, name, description) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lng = lng;
    this.description = description;
}

/**
 * Convert a map object to svg.
 * @param map A Map object to generate a SVG for.
 * @return svg string for map.
*/
function toSVG (map) {
    var colour = 0xFF0000;
    var svg = "<svg height =\"" + map.height + "\" width=\"" + map.width
	    + "\" xmlns=\"http://www.w3.org/2000/svg\""
	    + " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
    var metadata = "<metadata id=\"1401062652130\" title=\"springvale rd8\""
	    + " description=\"Places in Pyrmont Sydney\""
	    + " category=\"map\">\n"
	    + "<summary>\n"
	    + "</summary>\n";

    for (var i = 0; i < map.mapPoints.length; i++) {
	svg += "<circle id=\"" + map.mapPoints[i].id + "\" cx=\"" + Math.round(map.mapPoints[i].x) + "\" cy=\"" +
	    Math.round(map.mapPoints[i].y) + "\" r=\"80\" stroke=\"#"+colour.toString(16)+"\" stroke-width=\"3\" fill=\"#"+colour.toString(16)+"\" />\n";
	metadata += "    <gravvitas>\n"
	    + "<id>" + map.mapPoints[i].id + "</id>\n"
	    + "      <interiorcolor>"+colour.toString(16)+"</interiorcolor>\n"
	    + "      <bordercolor>\n"
	    + "</bordercolor>\n"
	    + "<cornercolor>\n"
	    + "</cornercolor>\n"
	    + "<audio>\n"
	    + "</audio>\n"
	    + "<volume>\n"
	    + "</volume>\n"
	    + "<text>"+map.mapPoints[i].name
	    +"</text>\n"
	    + "      <vibration>\n"
	    +"      </vibration>\n"
	    +"      <annotation>\n"
	    +"      </annotation>\n"
	    +"    </gravvitas>\n";
	++colour;
    }
    for (var i = 0; i < map.mapLines.length; i++) {
	svg += "<polyline id=\"" + map.mapLines[i].id + "\" points=\"";
	for (var j = 0; j < map.mapLines[i].coordinates.length; j+=2) {
	    svg += Math.round(map.mapLines[i].coordinates[j]) + "," +
		Math.round(map.mapLines[i].coordinates[j+1]);
	    if (j+2 < map.mapLines[i].coordinates.length) {
		svg += " ";
	    }
	}
	svg += "\" style=\"stroke:#"+colour.toString(16)+"\" stroke-width=\"80\" fill=\"#"+colour.toString(16)+"\"/>\n";
	metadata += "    <gravvitas>\n"
	    + "<id>" + map.mapLines[i].id + "</id>\n"
	    + "      <interiorcolor>"+colour.toString(16)+"</interiorcolor>\n"
	    + "      <bordercolor>\n"
	    + "</bordercolor>\n"
	    + "<cornercolor>\n"
	    + "</cornercolor>\n"
	    + "<audio>\n"
	    + "</audio>\n"
	    + "<volume>\n"
	    + "</volume>\n"
	    + "<text>"+map.mapLines[i].name
	    +"</text>\n"
	    + "      <vibration>\n"
	    +"      </vibration>\n"
	    +"      <annotation>\n"
	    +"      </annotation>\n"
	    +"    </gravvitas>\n";
	++colour;
    }
    metadata += "  </metadata>\n";
    svg += metadata + "</svg>";
    return svg;
}

var map = new Map (centre, 1000);
//locationSearchService (apikey, parameters, map);
openStreetService(map);

