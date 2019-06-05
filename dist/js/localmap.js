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
      _this.focus(151.720030345, -32.9337152839, 1);
		}, 2000);
    setTimeout(function() {
      _this.focus(151.718354, -33.01304, 1.5);
		}, 4000);
    setTimeout(function() {
      _this.focus(151.708188, -32.978277000000006, 2);
		}, 6000);
	};

  this.update = function() {
		console.log('parent.update');
    // update all components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
  };

  this.focus = function(lon, lat, zoom) {
    console.log('focus on:', lon, lat, zoom);
    this.config.position.lon = lon;
    this.config.position.lat = lat;
    this.config.position.zoom = zoom;
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

// extend the class
Localmap.prototype.Background = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();
	this.onComplete = onComplete;

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

	this.redraw = function() {
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
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.start();

};

// extend the class
Localmap.prototype.Canvas = function (parent, onBackgroundComplete, onMarkerClicked) {

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
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
		// update all sub-components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
	};

	this.redraw = function() {
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
	};

	// CLASSES

  this.components = {
		background: new parent.Background(this, onBackgroundComplete),
		markers: new parent.Markers(this, onMarkerClicked),
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
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
	};

	this.redraw = function() {
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
Localmap.prototype.Markers = function (parent, onMarkerClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.onMarkerClicked = onMarkerClicked;

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
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
	};

	this.redraw = function() {
		// resize the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale(' + scale + ')'
		}
	};

	this.addGuide = function() {
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
		// add either a landmark or a waypoint to the map
		markerData.element = (markerData.photo) ? this.addLandmark(markerData) : this.addWaypoint(markerData);
		markerData.element.addEventListener('click', this.onMarkerClicked.bind(this, markerData));
		this.parent.element.appendChild(markerData.element);
		this.elements.push(markerData.element);
	}

	this.addLandmark = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = document.createElement('span');
		element.setAttribute('class', 'localmap-waypoint');
		element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		element.style.cursor = 'pointer';
		return element;
	};

	this.addWaypoint = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = new Image();
		element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		element.setAttribute('alt', '');
		element.setAttribute('class', 'localmap-marker');
		element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		element.style.cursor = (markerData.description) ? 'pointer' : null;
		return element;
	};

	// EVENTS

	this.onGuideLoaded = function(evt) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		// decode the guide data
		this.config.guideData = JSON.parse(evt.target.response);
		// extract the interpolation limits
		var guideData = this.config.guideData;
		min.lon = guideData.bounds.west;
		min.lat = guideData.bounds.north;
		max.lon = guideData.bounds.east;
		max.lat = guideData.bounds.south;
		// add the markers from the guide
		this.addGuide();
	};

	this.start();

};

// extend the class
Localmap.prototype.Modal = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		// create the modal
		this.element = document.createElement('section');
		this.element.setAttribute('class', 'localmap-modal localmap-modal-hidden');
		// add the content area
		this.photo = document.createElement('figure');
		this.photo.setAttribute('class', 'localmap-modal-photo');
		this.element.appendChild(this.photo);
		// add the content area
		this.description = document.createElement('article');
		this.description.setAttribute('class', 'localmap-modal-content');
		this.element.appendChild(this.description);
		// add a close button
		this.closer = document.createElement('button');
		this.closer.setAttribute('class', 'localmap-modal-closer');
		this.closer.innerHTML = 'Close';
		this.closer.addEventListener('click', this.onDismiss.bind(this));
		this.element.appendChild(this.closer);
		// insert the modal
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		console.log('modal.update');
	};

	this.show = function(markerData) {
		// display the photo if available
		if (markerData.photo) {
			this.photo.style.display = null;
			this.photo.style.backgroundImage = 'url(' + this.config.assetsUrl + 'medium/' + this.config.guideData.gps + '/' + markerData.photo + ')';
		} else {
			this.photo.style.display = 'none';
		}
		// display the content if available
		if (markerData.description) {
			this.description.innerHTML = '<p>' + markerData.description + '</p>';
		} else {
			return false;
		}
		// show the modal
		this.element.className = this.element.className.replace(/-hidden/g, '-visible');
	};

	// EVENTS

	this.onDismiss = function(evt) {
		evt.preventDefault();
		// hide the modal
		this.element.className = this.element.className.replace(/-visible/g, '-hidden');
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
		// create a canvas
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('class', 'localmap-route')
		this.parent.element.appendChild(this.canvas);
	};

	this.update = function() {
		console.log('route.update');
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
	};

	this.redraw = function() {
		// adjust the height of the canvas
		this.canvas.width = this.parent.element.offsetWidth;
		this.canvas.height = this.parent.element.offsetHeight;
		// position every trackpoint in the route
		var routeData = this.config.routeData;
		var trackpoints = routeData.getElementsByTagName('trkpt');
		var ctx = this.canvas.getContext('2d');
		// (re)draw the route
		var x, y, z = this.config.position.zoom, w = this.canvas.width, h = this.canvas.height;
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 4 / z;
		ctx.strokeStyle = 'orange';
		ctx.beginPath();
		for (var key in trackpoints) {
			if (!isNaN(key) && key % 1 == 0) {
				if (x = null) ctx.moveTo(x, y);
				x = parseInt((parseFloat(trackpoints[key].getAttribute('lon')) - this.config.minimum.lon) / (this.config.maximum.lon - this.config.minimum.lon) * w);
				y = parseInt((parseFloat(trackpoints[key].getAttribute('lat')) - this.config.minimum.lat) / (this.config.maximum.lat - this.config.minimum.lat) * h);
				ctx.lineTo(x, y);
			}
		}
		ctx.stroke();
	}

	// EVENTS

	this.onRouteLoaded = function(evt) {
		// decode the xml data
		this.config.routeData = evt.target.responseXML;
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
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
	};

	this.redraw = function() {
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
