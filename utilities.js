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
 * Convert a map object to svg.
 * @param map A Map object to generate a SVG for.
 * @return svg string for map.
*/
toSVG = function (map) {
    var colour = 0xFF0000;
    var svg = "<svg height =\"" + map.height + "\" width=\"" + map.width
	    + "\" xmlns=\"http://www.w3.org/2000/svg\""
	    + " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
    var metadata = "<metadata id=\"1401062652130\" title=\""+makeTitle(map)+"\""
	    + " description=\"Automatically generated map\""
	    + " category=\"map\">\n"
	    + "<summary>\n" + buildDescription(map) + "\n"
	    + "</summary>\n";

    for (var i = 0; i < map.mapLines.length; i++) {
	svg += svgPolyShape("polyline", map.mapLines[i], colour);
	metadata += addMetadata(map.mapLines[i], colour);
	++colour;
    }

    for (var i = 0; i < map.mapPolygons.length; i++) {
	svg += svgPolyShape("polygon", map.mapPolygons[i], colour);
	metadata += addMetadata(map.mapPolygons[i], colour);
	++colour;
    }

    for (var i = 0; i < map.mapPoints.length; i++) {
	svg += svgCircle (map.mapPoints[i], colour);
	metadata += addMetadata(map.mapPoints[i], colour);
	++colour;
    }

    metadata += "  </metadata>\n";
    svg += metadata + "</svg>";
    return svg;
};

function svgCircle (point, colour) {
    var svg = "<circle id=\"" + point.id + "\" cx=\"" + Math.round(point.x) + "\" cy=\"" 
	+ Math.round(point.y) + "\" r=\"40\" stroke=\"#"+colour.toString(16)+"\" stroke-width=\"10\" fill=\"#"+colour.toString(16)+"\" />\n";
    return svg;
}

function svgPolyShape (type, polyShape, colour) {
    var svg = "<" + type + " id=\"" + polyShape.id + "\" points=\"";
    for (var j = 0; j < polyShape.coordinates.length; j+=2) {
	svg += Math.round(polyShape.coordinates[j]) + "," +
	    Math.round(polyShape.coordinates[j+1]);
	if (j+2 < polyShape.coordinates.length) {
	    svg += " ";
	}
    }
    svg += "\" style=\"stroke:#"+colour.toString(16)+"\" stroke-width=\"20\" fill=\"#"+colour.toString(16)+"\"/>\n";
    return svg;
}

function addMetadata (point, colour) {
    var metadata = "    <gravvitas>\n"
	    + "<id>" + point.id + "</id>\n"
	    + "      <interiorcolor>"+colour.toString(16)+"</interiorcolor>\n"
	    + "      <bordercolor>\n"
	    + "</bordercolor>\n"
	    + "<cornercolor>\n"
	    + "</cornercolor>\n"
	    + "<audio>\n"
	    + "</audio>\n"
	    + "<volume>\n"
	    + "</volume>\n"
	    + "<text>"+point.name
	    +"</text>\n"
	    + "      <vibration>\n"
	    +"      </vibration>\n"
	    +"      <annotation>\n"
	    +"      </annotation>\n"
	    +"    </gravvitas>\n";
    return metadata;
}

function buildDescription (map) {
    // todo count streets and POI correctly, but this should be a good
    // indication for now.
    // for instance mapLines can refer to roads, railway lines, tram tracks
    // and cycle ways. 
    var roads = new Array();
    for (var i = 0; i < map.mapLines.length; i++) {
	if (roads.indexOf(map.mapLines[i].name) < 0) {
	    roads[roads.length] = map.mapLines[i].name;
	}
    }
    return "This map is centred around " + map.centre.name +"." 
	+ " It contains " + roads.length + " streets, and "
	+ (map.mapPoints.length + map.mapPolygons.length) + " points of"
	+ " interest.";
}

function makeTitle (map) {
    return map.centre.name + " " + map.height + " by " + map.width;
}

exports.distance = distance;
exports.initialBearing = initialBearing;
exports.toRadians = toRadians;
exports.toSVG = toSVG;
