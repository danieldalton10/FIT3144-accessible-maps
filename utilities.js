/**
 * This module provides miscellaneous functions that are useful in the
 *  wider code.
*/

/**
 * Convert an angle in degrees to radians.
 * @param deg A number representing an angle in degrees.
 * @return The number representing the angle in radians.
*/
toRadians = function (deg) {
    return deg/180.0 * Math.PI;
}

/**
 * Compute the distance between two geographical locations in metres.
 * @param location1 An object representing the first location with 
 *  "lat" and "lng" properties.
 * @param location2 An object representing the second location with 
 *  "lat" and "lng" properties.
 * @return The distance between the points in metres.
*/
distance = function (location1, location2) {
    const R = 6372800; // earth radius in metres
    var lat1 = toRadians(location1.lat);
    var  lon1 = toRadians(location1.lng);
    var lat2 = toRadians(location2.lat);
    var lon2 = toRadians(location2.lng);
    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;
    var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLon / 2) * Math.sin(dLon /2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
};

/**
 * Calculate the initial bearing between two locations.
 * @param location1 The location which the bearing is taken from. Must
 *  contain lat and lng properties.
 * @param location2 The location at which the bearing is being sort for
 *  i.e. the end point. Must have lat and lng properties. 
 * @return An angle representing the initial bearing in degrees between 0
 *  and 360
*/
initialBearing = function (location1, location2) {
    return (bearingDegrees(location1, location2) + 360) % 360;
};

/**
 * Calculate the initial bearing between two locations.
 * @param location1 The location which the bearing is taken from. Must
 *  contain lat and lng properties.
 * @param location2 The location at which the bearing is being sort for
 *  i.e. the end point. Must have lat and lng properties. 
 * @return An angle representing the initial bearing in degrees which
 *  may be outside the range 0 and 360.
*/
function bearingDegrees (location1, location2) {
    var lat1 = toRadians(location1.lat);
    var lat2 = toRadians(location2.lat);
    var lng1 = toRadians(location1.lng);
    var lng2 = toRadians(location2.lng);
    return Math.atan2(Math.sin(lng2-lng1) * Math.cos(lat2),
        Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1)
    ) * 180/Math.PI;
}

/**
 * Find the place in a list of places that is furthest away from a single
 *  point.
 * @param centre The point which all places will be compared against.
 * Must be an object with lat and lng properties.
 * @param places An array of google place results with
 *  geometry.location.lat/lng properties.
 * @return An object with properties index (represents the position in
 *  the list of the place furthest away) and distance (the distance this
 *  place is from the centre point).
*/
findMaxDistance = function (centre, places) {
    var maxDistance = -1;
    var index = -1;
    for (var i = 0; i < places.length; i++) {
	var currentDistance = distance(centre, places[i].geometry.location);
	if (currentDistance > maxDistance) {
	    index = i;
	    maxDistance = currentDistance;
	}
    }
    return {index:index,distance:maxDistance};
};

/**
 * Convert a map object to svg.
 * @param map A Map object to generate a SVG for.
 * @return svg string for map.
*/
toSVG = function (map) {
    var colour = 0xFF0000;
    var svg = "<svg height =\"" + map.height + "\" width=\"" + map.width
	    + "\" xmlns=\"http://www.w3.org/2000/svg\""
	    + " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
    var metadata = "<metadata id=\"1401062652130\" title=\"Monash uni buildings2\""
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
	svg += "\" style=\"stroke:#"+colour.toString(16)+"\" stroke-width=\"40\" fill=\"#"+colour.toString(16)+"\"/>\n";
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
};

exports.distance = distance;
exports.initialBearing = initialBearing;
exports.findMaxDistance = findMaxDistance;
exports.toRadians = toRadians;
exports.toSVG = toSVG;
