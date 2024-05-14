# localmap.js: Local Map

Plots GPS data on an interactive offline map of the local area.

## Example

https://woollymittens.github.io/local-area-map/

Visit [sydneytrainwalks.com](https://sydneytrainwalks.com/) or [sydneyhikingtrips.com](https://sydneyhikingtrips.com/) for a practical application of this library.

## How to include the script

The includes can be added to the HTML document:

```html
<link rel="stylesheet" href="css/local-area-map.css"/>
<script src="js/local-area-map.js" type="module"></script>
```

Or as a [Javascript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules):

```js
import { LocalAreaMap } from "js/local-area-map.js";
```

## How to populate the data

### Editing the guide


Edit ```guide.json``` to modify the details and add waypoints to the map.

```javascript
{
  ...
  "description": "This walk combines the Daleys Point walking track, Bouddi Coastal Walk, and the Flannel Flower walking track into a varied loop.",
  "keywords": {
    "Daleys Point walking track": "https://www.nationalparks.nsw.gov.au/things-to-do/walking-tracks/daleys-point-walking-track",
    "Bouddi Coastal Walk": "https://www.nationalparks.nsw.gov.au/things-to-do/walking-tracks/bouddi-coastal-walk",
    "Flannel Flower walking track": "https://www.nationalparks.nsw.gov.au/things-to-do/walking-tracks/flannel-flower-walking-track"
  },
  "distance": [
    10,
    20
  ],
  ...
}
```

Above section is used to populate the header of the legend. The keywords are linked automatically.

```javascript
{
  ...
  "key": "woywoy-bouddi-woywoy",
  ...
}
```

This unique key is used to store the state of this map in local storage.

```javascript
{
  ...
  "bounds": {
    "west": 151.327391,
    "north": -33.484266,
    "east": 151.444158,
    "south": -33.554566
  },
  ...
}
```

These coordinates determine the boundary of the map. When a scanned map is used, fill in its coverage area precisely.

```javascript
{
  ...
  {
    "type": "ferry",
    "photo": "pxl_20240426_223045396.jpg",
    "location": "Wagstaff",
    "description": "Plan your trip to Wagstaffe at <a href=\"https://transportnsw.info/trip#/?to=Wagstaffe Wharf\">transportnsw.info</a>.",
    "lon": 151.34351,
    "lat": -33.522901
  },
  ...
}
```

This example would show a specific icon on the map. The following are supported: bus, ferry, train, tram, hotel, info, kiosk, landmark, photo, tent, toilet, walk, warning.

If a photo is not provided, a fallback image will be used in the legend.

```javascript
{
  ...
  {
    "type": "waypoint",
    "photo": "pxl_20240426_223045396.jpg",
    "lon": 151.363925,
    "lat": -33.50922700006975,
    "description": "Lorem ipsum dolor sit amet."
  },
  ...
}
```

Above example shows a waypoint dot on the map, which is coupled to photographic entry in the legend.

```javascript
{
  ...
  {
    "type": "hotspot",
    "photo": "pxl_20240426_232316917.jpg",
    "radius": 0.0004,
    "lon": 151.3909083,
    "lat": -33.5227556,
    "description": "Lorem ipsum dolor sit amet.",
    "badge": "wizard_2",
    "title": "Shorefront Realestate",
    "instruction": "Visit this location to earn the mystery trophy"
  },
  ...
}
```

A hot spot has a radius within which the ```enterHotspot``` handler is triggered.

It will display the ```instruction``` instead of the ```description``` if the ```checkHotspot``` handler has been answered with ```return true```.

### Downloading map tiles

The following node script will download the OpenStreetMap tiles that fit inside the bounds of the map and cache them in the ```tiles``` folder.

```powershell
npm run download_tiles
```

### Import photographic geolocation data

The following node script will import the geolocation (EXIF) data from the contents of the ```photos``` folder.

```powershell
npm run import_exif
```

## How to start the script

```javascript
const localAreaMap = new LocalAreaMap({
  // options
  'showFirst': true,
  'mobileSize': "(max-width: 959px)",
  // containers
  'container': document.querySelector('.local-area-map'),
  'legend': document.querySelector('.local-area-map-legend'),
  // assets
  'thumbsUrl': './thumbnails/',
  'photosUrl': './photos/',
  'markersUrl': './img/marker-{type}.svg',
  'exifUrl': './data/exif.json',
  'guideUrl': './data/guide.json',
  'routeUrl': './data/route.gpx',
  'mapUrl': './photos/pxl_20240127_210532650.jpg',
  //'tilesUrl': './tiles/{z}/{x}/{y}.png',
  //'tilesZoom': 15,
  // templates
  'introTemplate': document.querySelector('#intro-template').innerHTML,
  'outroTemplate': document.querySelector('#outro-template').innerHTML,
  'creditsTemplate': document.querySelector('#credit-template').innerHTML,
  // events
  'checkHotspot': (marker) => { return true; },
  'enterHotspot': (marker) => {},
  'leaveHotspot': (marker) => {},
  'showPhoto': (url, urls) => {}
});
```

**showFirst : {Boolean}** - 

**mobileSize : {String}** - A media query below which the mobile version should be used.

**container : {DOM node}** - The HTML DOM element that will contain the map.

**legend : {DOM node}** - Optional HTML DOM element that will contain the legend.

**thumbsUrl : {String}** - Template for the path to the thumbnail assets.

**photosUrl : {String}** - Template for the path to the photo assets.

**markersUrl : {String}** - Template for the path to the marker images.

**exifUrl : {String}** - Path to a lookup table for the geolocation data of photos.(1)

**guideUrl : {String}** - Path to the JSON guide to display.

**routeUrl : {String}** - Path to the GPX route to display.

**mapUrl : {String}** - Optionally a path to the single image background to use INSTEAD of OpenStreetMap map tiles.

**tilesUrl : {String}** - Optionally a path to OpenStreetMap map tiles to use INSTEAD of a single image background.

**tilesZoom : {String}** - The OpenStreetMap zoom level of the map tiles.

**introTemplate : {DOM node}** - Template for the header above the legend.

**outroTemplate : {DOM node}** - Template footer below the legend.

**creditsTemplate : {DOM node}** - Template for the map's copyright notice.

**checkHotspot : {Function}** - A handler to verify whether a trophy should be shown.

**enterHotspot : {Function}** - A handler for when the device enters the area around a hotspot.

**leaveHotspot : {Function}** - A handler for when the device exists the area around a hotspot.

**showPhoto : {Function}** - A handler for when a thumbnail is clicked.

## How to control the script

### Indicate

```javascript
localmap.indicate({
  lon: ...,
  lat: ...,
  zoom: ...,
  referrer: ...,
});
```

Highlights and centres a specific location.

**lon : {String}** - The longitude to be indicated.

**lat : {String}** - The latitude to be indicated.

**zoom : {Integer}** - Zoom in on the indicated location to the given OpenStreetMap zoom level (i.e 15-18).

**referrer : {DOM Element}** - This DOM element will get the "data-active" attribute while the map is focused on the related location.

### Unindicate

```javascript
localmap.unindicate();
```

Reset the map after "indicate" was used.

### Stop

```javascript
localmap.stop();
```

## License

This work is licensed under a [MIT License](https://opensource.org/licenses/MIT). The latest version of this and other scripts by the same author can be found on [Github](https://github.com/WoollyMittens).
