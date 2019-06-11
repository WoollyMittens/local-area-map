// extend the class
Localmap.prototype.Route = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.zoom = null;

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
		// only redraw if the zoom has changed
		if (this.zoom !== this.config.position.zoom) {
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
				if (trackpoints.hasOwnProperty(key) && key % 1 == 0) {
					if (x = null) ctx.moveTo(x, y);
					x = parseInt((parseFloat(trackpoints[key].getAttribute('lon')) - this.config.minimum.lon) / (this.config.maximum.lon - this.config.minimum.lon) * w);
					y = parseInt((parseFloat(trackpoints[key].getAttribute('lat')) - this.config.minimum.lat) / (this.config.maximum.lat - this.config.minimum.lat) * h);
					ctx.lineTo(x, y);
				}
			}
			ctx.stroke();
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	// EVENTS

	this.onRouteLoaded = function(evt) {
		// decode the xml data
		this.config.routeData = evt.target.responseXML;
	};

	this.start();

};
