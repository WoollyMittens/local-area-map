// extend the class
Localmap.prototype.Background = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;
	this.image = null;
	this.onComplete = onComplete;

	// METHODS

	this.start = function() {
		var key = this.config.alias || this.config.key;
		// create the canvas
		this.element = document.createElement('canvas');
		this.element.setAttribute('class', 'localmap-background');
		this.parent.element.appendChild(this.element);
		// load the map
		this.image = new Image();
		this.image.addEventListener('load', this.onBackgroundLoaded.bind(this));
		this.image.setAttribute('src', this.config.mapUrl.replace('{key}', key));
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
		var image = this.image;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// use the bounds of subsets of walks
		var pixelsPerLon = image.naturalWidth / (max.lon - min.lon);
		var pixelsPerLat = image.naturalHeight / (max.lat - min.lat);
		var offsetWidth = (min.lon - min.lon_cover) * pixelsPerLon;
		var offsetHeight = (min.lat - min.lat_cover) * pixelsPerLat;
		var croppedWidth = (max.lon_cover - min.lon_cover) * pixelsPerLon;
		var croppedHeight = (max.lat_cover - min.lat_cover) * pixelsPerLat;
		var displayWidth = croppedWidth / 2;
		var displayHeight = croppedHeight / 2;
		// set the size of the canvas to the bitmap
		element.width = croppedWidth;
		element.height = croppedHeight;
		// double up the bitmap to retina size
		element.style.width = displayWidth + 'px';
		element.style.height = displayHeight + 'px';
		// calculate the limits
		min.zoom = Math.max(container.offsetWidth / displayWidth, container.offsetHeight / displayHeight);
		max.zoom = 2;
		// paste the image into the canvas
		element.getContext('2d').drawImage(image, offsetWidth, offsetHeight);
	};

	// EVENTS

	this.onBackgroundLoaded = function(evt) {
		// position the background
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.start();

};
