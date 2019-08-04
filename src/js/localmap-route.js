// extend the class
Localmap.prototype.Route = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;
	this.coordinates = [];
	this.zoom = null;
	this.delay = null;

	// METHODS

	this.start = function() {
		var key = this.config.key;
		// create a canvas
		this.element = document.createElement('canvas');
		this.element.setAttribute('class', 'localmap-route')
		this.parent.element.appendChild(this.element);
		// use the JSON immediately
		if (this.config.routeData && this.config.routeData[key]) {
			this.onJsonLoaded(this.config.routeData[key]);
		}
		// or load the route's GPX first
		else {
			var routeXhr = new XMLHttpRequest();
			routeXhr.addEventListener('load', this.onGpxLoaded.bind(this));
			routeXhr.open('GET', this.config.routeUrl.replace('{key}', key), true);
			routeXhr.send();
		}
	};

  this.stop = function() {
    // remove the element
    this.parent.element.removeChild(this.element);
  };

	this.update = function() {
		// defer redraw until idle
		if (this.config.position.zoom !== this.zoom) {
			clearTimeout(this.delay);
			this.delay = setTimeout(this.redraw.bind(this), 100);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		// adjust the height of the canvas
		this.element.width = this.parent.element.offsetWidth;
		this.element.height = this.parent.element.offsetHeight;
		// position every trackpoint in the route
		var ctx = this.element.getContext('2d');
		// (re)draw the route
		var x0, y0, x1, y1, z = this.config.position.zoom, w = this.element.width, h = this.element.height;
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 4 / z;
		ctx.strokeStyle = 'orange';
		ctx.beginPath();
		for (var key in this.coordinates) {
			if (this.coordinates.hasOwnProperty(key) && key % 1 == 0) {
        // calculate the current step
				x1 = parseInt((this.coordinates[key][0] - min.lon_cover) / (max.lon_cover - min.lon_cover) * w);
				y1 = parseInt((this.coordinates[key][1] - min.lat_cover) / (max.lat_cover - min.lat_cover) * h);
        // if the step seems valid, draw the step
  			if ((Math.abs(x1 - x0) + Math.abs(y1 - y0)) < 30) { ctx.lineTo(x1, y1); }
        // or jump unlikely/erroneous steps
        else { ctx.moveTo(x1, y1); }
        // store current step as the previous step
        x0 = x1;
        y0 = y1;
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
    // redraw
    this.redraw();
		// resolve completion
		onComplete();
	};

	this.onGpxLoaded = function(evt) {
		// convert GPX into an array of coordinates
		var gpx = evt.target.responseXML;
		var trackpoints = gpx.querySelectorAll('trkpt,rtept');
		for (var key in trackpoints) {
			if (trackpoints.hasOwnProperty(key) && key % 1 == 0) {
				this.coordinates.push([parseFloat(trackpoints[key].getAttribute('lon')), parseFloat(trackpoints[key].getAttribute('lat')), null]);
			}
		}
    // redraw
    this.redraw();
		// resolve completion
		onComplete();
	};

	this.start();

};
