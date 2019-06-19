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
    this.config.position.lon = Math.max(Math.min(lon, this.config.maximum.lon), this.config.minimum.lon);
    this.config.position.lat = Math.min(Math.max(lat, this.config.maximum.lat), this.config.minimum.lat);
    this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
    this.update();
  };

  this.describe = function(markerdata) {
    // show a popup describing the markerdata
    this.components.modal.show(markerdata);
  };

  this.stop = function() {
    // release the container
    this.container.innerHTML = '';
  };

  this.indicate = function(input) {
    // reset the previous
    this.unindicate();
    // handle the event if this was used as one
    if (input.target) input = input.target;
    // gather the parameters from diverse input
    if (!input.getAttribute) input.getAttribute = function(attr) { return input[attr]; };
    if (!input.setAttribute) input.setAttribute = function(attr, value) { input[attr] = value; };
    var source = input.getAttribute('data-url') || input.getAttribute('src') || input.getAttribute('href') || input.getAttribute('photo');
    var description = input.getAttribute('data-title') || input.getAttribute('title') || input.getAttribute('description');
    var lon = input.getAttribute('data-lon') || input.getAttribute('lon');
    var lat = input.getAttribute('data-lat') || input.getAttribute('lat');
    // try to get the coordinates from the cached exif data
    var filename = (source) ? source.split('/').pop() : null;
    var cached = this.config.exifData[filename];
    // populate the indicator's model
    this.config.indicator = {
      'photo': filename,
      'description': description,
      'lon': lon || cached.lon,
      'lat': lat || cached.lat,
      'referrer': input.referrer || input
    };
    // if the coordinates are known
    if (this.config.indicator.lon && this.config.indicator.lat) {
      // display the indicator immediately
      this.onIndicateSuccess();
    } else {
      // try to retrieve them from the photo
      var guideXhr = new XMLHttpRequest();
      guideXhr.addEventListener('load', this.onExifLoaded.bind(this));
      guideXhr.open('GET', this.config.exifUrl.replace('{src}', source), true);
      guideXhr.send();
    }
    // cancel any associated events
    return false;
  };

  this.unindicate = function() {
    // de-activate the originating element
    if (this.config.indicator.referrer) this.config.indicator.referrer.setAttribute('data-localmap', 'passive');
    // clear the indicator
    this.config.indicator = { 'icon': null, 'photo': null, 'description': null, 'lon': null, 'lat': null, 'zoom': null, 'origin': null };
    // de-empasise the focussed location
    this.focus(this.config.position.lon, this.config.position.lat, this.config.position.zoom * 0.25, true);
    // redraw
    this.update();
    // cancel any associated events
    return false;
  };

  // EVENTS

  this.onExifLoaded = function(result) {
    var exif = JSON.parse(result.target.response);
    var deg, min, sec, ref, coords = {};
    // if the exif data contains GPS information
    if (exif && exif.GPS) {
      // convert the lon into a usable format
      deg = parseInt(exif.GPS.GPSLongitude[0]);
      min = parseInt(exif.GPS.GPSLongitude[1]);
      sec = parseInt(exif.GPS.GPSLongitude[2]) / 100;
      ref = exif.GPS.GPSLongitudeRef;
      this.config.indicator.lon = (deg + min / 60 + sec / 3600) * (ref === "W" ? -1 : 1);
      // convert the lat into a usable format
      deg = parseInt(exif.GPS.GPSLatitude[0]);
      min = parseInt(exif.GPS.GPSLatitude[1]);
      sec = parseInt(exif.GPS.GPSLatitude[2]) / 100;
      ref = exif.GPS.GPSLatitudeRef;
      this.config.indicator.lat = (deg + min / 60 + sec / 3600) * (ref === "N" ? 1 : -1);
      // return the result
      this.onIndicateSuccess();
    }
  };

  this.onIndicateSuccess = function() {
    // activate the originating element
    this.config.indicator.referrer.setAttribute('data-localmap', 'active');
    // highlight a location with an optional description on the map
    this.focus(this.config.indicator.lon, this.config.indicator.lat, this.config.maximum.zoom, true);
    // redraw
    this.update();
  };

  // CLASSES

  this.components = {
    canvas: new this.Canvas(this, this.update.bind(this), this.describe.bind(this)),
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
