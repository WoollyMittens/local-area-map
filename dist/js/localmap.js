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

// extend the class
Localmap.prototype.Background = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();

	// METHODS

	this.start = function() {
		// load the map
		this.element.addEventListener('load', this.onBackgroundLoaded.bind(this));
		this.element.setAttribute('class', 'localmap-background');
		this.element.setAttribute('src', this.config.mapUrl);
	};

	this.update = function() {
		console.log('background.update');
	};

	this.drawBackground = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		// calculate the center
		var centerX = (container.offsetWidth - element.naturalWidth * min.zoom) / 2;
		var centerY = (container.offsetHeight - element.naturalHeight * min.zoom) / 2;
		// store the initial zoom
		this.config.position.zoom = this.config.minimum.zoom;
		// position the canvas
		this.parent.element.style.transform = 'translate(' + centerX + 'px, ' + centerY + 'px) scale(' + min.zoom + ')';
		// insert the image into the canvas
		this.parent.element.appendChild(this.element);
		// update everything
		onComplete();
	};

	// EVENTS

	this.onBackgroundLoaded = function(evt) {
		var container = this.config.container;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// extract the interpolation limits
		min.zoom = Math.max(container.offsetWidth / this.element.naturalWidth, container.offsetHeight / this.element.naturalHeight);
		max.zoom = 2;
		// center the background
		this.drawBackground();
	};

	this.start();

};

// extend the class
Localmap.prototype.Canvas = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = document.createElement('div');
	this.config.canvasElement = this.element;

	// METHODS

	this.start = function() {
		// create a canvas
		this.element.setAttribute('class', 'localmap-canvas');
		this.element.addEventListener('transitionend', this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		console.log('canvas.update');
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// convert the lon,lat to x,y
		var centerX = (pos.lon - min.lon) / (max.lon - min.lon) * element.offsetWidth;
		var centerY = (pos.lat - min.lat) / (max.lat - min.lat) * element.offsetHeight;
		// limit the zoom
		var zoom = Math.max(Math.min(pos.zoom, max.zoom), min.zoom);
		// convert the center into an offset
		var offsetX = -centerX * zoom + container.offsetWidth / 2;
		var offsetY = -centerY * zoom + container.offsetHeight / 2;
		// apply the limits
		offsetX = Math.max(Math.min(offsetX, 0), container.offsetWidth - element.offsetWidth * zoom * 0.99);
		offsetY = Math.max(Math.min(offsetY, 0), container.offsetHeight - element.offsetHeight * zoom * 0.99);
		// position the background
		element.style.transition = 'transform ease 300ms';
		element.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + zoom + ')';
		// update all sub-components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
	};

	// CLASSES

  this.components = {
		background: new parent.Background(this, onComplete),
		markers: new parent.Markers(this),
		route: new parent.Route(this),
		location: new parent.Location(this)
  };

	// EVENTS

	this.onUpdated = function (evt) {
		// remove the transition
		this.element.style.transition = null;
	};

	this.start();

};

// extend the class
Localmap.prototype.Controls = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		this.element = document.createElement('nav');
		this.element.setAttribute('class', 'localmap-controls');
		this.config.container.appendChild(this.element);
	};

	// TODO: buttons to incrementally zoom in, zoom out, move north, move south, move east, move west.
	// TODO: touch controls for pinch-to-zoom and swipe-to-move.

	this.update = function() {
		console.log('controls.update');
	};

	// EVENTS

	this.start();

};

// extend the class
Localmap.prototype.Credits = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		this.element = document.createElement('figcaption');
		this.element.setAttribute('class', 'localmap-credits');
		this.element.innerHTML = this.config.creditsTemplate;
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		console.log('credits.update');
	};

	// EVENTS

	this.start();

};

// extend the class
Localmap.prototype.Location = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();

	// METHODS

	this.start = function() {
		if ("geolocation" in navigator) {
			// request location updates
			this.locator = navigator.geolocation.watchPosition(this.onReposition.bind(this));
			// create the indicator
			this.element.setAttribute('src', this.config.markersUrl.replace('{type}', 'location'));
			this.element.setAttribute('alt', '');
			this.element.setAttribute('class', 'localmap-location');
			this.parent.element.appendChild(this.element);
		}
	};

	this.update = function() {
		console.log('location.update');
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale(' + scale + ')';
	};

	// EVENTS

	this.onReposition = function(position) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = position.coords.longitude;
		var lat = position.coords.latitude;
		// if the location is within bounds
		if (lon > min.lon && lon < max.lon && lat < min.lat && lat > max.lat) {
			// display the marker
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon) / (max.lon - min.lon) * 100) + '%';
			this.element.style.top = ((lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		// otherwise
		} else {
			// hide the marker
			this.element.style.display = 'none';
		}
	};

	this.start();

};

// extend the class
Localmap.prototype.Markers = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];

	// METHODS

	this.start = function() {
		// load the guide
		var guideXhr = new XMLHttpRequest();
		guideXhr.addEventListener('load', this.onGuideLoaded.bind(this));
		guideXhr.open('GET', this.config.guideUrl, true);
		guideXhr.send();
	};

	this.update = function() {
		console.log('markers.update');
		// resize the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale(' + scale + ')'
		}
	};

	this.drawGuide = function() {
		var config = this.config;
		var guideData = this.config.guideData;
		// store the initial position
		config.position.lon = (config.maximum.lon - config.minimum.lon) / 2;
		config.position.lat = (config.maximum.lat - config.minimum.lat) / 2;
		// position every marker in the guide
		Object.keys(guideData.markers).map(this.addMarker.bind(this));
	};

	this.addMarker = function(key) {
		var markerData = this.config.guideData.markers[key];
		var markerElement = new Image();
		var min = this.config.minimum;
		var max = this.config.maximum;
		markerElement.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		markerElement.setAttribute('title', markerData.description || '');
		markerElement.setAttribute('class', 'localmap-marker');
		markerElement.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		markerElement.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		this.parent.element.appendChild(markerElement);
		this.elements.push(markerElement);
	}

	// EVENTS

	this.onGuideLoaded = function(evt) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		// decode the guide data
		this.config.guideData = JSON.parse(evt.target.response);
		// extract the interpolation limits
		var guideData = this.config.guideData;
		min.lon = guideData.bounds._southWest.lng;
		min.lat = guideData.bounds._northEast.lat;
		max.lon = guideData.bounds._northEast.lng;
		max.lat = guideData.bounds._southWest.lat;
		// add the markers from the guide
		this.drawGuide();
	};

	this.start();

};

// extend the class
Localmap.prototype.Route = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];

	// METHODS

	this.start = function() {
		// load the route
		var routeXhr = new XMLHttpRequest();
		routeXhr.addEventListener('load', this.onRouteLoaded.bind(this));
		routeXhr.open('GET', this.config.routeUrl, true);
		routeXhr.send();
	};

	this.update = function() {
		console.log('route.update');
	};

	this.drawRoute = function() {
		// position every trackpoint in the route
		var routeData = this.config.routeData;
		var trackpoints = routeData.getElementsByTagName('trkpt');
		var trackpoint;
		for (var key in trackpoints) {
			if (!isNaN(key)) {
				trackpoint = document.createElement('span');
				trackpoint.setAttribute('class', 'localmap-trackpoint');
				trackpoint.style.left = (parseFloat(trackpoints[key].getAttribute('lon')) - this.config.minimum.lon) / (this.config.maximum.lon - this.config.minimum.lon) * 100 + '%';
				trackpoint.style.top = (parseFloat(trackpoints[key].getAttribute('lat')) - this.config.minimum.lat) / (this.config.maximum.lat - this.config.minimum.lat) * 100 + '%';
				this.parent.element.appendChild(trackpoint);
				this.elements.push(trackpoint);
			}
		}
	};

	// EVENTS

	this.onRouteLoaded = function(evt) {
		// decode the xml data
		this.config.routeData = evt.target.responseXML;
		// add the trackpoints from the route
		this.drawRoute();
	};

	this.start();

};

// extend the class
Localmap.prototype.Scale = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = document.createElement('div');

	// METHODS

	this.start = function() {
		// add the scale to the interface
		this.element.setAttribute('class', 'localmap-scale');
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		console.log('scale.update');
		// how big is the map in kilometres along the bottom
		var mapSize = this.distance(
			{'lon': this.config.minimum.lon, 'lat': this.config.maximum.lat},
			{'lon': this.config.maximum.lon, 'lat': this.config.maximum.lat}
		);
		// what portion of that is in the container
		var visible = this.config.container.offsetWidth / this.config.canvasElement.offsetWidth / this.config.position.zoom;
		// use a fraction of that as the scale
		var scaleSize = visible * mapSize / 6;
		// round to the nearest increment
		var scale = 50, label = '50km';
		if (scaleSize < 10) { scale = 10; label = '10km' }
		if (scaleSize < 5) { scale = 5; label = '5km' }
		if (scaleSize < 2) { scale = 2; label = '2km' }
		if (scaleSize < 1) { scale = 1; label = '1km' }
		if (scaleSize < 0.5) { scale = 0.5; label = '500m' }
		if (scaleSize < 0.2) { scale = 0.2; label = '200m' }
		if (scaleSize < 0.1) { scale = 0.1; label = '100m' }
		// size the scale to the increment
		this.element.style.width = (scale / visible / mapSize * 100) + '%';
		// fill the scale with the increment
		this.element.innerHTML = label;
	};

	this.distance = function(A, B) {
		var lonA = Math.PI * A.lon / 180;
		var lonB = Math.PI * B.lon / 180;
		var latA = Math.PI * A.lat / 180;
		var latB = Math.PI * B.lat / 180;
		var x = (lonA - lonB) * Math.cos((latA + latB)/2);
		var y = latA - latB;
		var d = Math.sqrt(x*x + y*y) * 6371;
		return d;
	};

	// EVENTS

	this.start();

};
