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
