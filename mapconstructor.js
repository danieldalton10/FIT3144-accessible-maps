/**
 * Functions used to construct an svg map
*/

var GooglePlaces = require("googleplaces");
var utilities = require("./utilities.js");

var apikey = process.env.GOOGLE_PLACES_API_KEY;
/**
 * Place search - https://developers.google.com/places/documentation/#PlaceSearchRequests
 */
var parameters = {
//-33.8670522, 151.1957362
    location:[-37.870195300, 145.0423],
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
function Map (width, height, centre) {
    this.height = height;
    this.width = width;
    this.centre = centre;
    this.mapPoints = new Array();

    /**
     * Add points to the map. Points are scaled to fit the map. This can
     *  be used as a callback eg. from a function who's job it is to
     *  retrieve this data from the external service.
     * @param points an array of points that have geometry.lat/lng, name, id 
     * and vicinity properties.
     */
    this.addPoints = function (points) {
	var maxDistance = findMaxDistance(centre, points).distance;
	var mapCentre = {x:width/2, y:height/2};
	var maxMapDistance = Math.min(width, height)/2;
	for (var i = 0; i < points.length; i++) {
	    // scale for the map
	    var distance = (utilities.distance(centre, points[i].geometry.location) /
			maxDistance) * maxMapDistance;
	    var bearing = utilities.initialBearing(centre,
					       points[i].geometry.location);
	    this.mapPoints[i] = computeMapPoint (distance, bearing,
						 mapCentre);
	    this.mapPoints[i].name = points[i].name;
	    this.mapPoints[i].vicinity = points[i].vicinity;
	    this.mapPoints[i].id = points[i].id;
	    console.log(this.mapPoints[i].name + ": " +
			this.mapPoints[i].vicinity + " (" + this.mapPoints[i].x +", " +
			this.mapPoints[i].y + ")");
	}
	console.log(toSVG(this));
    };
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
function computeMapPoint (distance, angle, centre) {
    var dx = Math.sin(utilities.toRadians(angle)) * distance;
    var dy = Math.cos(utilities.toRadians(angle)) * distance;
    return {x:centre.x + dx,
	    y:centre.y + dy};
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
function addPlacesToMap (key, parameters, map) {
    var googlePlaces = new GooglePlaces(key, "json");
    googlePlaces.placeSearch(parameters, function (error, response) {
	if (error) {
	    throw error;
	}
	map.addPoints(response.results);
    });
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
    var metadata = "<metadata id=\"1401062652130\" title=\"Pyrmont Sydney\""
	    + " description=\"Places in Pyrmont Sydney\""
	    + " category=\"map\">\n"
	    + "<summary>\n"
	    + "</summary>\n";

    for (var i = 0; i < map.mapPoints.length; i++) {
	svg += "<circle id=\"" + map.mapPoints[i].id + "\" cx=\"" + Math.round(map.mapPoints[i].x) + "\" cy=\"" +
	    Math.round(map.mapPoints[i].y) + "\" r=\"20\" stroke=\"#"+colour.toString(16)+"\" stroke-width=\"3\" fill=\"#"+colour.toString(16)+"\" />\n";
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
	    + "<text>"+escape(map.mapPoints[i].name)+"</text>\n"
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

var centre = {lat:-33.8670522, lng:151.1957362};
var map = new Map (200, 200, centre);
addPlacesToMap (apikey, parameters, map);
