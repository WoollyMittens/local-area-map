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
<!-- optional: --->
<script src="data/guide-data.js"></script>
<script src="data/exif-data.js"></script>
<script src="data/gpx-data.js"></script>
<!-- required: -->
<script src="js/localmap.js"></script>
```

Or use [Require.js](https://requirejs.org/).

```js
requirejs([
	// required:
	"js/localmap.js",
	// optional:
	"data/guide-data.js",
	"data/exif-data.js",
	"data/gpx-data.js"
], function(Localmap, GuideData, ExifData, GpxData) {
	...
});
```

Or import into an MVC framework.

```js
// optional:
var GuideData = require('data/guide-data.js');
var GpxData = require('data/gpx-data.js');
var ExifData = require('data/exif-data.js');
// required:
var Localmap = require('js/localmap.js');
```

## How to start the script

```javascript
var localmap = new Localmap({
	'container': document.querySelector('.localmap'),
	'legend': document.querySelector('.localmap-legend'),
	'thumbsUrl': './inc/',
	'photosUrl': '//www.sydneytrainwalks.com/inc/',
	'markersUrl': 'img/marker-{type}.svg',
	'mapUrl': 'data/adamstown-awabakal-adamstown.png',
	'guideUrl': 'data/adamstown-awabakal-adamstown.json',
	'routeUrl': 'data/adamstown-awabakal-adamstown.gpx',
	'exifUrl': 'php/imageexif.php?src=../photos/{src}',
	'guideData': GuideData['adamstown-awabakal-adamstown'],
	'routeData': GpxData['adamstown-awabakal-adamstown'],
	'exifData': ExifData['adamstown-awabakal-adamstown'],
	'creditsTemplate': 'Maps &copy; <a href="http://www.4umaps.eu/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm" target="_blank">4UMaps</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> and contributors, CC BY-SA'
});
```

**container : {DOM node}** - The HTML DOM element that will contain the map.

**legend : {DOM node}** - Optional HTML DOM element that will contain the legend.

**thumbsUrl : {String}** - Template for the path to the thumbnail assets.

**photosUrl : {String}** - Template for the path to the photo assets.

**markersUrl : {String}** - Template for the path to the marker images.

**mapUrl : {String}** - Path to the map image to display.

**guideUrl : {String}** - Path to the JSON guide to display.

**routeUrl : {String}** - Path to the GPX route to display.

**exifUrl : {String}** - Path a webservice that extracts geolocation data from photos.

**guideData : {String}** - An optional cache of guides.

**routeData : {String}** - An optional cache of GPS routes.

**exifData : {String}** - An optional cache of geolocation data.

**creditsTemplate : {String}** - Template for the map's copyright notice.

## How to control the script

### Indicate

```javascript
localmap.indicate(element);
```

Highlights and centres a specific location.

**element : {DOM node}** - Reference to a link or image for which EXIF geolocation data is available.

### Unindicate

```javascript
localmap.unindicate(element);
```

Reset the map after "indicate" was used.

### Stop

```javascript
localmap.stop();
```

End the script gracefully, for re-use of the container.

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
+ `cd node_scripts`
	+ `node importexif` - Prepare a cache of GPS data of all the photos.
	+ `node importgpx` - Prepare a cache of GPS data of all routes.
	+ `node importguides` - Prepare a cache of JSON data for all the guides.
	+ `node importmaps` - Downloads the required map tiles from an OpenStreetMap server".

## License

This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
