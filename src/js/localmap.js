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
    'markersUrl': null,
    'guideUrl': null,
    'guideData': null,
    'routeUrl': null,
    'routeData': null,
    'mapUrl': null,
    'creditsTemplate': null,
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
		setTimeout(function() {
			_this.config.position.lat = -33.830224;
			_this.config.position.lon = 151.220423;
			_this.config.position.zoom = 1;
			_this.update();
		}, 2000);
    setTimeout(function() {
			_this.config.position.lat = -33.847691;
			_this.config.position.lon = 151.231060;
			_this.config.position.zoom = 2;
			_this.update();
		}, 4000);
	};

  this.update = function() {
		console.log('parent.update');
    // update all components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
  };

  this.end = function() {
    // release the container
    this.element.innerHTML = '';
  };

  // CLASSES

  this.components = {
    canvas: new this.Canvas(this, this.update.bind(this)),
    controls: new this.Controls(this),
    scale: new this.Scale(this),
    credits: new this.Credits(this)
  };

  // EVENTS

	this.start();

};

// return as a require.js module
if (typeof define != 'undefined') define([], function() { return Localmap });
if (typeof module != 'undefined') module.exports = Localmap;
