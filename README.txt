This repository contains a nodejs javascript package which generates
maps as SVG images for the GraViewer application on Ipad. This means
that maps can be made accessible to a vision impaired person. 

For an in depth discussion of the problem and the implemented solution
please refer to the report within the report sub-directory of this
repository. 

REQUIREMENTS 

nodejs is required to run this javascript service. Nodejs can be
installed on a debian based system as follows:
apt-get install nodejs 

The following additional nodejs libraries are required. 
request: Used to perform http requests to external api.
npm install -g request 

cheerio: Light weight alternative to jQuery.
npm install -g cheerio 

STRUCTURE 

The code is spread across four files. 
* utilities.js: General functions that are used throughout the project 
* mapConstructor.js: Contains the map class and the basic program code
  to produce an SVG map.
* openStreet.js: Functions for adding data to the map  from the open
  street maps database.
* route.js: Functions for contacting the heremaps routing api and adding
  route points to the map.
* googlePlaceSearch.js: Used to get results from the google places
  api. No longer used.

USAGE:

nodejs mapconstructor.js --help 
Provide usage information.

nodejs mapconstructor.js centre=lat1,lng1,lat2,lng2,name,radius searchparameter=value pathway=lat1,lng1,lat2,lng2

Note that the centre parameter is compulsary. 
At least one of the search parameters are compulsory run with the --help
switch to see what these are.
Two ways to set the search parameter. For an array of values:
highway=trunk,primary 
For a single value:
highway=primary 

The final argument is pathway. This is used to create a path on the map
between (lat1, lng1) and (lat2, lng2). This is not compulsory. 

Example:
nodejs mapconstructor.js /tmp/out.svg "centre=-37.875260,145.164821,a map,650" "highway=trunk,primary,secondary" amenity="fast_food" pathway=-37.8797175,145.1629331,-37.8767807,145.16536

Create a map titled "a map" with radius 650 centred around Glen
waverley. Show trunk, primary and secondary highways. Also show fast
food outlets. Show a path from the Glen waverley station to Papa Jon's
pizza restaurant.
Write the output map to /tmp/out.svg

KNOWN BUGS
1. Some images crash GraViewer. Haven't narrowed this down to a
particular case, but happens when using a radius > 400 at showing monash
university including roads. Other cases as well such as residential
streets in Glen waverley with a large enough radius. 
2. Some text strings are spoken by GraViewer as a single joined word
even though they appear correctly in the svg file. An example of this
are the circular nodes that indicate the instruction of direction to
follow the path between two places.

TODO 

1. Use colour coding for different objects on the map. Will help with
audio feedback, but also from the perspective of a sighted person.
2. Indicate intersections between roads and pathways when they are
crossed when exploring the map.
3. Currently data is retrieved from a local json file. Automate the
process by using a web service possibly here maps. We currently use open
street maps data which is suitable if a web service of this nature can
be found. 
4. Add additional filtering options for search results. Currently there
is highway, railway, amenity, sport and building.
5. Improve placing of objecs. Eg. placing nodes on top of lines.
6. Improve the scaling and orientation of objects on the map.
7. Improve error handling. Firstly, pass more detailed error information
down the chain.
8. Take advantage of asynchronous processing eg. reading file or waiting
for web service. Eg. determine the path between two points concurrently
while retrieving map data. 

Daniel Dalton Monash University 

dadal2@student.monash.edu 

Updated 18/06/2015
