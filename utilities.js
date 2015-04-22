toRadians = function (deg) {
    return deg/180.0 * Math.PI;
}

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

initialBearing = function (location1, location2) {
    return (bearingDegrees(location1, location2) + 360) % 360;
};

function bearingDegrees (location1, location2) {
    var lat1 = toRadians(location1.lat);
    var lat2 = toRadians(location2.lat);
    var lng1 = toRadians(location1.lng);
    var lng2 = toRadians(location2.lng);
    return Math.atan2(Math.sin(lng2-lng1) * Math.cos(lat2),
        Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1)
    ) * 180/Math.PI;
}

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

exports.distance = distance;
exports.initialBearing = initialBearing;
exports.findMaxDistance = findMaxDistance;
exports.toRadians = toRadians;
