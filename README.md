# localmap.js: Local Map

Plots GPS data on an interactive offline map of the local area.

Try the <a href="http://www.woollymittens.nl/default.php?url=useful-localmap">demo</a>.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="css/localmap.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="data/exif-data.js"></script>
<script src="data/gpx-data.js"></script>
<script src="js/localmap.js"></script>
```

Or use [Require.js](https://requirejs.org/).

```js
requirejs([
	"js/localmap.js",
	"data/exif-data.js",
	"data/gpx-data.js"
], function(Localmap, ExifData, GpxData) {
	...
});
```

Or import into an MVC framework.

```js
var ExifData = require('data/exif-data.js');
var GpxData = require('data/gpx-data.js');
var Localmap = require('js/localmap.js');
```

## How to start the script

```javascript
var localmap = new Localmap({
	'container': document.querySelector('.localmap'),
	'markersUrl': 'img/marker-{type}.png',
	'guideUrl': 'data/milsonspoint-sydneyharbour-manly.js',
	'routeUrl': 'data/milsonspoint-sydneyharbour-manly.gpx',
	'mapUrl': 'data/milsonspoint-sydneyharbour-manly.png',
	'creditsTemplate': 'Maps &copy; <a href="http://www.4umaps.eu/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm" target="_blank">4UMaps</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> and contributors, CC BY-SA'
});
```

**container : {DOM node}** - The HTML DOM element that will contain the map.

**markersUrl : {String}** - Template for the path to the marker images.

**guideUrl : {String}** - Path to the JSON guide to display.

**routeUrl : {String}** - Path to the GPX route to display.

**mapUrl : {String}** - Path to the map image to display.

**creditsTemplate : {String}** - Template for the map's copyright notice.

## How to control the script

### Indicate

```javascript
localmap.show(lon, lat, zoom);
```

Highlights and centres a specific location.

**lon : {String}** - Longitude to zoom in on.

**lat : {String}** - Latitude to zoom in on.

**zoom : {String}** - How far to zoom in.

## How to build the script

This project uses node.js from http://nodejs.org/

This project uses gulp.js from http://gulpjs.com/

The following commands are available for development:
+ `npm install` - Installs the prerequisites.
+ `gulp import` - Re-imports libraries from supporting projects to `./src/libs/` if available under the same folder tree.
+ `gulp dev` - Builds the project for development purposes.
+ `gulp dist` - Builds the project for deployment purposes.
+ `gulp watch` - Continuously recompiles updated files during development sessions.
+ `gulp serve` - Serves the project on a temporary web server at http://localhost:8500/.
+ `gulp php` - Serves the project on a temporary php server at http://localhost:8500/.
+ `node node_scripts/importexif.js` - Imports EXIF data and creates a JSON cache file.
+ `node node_scripts/importgpx.js` - Imports GPS data and creates a JSON cache file.

## License

This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
