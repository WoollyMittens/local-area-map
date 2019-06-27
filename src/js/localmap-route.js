// extend the class
Localmap.prototype.Route = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.coordinates = [];
	this.zoom = null;

	// METHODS

	this.start = function() {
		// use the JSON immediately
		if (this.config.routeData) {
			this.onJsonLoaded(this.config.routeData);
		// or load the route's GPX first
		} else {
			var routeXhr = new XMLHttpRequest();
			routeXhr.addEventListener('load', this.onGpxLoaded.bind(this));
			routeXhr.open('GET', this.config.routeUrl, true);
			routeXhr.send();
		}
		// create a canvas
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('class', 'localmap-route')
		this.parent.element.appendChild(this.canvas);
	};

	this.update = function() {
		// only redraw if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.redraw();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
// TODO: allow drawing of an array of routes
		// adjust the height of the canvas
		this.canvas.width = this.parent.element.offsetWidth;
		this.canvas.height = this.parent.element.offsetHeight;
		// position every trackpoint in the route
		var ctx = this.canvas.getContext('2d');
		// (re)draw the route
		var x, y, z = this.config.position.zoom, w = this.canvas.width, h = this.canvas.height;
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 4 / z;
		ctx.strokeStyle = 'orange';
		ctx.beginPath();
		for (var key in this.coordinates) {
			if (this.coordinates.hasOwnProperty(key) && key % 1 == 0) {
				if (x = null) ctx.moveTo(x, y);
				x = parseInt((this.coordinates[key][0] - this.config.minimum.lon) / (this.config.maximum.lon - this.config.minimum.lon) * w);
				y = parseInt((this.coordinates[key][1] - this.config.minimum.lat) / (this.config.maximum.lat - this.config.minimum.lat) * h);
				ctx.lineTo(x, y);
			}
		}
		ctx.stroke();
	};

	// EVENTS

	this.onJsonLoaded = function (geojson) {
		// convert JSON into an array of coordinates
		var features = geojson.features, segments = [], coordinates;
		for (var a = 0, b = features.length; a < b; a += 1) {
			if (features[a].geometry.coordinates[0][0] instanceof Array) {
				coordinates = [].concat.apply([], features[a].geometry.coordinates);
			} else {
				coordinates = features[a].geometry.coordinates;
			}
			segments.push(coordinates);
		}
		this.coordinates = [].concat.apply([], segments);
	};

	this.onGpxLoaded = function(evt) {
		// convert GPX into an array of coordinates
		var gpx = evt.target.responseXML;
		var trackpoints = gpx.getElementsByTagName('trkpt');
		for (var key in trackpoints) {
			if (trackpoints.hasOwnProperty(key) && key % 1 == 0) {
				this.coordinates.push([parseFloat(trackpoints[key].getAttribute('lon')), parseFloat(trackpoints[key].getAttribute('lat')), null]);
			}
		}
	};

	this.start();

};
