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
		console.log('parent.update');
    // update all components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
  };

  this.focus = function(lon, lat, zoom, smoothly) {
    console.log('focus on:', lon, lat, zoom);
    // try to keep the focus within bounds
    this.config.useTransitions = smoothly;
    this.config.position.lon = Math.max(Math.min(lon, this.config.maximum.lon), this.config.minimum.lon);
    this.config.position.lat = Math.min(Math.max(lat, this.config.maximum.lat), this.config.minimum.lat);
    this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
    this.update();
  };

  this.describe = function(markerdata) {
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
