// extend the class
Localmap.prototype.Indicator = function (parent, onMarkerClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();
	this.onMarkerClicked = onMarkerClicked;
	this.zoom = null;
	this.lon = null;
	this.lat = null;

	// METHODS

	this.start = function() {
		// create the indicator
		this.element.setAttribute('src', this.config.markersUrl.replace('{type}', 'indicator'));
		this.element.setAttribute('alt', '');
		this.element.setAttribute('class', 'localmap-indicator');
		// get marker data from API call
		this.element.addEventListener('mouseup', this.onIndicatorClicked.bind(this));
		this.element.addEventListener('touchend', this.onIndicatorClicked.bind(this));
		this.parent.element.appendChild(this.element);
	};

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// only reposition if the content has changed
		if (this.lon !== this.config.indicator.lon  && this.lat !== this.config.indicator.lat) this.reposition();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.resize = function() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale(' + scale + ')';
	};

	this.reposition = function() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = this.config.indicator.lon;
		var lat = this.config.indicator.lat;
		// if the location is within bounds
		if (lon > min.lon && lon < max.lon && lat < min.lat && lat > max.lat) {
			// store the new position
			this.lon = lon;
			this.lat = lat;
			// display the marker
			this.element.style.cursor = (this.config.indicator.description) ? 'pointer' : 'default';
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon) / (max.lon - min.lon) * 100) + '%';
			this.element.style.top = ((lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		// otherwise
		} else {
			// hide the marker
			this.lon = null;
			this.lat = null;
			this.element.style.display = 'none';
		}
	};

	// EVENTS

	this.onIndicatorClicked = function(evt) {
		evt.preventDefault();
		// report that the indicator was clicked
		this.onMarkerClicked(this.config.indicator);
	};

	this.start();

};
