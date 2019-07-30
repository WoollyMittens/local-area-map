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
    'key': null,
    'alias': null,
    'container': null,
    'canvasElement': null,
    'thumbsUrl': null,
    'photosUrl': null,
    'markersUrl': null,
    'guideUrl': null,
    'routeUrl': null,
    'mapUrl': null,
    'tilesUrl': null,
    'tilesZoom': 15,
    'exifUrl': null,
    'guideData': null,
    'routeData': null,
    'exifData': null,
    'creditsTemplate': null,
    'useTransitions': null,
		'minimum': {
			'lon': null,
			'lat': null,
			'lon_cover': null,
			'lat_cover': null,
			'zoom': null
		},
		'maximum': {
			'lon': null,
			'lat': null,
			'lon_cover': null,
			'lat_cover': null,
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
			'zoom': null,
      'referrer': null
    }
  };

  for (var key in config)
    this.config[key] = config[key];

  // METHODS

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
    this.config.position.lon = Math.max(Math.min(lon, this.config.maximum.lon_cover), this.config.minimum.lon_cover);
    this.config.position.lat = Math.min(Math.max(lat, this.config.maximum.lat_cover), this.config.minimum.lat_cover);
    this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
    this.update();
  };

  this.describe = function(markerdata) {
    // show a popup describing the markerdata
    this.components.modal.show(markerdata);
    // resolve any callback
    if (markerdata.callback) markerdata.callback(markerdata);
  };

  this.stop = function() {
    // remove each component
    for (var key in this.components)
      if (this.components[key].stop)
        this.components[key].stop(this.config);
  };

  this.indicate = function(input) {
    var canvas = this.components.canvas;
    var indicator = canvas.components.indicator;
    // reset the previous
    indicator.reset();
    // ask the indicator to indicate
    indicator.show(input);
    // cancel any associated events
    return false;
  };

  this.unindicate = function() {
    var canvas = this.components.canvas;
    var indicator = canvas.components.indicator;
    // reset the indicator
    indicator.hide();
    // cancel any associated events
    return false;
  };

  // EVENTS

  this.onComplete = function() {
    // remove the busy indicator
    this.config.container.className = this.config.container.className.replace(/ localmap-busy/g, '');
    // global update
    var max = this.config.maximum;
    var min = this.config.minimum;
    this.focus(
      (max.lon - min.lon) / 2 + min.lon,
      (max.lat - min.lat) / 2 + min.lat,
      1.1,
      false
    );
  };

  // CLASSES

  this.config.container.className += ' localmap-busy';

  this.components = {
    canvas: new this.Canvas(this, this.onComplete.bind(this), this.describe.bind(this), this.focus.bind(this)),
    controls: new this.Controls(this),
    scale: new this.Scale(this),
    credits: new this.Credits(this),
    modal: new this.Modal(this),
    legend: new this.Legend(this, this.indicate.bind(this))
  };

};

// return as a require.js module
if (typeof define != 'undefined') define([], function() { return Localmap });
if (typeof module != 'undefined') module.exports = Localmap;
