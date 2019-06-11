// extend the class
Localmap.prototype.Controls = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.touches = null;
	this.inertia = {x:0, y:0, z:0};

	// METHODS

	this.start = function() {
		this.element = document.createElement('nav');
		this.element.setAttribute('class', 'localmap-controls');
		this.config.container.appendChild(this.element);
	};

	// TODO: buttons to incrementally zoom in, zoom out, move north, move south, move east, move west.
	
	// TODO: mouse wheel to zoom

	this.update = function() {
		console.log('controls.update');
	};

	this.coasting = function() {
		console.log('coasting', this.inertia, this.config.position.lon);
		// move the map according to the inertia
		this.parent.focus(
			this.config.position.lon + (this.config.maximum.lon - this.config.minimum.lon) * -this.inertia.x,
			this.config.position.lat + (this.config.maximum.lat - this.config.minimum.lat) * -this.inertia.y,
			this.config.position.zoom + (this.config.maximum.zoom - this.config.minimum.zoom) * -this.inertia.z
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
		this.touches = evt.touches;
	};

	this.moveInteraction = function(evt) {
		evt.preventDefault();
		var width = this.config.canvasElement.offsetWidth * this.config.position.zoom;
		var height = this.config.canvasElement.offsetHeight * this.config.position.zoom;
		var prev = this.touches;
		var next = evt.touches;
		var nextX = (next.length > 1) ? (next[0].clientX + next[1].clientX) / 2 : next[0].clientX;
		var nextY = (next.length > 1) ? (next[0].clientY + next[1].clientY) / 2 : next[0].clientY;
		var prevX = (prev.length > 1) ? (prev[0].clientX + prev[1].clientX) / 2 : prev[0].clientX;
		var prevY = (prev.length > 1) ? (prev[0].clientY + prev[1].clientY) / 2 : prev[0].clientY;
		// update the inertia
		this.inertia.x = (nextX - prevX) / width;
		this.inertia.y = (nextY - prevY) / height;
		this.inertia.z = (next.length > 1 && prev.length > 1) ? ((next[0].clientX - next[1].clientX) - (prev[0].clientX - prev[1].clientX)) / width + ((next[0].clientY - next[1].clientY) - (prev[0].clientY - prev[1].clientY)) / height : 0;
		// start coasting on inertia
		this.coasting();
		// store the touches
		this.touches = evt.touches;
	};

	this.endInteraction = function(evt) {
		// clear the interaction
		this.touches = null;
		// coast on inertia
	};

	this.cancelInteraction = function(evt) {
	};

	// EVENTS

	this.config.container.addEventListener('touchstart', this.startInteraction.bind(this));
	this.config.container.addEventListener('touchmove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('touchend', this.endInteraction.bind(this));
	this.config.container.addEventListener('touchcancel', this.cancelInteraction.bind(this));

	this.start();

};
