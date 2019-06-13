/*
	Source:
	van Creij, Maurice (2019). "useful.parkmap.js: An interactive map of the local area.", version 20190516, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Localmap = function(config) {

  // PROPERTIES

  this.config = {
    'container': null,
    'canvasElement': null,
    'assetsUrl': null,
    'markersUrl': null,
    'guideUrl': null,
    'guideData': null,
    'routeUrl': null,
    'routeData': null,
    'mapUrl': null,
    'exifData': null,
    'exifUrl': null,
    'creditsTemplate': null,
    'useTransitions': null,
		'minimum': {
			'lon': null,
			'lat': null,
			'zoom': null
		},
		'maximum': {
			'lon': null,
			'lat': null,
			'zoom': null
		},
		'position': {
			'lon': null,
			'lat': null,
			'zoom': null
		},
    'indicator': {
      'icon': null,
      'photo': null,
      'description': null,
      'lon': null,
			'lat': null,
			'zoom': null
    }
  };

  for (var key in config)
    this.config[key] = config[key];

  // METHODS

  this.start = function() {
		var _this = this;
    /*
		setTimeout(function() {
      _this.focus(151.720030345, -32.9337152839, 1, true);
		}, 2000);
    setTimeout(function() {
      _this.focus(151.718354, -33.01304, 1.5, true);
		}, 4000);
    setTimeout(function() {
      _this.focus(151.708188, -32.978277000000006, 2, true);
		}, 6000);
    */
	};

  this.update = function() {
    // retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
  };

  this.redraw = function() {
    // update all components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
  };

  this.focus = function(lon, lat, zoom, smoothly) {
    // try to keep the focus within bounds
    this.config.useTransitions = smoothly;
    this.config.position.lon = Math.max(Math.min(lon, this.config.maximum.lon), this.config.minimum.lon);
    this.config.position.lat = Math.min(Math.max(lat, this.config.maximum.lat), this.config.minimum.lat);
    this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
    this.update();
  };

  this.indicate = function(source, description, lon, lat) {
    // TODO: get the coordinates from the cached exif data or failing that the webservice
    var cached = this.config.exifData[source];
    lon = lon || cached.lon;
    lat = lat || cached.lat;
    // make a promise for when the exif data is fetched
    var _this = this;
    var resolution = function(lon, lat) {
      // highlight a location with an optional description on the map
      _this.focus(lon, lat, _this.config.maximum.zoom, true);
      // store the marker data somewhere for the sub-component to get it
      _this.config.indicator = {
        'photo': source,
        'description': description,
        'lon': cached.lon,
        'lat': cached.lat
      };
      // redraw
      _this.update();
    };
    // TODO: for now resolve the promise immediately instead of after the EXIF AJAX call
    resolution(lon, lat);
  };

  this.describe = function(markerdata) {
    console.log('describe', markerdata);
    // show a popup describing the markerdata
    this.components.modal.show(markerdata);
  };

  this.end = function() {
    // release the container
    this.container.innerHTML = '';
  };

  // CLASSES

  this.components = {
    canvas: new this.Canvas(this, this.update.bind(this), this.describe.bind(this)),
    controls: new this.Controls(this),
    scale: new this.Scale(this),
    credits: new this.Credits(this),
    modal: new this.Modal(this)
  };

  // EVENTS

	this.start();

};

// return as a require.js module
if (typeof define != 'undefined') define([], function() { return Localmap });
if (typeof module != 'undefined') module.exports = Localmap;
