//OSM code

var osmread = require('osm-read');

var endDocumentHandler = function(){
    console.log('document end');
}

var boundsHandler = function(bounds){
    console.log('bounds: ' + JSON.stringify(bounds));
}
boundsHandler = null;

var nodeHandler = function(node){
    console.log('node: ' + JSON.stringify(node));
}
nodeHandler = null;

var wayHandler = function(way){
    console.log('way: ' + JSON.stringify(way));
}

var relationHandler = function(relation){
    console.log('relation: ' + JSON.stringify(relation));
}
relationHandler = null;

var errorHandler = function(msg){
    console.log('error: ' + msg);
}


var parser = osmread.parse({
    filePath: 'australia-latest.osm.pbf',
    endDocument: endDocumentHandler,
    bounds: boundsHandler,
    node: nodeHandler,
    way: wayHandler,
    relation: relationHandler,
    error: errorHandler
});
