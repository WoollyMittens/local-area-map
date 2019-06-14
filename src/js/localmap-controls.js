// extend the class
Localmap.prototype.Controls = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.touches = null;
	this.inertia = {x:0, y:0, z:0};
	this.elements = {};

	// METHODS

	this.start = function() {
		// add controls to the page
		this.element = document.createElement('nav');
		this.element.setAttribute('class', 'localmap-controls');
		this.config.container.appendChild(this.element);
		// add the zoom in button
		this.elements.zoomin = document.createElement('button');
		this.elements.zoomin.innerHTML = 'Zoom in';
		this.elements.zoomin.setAttribute('class', 'localmap-controls-zoomin');
		this.elements.zoomin.addEventListener('touchend', this.onZoomIn.bind(this));
		this.elements.zoomin.addEventListener('mouseup', this.onZoomIn.bind(this));
		this.element.appendChild(this.elements.zoomin);
		// add the zoom out button
		this.elements.zoomout = document.createElement('button');
		this.elements.zoomout.innerHTML = 'Zoom out';
		this.elements.zoomout.setAttribute('class', 'localmap-controls-zoomout');
		this.elements.zoomout.addEventListener('touchend', this.onZoomOut.bind(this));
		this.elements.zoomout.addEventListener('mouseup', this.onZoomOut.bind(this));
		this.element.appendChild(this.elements.zoomout);
	};

	// TODO: buttons to incrementally zoom in, zoom out, move north, move south, move east, move west.

	this.update = function() {};

	this.coasting = function() {
		// move the map according to the inertia
		this.parent.focus(
			this.config.position.lon + (this.config.maximum.lon - this.config.minimum.lon) * -this.inertia.x,
			this.config.position.lat + (this.config.maximum.lat - this.config.minimum.lat) * -this.inertia.y,
			this.config.position.zoom + (this.config.maximum.zoom - this.config.minimum.zoom) * this.inertia.z
		);
		// if the inertia is above a certain level
		if (Math.abs(this.inertia.x) > 0.0001 || Math.abs(this.inertia.y) > 0.0001 || Math.abs(this.inertia.z) > 0.0001) {
			// attenuate the inertia
			this.inertia.x *= 0.9;
			this.inertia.y *= 0.9;
			this.inertia.z *= 0.7;
			// continue monitoring
			window.cancelAnimationFrame(this.animationFrame);
			this.animationFrame = window.requestAnimationFrame(this.coasting.bind(this));
		}
	};

	this.startInteraction = function(evt) {
		evt.preventDefault();
		// reset inertial movement
		this.inertia.x = 0;
		this.inertia.y = 0;
		this.inertia.z = 0;
		// store the initial touch(es)
		this.touches = evt.touches || [{ 'clientX': evt.clientX, 'clientY': evt.clientY }];
	};

	this.moveInteraction = function(evt) {
		evt.preventDefault();
		// retrieve the current and previous touches
		var touches = evt.touches || [{ 'clientX': evt.clientX, 'clientY': evt.clientY }];
		var previous = this.touches;
		// if there is interaction
		if (previous) {
			// calculate the interaction points
			var width = this.config.canvasElement.offsetWidth * this.config.position.zoom;
			var height = this.config.canvasElement.offsetHeight * this.config.position.zoom;
			var nextX = (touches.length > 1) ? (touches[0].clientX + touches[1].clientX) / 2 : touches[0].clientX;
			var nextY = (touches.length > 1) ? (touches[0].clientY + touches[1].clientY) / 2 : touches[0].clientY;
			var prevX = (previous.length > 1) ? (previous[0].clientX + previous[1].clientX) / 2 : previous[0].clientX;
			var prevY = (previous.length > 1) ? (previous[0].clientY + previous[1].clientY) / 2 : previous[0].clientY;
			// update the inertia
			this.inertia.x = (nextX - prevX) / width;
			this.inertia.y = (nextY - prevY) / height;
			this.inertia.z = (touches.length > 1 && previous.length > 1) ? ((touches[0].clientX - touches[1].clientX) - (previous[0].clientX - previous[1].clientX)) / width + ((touches[0].clientY - touches[1].clientY) - (previous[0].clientY - previous[1].clientY)) / height : 0;
			// start coasting on inertia
			this.coasting();
			// store the touches
			this.touches = touches;
		}
	};

	this.endInteraction = function(evt) {
		// clear the interaction
		this.touches = null;
	};

	this.wheelInteraction = function(evt) {
		evt.preventDefault();
		// update the inertia
		this.inertia.z += evt.deltaY / 5000;
		// start coasting on inertia
		this.coasting();
	};

	this.cancelInteraction = function(evt) {};

	// EVENTS

	this.onZoomIn = function(evt) {
		this.parent.focus(
			this.config.position.lon,
			this.config.position.lat,
			this.config.position.zoom * 3/2,
			true
		);
	};

	this.onZoomOut = function(evt) {
		this.parent.focus(
			this.config.position.lon,
			this.config.position.lat,
			this.config.position.zoom * 2/3,
			true
		);
	};

	this.config.container.addEventListener('mousedown', this.startInteraction.bind(this));
	this.config.container.addEventListener('mousemove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('mouseup', this.endInteraction.bind(this));
	this.config.container.addEventListener('wheel', this.wheelInteraction.bind(this));

	this.config.container.addEventListener('touchstart', this.startInteraction.bind(this));
	this.config.container.addEventListener('touchmove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('touchend', this.endInteraction.bind(this));
	this.config.container.addEventListener('touchcancel', this.cancelInteraction.bind(this));

	this.start();

};
