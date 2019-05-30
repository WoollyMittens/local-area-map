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
		this.redraw();
	};

	this.start();

};
