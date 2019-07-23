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
		// catch window resizes
		window.addEventListener('resize', this.redraw.bind(this));
	};

  this.stop = function() {
    // remove the element
    this.parent.element.removeChild(this.element);
  };

	this.update = function() {};

	this.redraw = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		var displayWidth = this.element.naturalWidth / 2;
		var displayHeight = this.element.naturalHeight / 2;
		// calculate the limits
		min.zoom = Math.max(container.offsetWidth / displayWidth, container.offsetHeight / displayHeight);
		max.zoom = 2;
		// calculate the center
		var centerX = (container.offsetWidth - displayWidth * min.zoom) / 2;
		var centerY = (container.offsetHeight - displayHeight * min.zoom) / 2;
		// store the initial position
    this.config.position.lon = (min.lon_cover + max.lon_cover) / 2;
		this.config.position.lat = (min.lat_cover + max.lat_cover) / 2;
		this.config.position.zoom = min.zoom * 1.1;
		// position the canvas
		this.parent.element.style.transform = 'translate(' + centerX + 'px, ' + centerY + 'px) scale(' + min.zoom + ')';
		// insert the image into the canvas
		this.parent.element.appendChild(this.element);
	};

	// EVENTS

	this.onBackgroundLoaded = function(evt) {
		// double up the bitmap to retina size
		this.element.style.width = (this.element.naturalWidth / 2) + 'px';
		this.element.style.height = (this.element.naturalHeight / 2) + 'px';
		// center the background
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.start();

};
