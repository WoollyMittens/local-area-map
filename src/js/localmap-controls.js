// extend the class
Localmap.prototype.Controls = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.touches = null;
	this.inertia = {x:0, y:0, z:0};
	this.elements = {};
	this.range = {};
	this.steps = {x:0.03, y:0.03, z:0.05};
	this.zoom = null;
	this.last = null;

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
		this.elements.zoomin.addEventListener('click', this.buttonInteraction.bind(this, 1.5));
		this.element.appendChild(this.elements.zoomin);
		// add the zoom out button
		this.elements.zoomout = document.createElement('button');
		this.elements.zoomout.innerHTML = 'Zoom out';
		this.elements.zoomout.setAttribute('class', 'localmap-controls-zoomout');
		this.elements.zoomout.addEventListener('click', this.buttonInteraction.bind(this, 0.667));
		this.element.appendChild(this.elements.zoomout);
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.element);
  };

	this.update = function() {
		// only redraw if the zoom has changed
		if (this.zoom !== this.config.position.zoom) {
			// check if the buttons are at their limits
			this.elements.zoomin.disabled = (this.config.position.zoom === this.config.maximum.zoom);
			this.elements.zoomout.disabled = (this.config.position.zoom === this.config.minimum.zoom);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.reposition = function(hasInertia) {
		// cancel any pending timeout
		window.cancelAnimationFrame(this.animationFrame);
		// move the map according to the inertia
		this.parent.focus(
			this.config.position.lon + this.range.lon * -this.inertia.x,
			this.config.position.lat + this.range.lat * -this.inertia.y,
			this.config.position.zoom + this.range.zoom * this.inertia.z,
			false
		);
		// if the inertia is above a certain level
		if (hasInertia && (Math.abs(this.inertia.x) > 0.001 || Math.abs(this.inertia.y) > 0.001 || Math.abs(this.inertia.z) > 0.001)) {
			// attenuate the inertia
			this.inertia.x *= 0.9;
			this.inertia.y *= 0.9;
			this.inertia.z = 0;
			// continue monitoring
			this.animationFrame = window.requestAnimationFrame(this.reposition.bind(this, hasInertia));
		}
	};

	this.startInteraction = function(evt) {
		// reset inertial movement
		this.inertia.x = 0;
		this.inertia.y = 0;
		this.inertia.z = 0;
		// update the interpolation interval
		this.range.lon = this.config.maximum.lon - this.config.minimum.lon;
		this.range.lat = this.config.maximum.lat - this.config.minimum.lat;
		this.range.zoom = this.config.maximum.zoom - this.config.minimum.zoom;
		this.range.x = this.config.canvasElement.offsetWidth * this.config.position.zoom;
		this.range.y = this.config.canvasElement.offsetHeight * this.config.position.zoom;
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
			// cancel the double click
			this.last = new Date() - 500;
			// for multi touch
			if (touches.length > 1 && previous.length > 1) {
				var dX = (Math.abs(touches[0].clientX - touches[1].clientX) - Math.abs(previous[0].clientX - previous[1].clientX)) / this.range.x;
				var dY = (Math.abs(touches[0].clientY - touches[1].clientY) - Math.abs(previous[0].clientY - previous[1].clientY)) / this.range.y;
				this.inertia.x = ((touches[0].clientX - previous[0].clientX) + (touches[1].clientX - previous[1].clientX)) / 2 / this.range.x;
				this.inertia.y = ((touches[0].clientY - previous[0].clientY) + (touches[1].clientY - previous[1].clientY)) / 2 / this.range.y;
				this.inertia.z = ((dX + dY) > 0) ? this.steps.z : ((dX + dY) < 0) ? -this.steps.z : 0;
			} else {
				this.inertia.x = (touches[0].clientX - previous[0].clientX) / this.range.x;
				this.inertia.y = (touches[0].clientY - previous[0].clientY) / this.range.y;
				this.inertia.z = 0;
			}
			// limit the innertia
			this.inertia.x = Math.max(Math.min(this.inertia.x, this.steps.x), -this.steps.x);
			this.inertia.y = Math.max(Math.min(this.inertia.y, this.steps.y), -this.steps.y);
			this.inertia.z *= this.config.position.zoom;
			// movement without inertia
			this.reposition(false);
			// store the touches
			this.touches = touches;
		}
	};

	this.endInteraction = function(evt) {
		// clear the interaction
		this.touches = null;
		// movement with inertia
		this.reposition(true);
	};

	this.buttonInteraction = function(factor, evt) {
		// cancel the double click
		this.last = new Date() - 500;
		// perform the zoom
		this.parent.focus(
			this.config.position.lon,
			this.config.position.lat,
			this.config.position.zoom * factor,
			true
		);
	};

	this.wheelInteraction = function(evt) {
		evt.preventDefault();
		// update the range
		this.range.lon = this.config.maximum.lon - this.config.minimum.lon;
		this.range.lat = this.config.maximum.lat - this.config.minimum.lat;
		this.range.zoom = this.config.maximum.zoom - this.config.minimum.zoom;
		// update the inertia
		this.inertia.z += (evt.deltaY > 0) ? this.steps.z : -this.steps.z;
		// movement with inertia
		this.reposition(true);
	};

	this.dblclickInteraction = function(evt) {
		// if the previous tap was short enough ago
		if (new Date() - this.last < 250) {
			// zoom in on the map
			this.parent.focus(
				this.config.position.lon,
				this.config.position.lat,
				this.config.position.zoom * 1.5,
				true
			);
		}
		// update the time since the last click
		this.last = new Date();
	};

	this.cancelInteraction = function(evt) {};

	// EVENTS

	this.config.container.addEventListener('mousedown', this.startInteraction.bind(this));
	this.config.container.addEventListener('mousemove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('mouseup', this.endInteraction.bind(this));
	this.config.container.addEventListener('wheel', this.wheelInteraction.bind(this));
	this.config.container.addEventListener('click', this.dblclickInteraction.bind(this));

	this.config.container.addEventListener('touchstart', this.startInteraction.bind(this));
	this.config.container.addEventListener('touchmove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('touchend', this.endInteraction.bind(this));
	this.config.container.addEventListener('touchcancel', this.cancelInteraction.bind(this));

	this.start();

};
