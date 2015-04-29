var GooglePlaces = require("googleplaces");
var utilities = require("./utilities.js");

var apikey = process.env.GOOGLE_PLACES_API_KEY;
/**
 * Place search - https://developers.google.com/places/documentation/#PlaceSearchRequests
 */
var parameters = {
    location:[-33.8670522, 151.1957362],
    types:"cafe", 
    radius:150
};

function Map (width, height, centre) {
    this.height = height;
    this.width = width;
    this.centre = centre;
    this.mapPoints = new Array();
    this.addPoints = function (points) {
	var maxDistance = findMaxDistance(centre, points).distance;
	var mapCentre = {x:width/2, y:height/2};
	var maxMapDistance = Math.min(width, height)/2;
	for (var i = 0; i < points.length; i++) {
	    var distance = (utilities.distance(centre, points[i].geometry.location) /
			maxDistance) * maxMapDistance;
	    var bearing = utilities.initialBearing(centre,
					       points[i].geometry.location);
	    this.mapPoints[i] = computeMapPoint (distance, bearing,
						 mapCentre);
	    this.mapPoints[i].name = points[i].name;
	    this.mapPoints[i].vicinity = points[i].vicinity;
	    console.log(this.mapPoints[i].name + ": " +
			this.mapPoints[i].vicinity + " (" + this.mapPoints[i].x +", " +
			this.mapPoints[i].y + ")");
	}
	console.log(toSVG(this));
    };
}

function computeMapPoint (distance, angle, centre) {
    var dx = Math.sin(utilities.toRadians(angle)) * distance;
    var dy = Math.cos(utilities.toRadians(angle)) * distance;
    return {x:centre.x + dx,
	    y:centre.y + dy};
}

function addPlacesToMap (key, parameters, map) {
    var googlePlaces = new GooglePlaces(key, "json");
    googlePlaces.placeSearch(parameters, function (error, response) {
	if (error) {
	    throw error;
	}
	map.addPoints(response.results);
    });
}

function toSVG (map) {
    var svg = "<svg height =\"" + map.height + "\" width=\"" + map.width
	    + "\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\”>\n";
    for (var i = 0; i < map.mapPoints.length; i++) {
	svg += "<circle cx=\"" + Math.round(map.mapPoints[i].x) + "\" cy=\"" +
	    Math.round(map.mapPoints[i].y) + "\" r=\"20\" stroke=\"black\" stroke-width=\"3\" fill=\"red\" />\n";
    }
    svg += "</svg>";
    return svg;
}

var centre = {lat:-33.8670522, lng:151.1957362};
var map = new Map (200, 200, centre);
addPlacesToMap (apikey, parameters, map);
