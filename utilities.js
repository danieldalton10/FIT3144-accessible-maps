function toRadians (deg) {
    return deg/180.0 * Math.PI;
}

function distance(location1, location2) {
    const R = 6372.8; // km
    var lat1 = toRadians(location1.lat);
    var  lon1 = toRadians(location1.lng);
    var lat2 = toRadians(location2.lat);
    var lon2 = toRadians(location2.lng);
    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;
    var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLon / 2) * Math.sin(dLon /2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
}
