/**
 * Functions used to construct an svg map
*/

var utilities = require("./utilities.js");
var openStreet = require("./openStreet.js");
var route = require("./route.js");
var googlePlaceSearch = require("./googlePlaceSearch.js");
var points = [{lat:-37.879965,lng:145.1628128}, {lat:-37.8745313,lng:145.1685627}];

/**
 * Define a map object. This object contains methods related to
 *  manipulating the map data stored as members of the object.
 * @param width the width of the map in svg pixels 
 * @param height The map height in SVG pixels.
 * @param centre An object with lat lng properties which the map will be
 *  centred around.
*/
function Map (centre, radius) {
    this.height = Math.round(radius * 6/3);
    this.width = Math.round(radius * 6/3);
    this.centre = centre;
    this.mapPoints = new Array();
    this.mapLines = new Array();
    this.mapPolygons = new Array();
    this.mapCentre = {x:this.width/2, y:this.height/2};

    /**
     * Add points to the map. Points are scaled to fit the map. This can
     *  be used as a callback eg. from a function who's job it is to
     *  retrieve this data from the external service.
     * @param points an array of points that have geometry.lat/lng, name, id 
     * and vicinity properties.
     */
    this.addPoint = function (id, lat, lng, name, description) {
	// scale for the map
	point = {lat:lat, lng:lng, name:name, description:description, id:id};
	var distance = utilities.distance(centre, point);
	var bearing = utilities.initialBearing(centre, point);
	var circle = new MapPoint (point, distance, bearing, this.mapCentre);
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

svgCallback = function (map) {
    if (map != undefined) {
	console.log(toSVG(map));
    } else {
	console.log("An error occurred not generating svg.");
    }
};

callback = function (map) {
    if (map == undefined) {
	console.log("An error occurred not generating svg.");
    } else {
	route.readRoute(points, map, svgCallback);
    }
};

var radius = 500;
//var centre = {lng:145.1326624, lat:-37.9114264, id:"abc",name:"Monash university", description:""};
var centre = {lat:-37.875260, lng:145.164821, name:"lines", id:"abc"};
/**
 * Place search - https://developers.google.com/places/documentation/#PlaceSearchRequests
 */
var parameters = {
    location:[centre.lat, centre.lng],
    types:"food", 
    radius:radius
};
var map = new Map (centre, radius);
var parameters = {highway:["bus_stop", "trunk", "primary", "secondary", "tertiary"],
		  railway:["station"], sport:["swimming"]};

openStreet.readFromOSM(map, svgCallback, parameters);
//console.log(process.argv);
//route.readRoute("route1.json", map, svgCallback);
