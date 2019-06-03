// extend the class
Localmap.prototype.Markers = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];

	// METHODS

	this.start = function() {
		// load the guide
		var guideXhr = new XMLHttpRequest();
		guideXhr.addEventListener('load', this.onGuideLoaded.bind(this));
		guideXhr.open('GET', this.config.guideUrl, true);
		guideXhr.send();
	};

	this.update = function() {
		console.log('markers.update');
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
	};

	this.redraw = function() {
		// resize the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale(' + scale + ')'
		}
	};

	this.addGuide = function() {
		var config = this.config;
		var guideData = this.config.guideData;
		// store the initial position
		config.position.lon = (config.maximum.lon - config.minimum.lon) / 2;
		config.position.lat = (config.maximum.lat - config.minimum.lat) / 2;
		// position every marker in the guide
		Object.keys(guideData.markers).map(this.addMarker.bind(this));
	};

	this.addMarker = function(key) {
		var markerData = this.config.guideData.markers[key];
		var min = this.config.minimum;
		var max = this.config.maximum;
		// don't add photo waypoints
		if (!markerData.photo) {
			markerData.element = new Image();
			markerData.element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
			markerData.element.setAttribute('alt', '');
			markerData.element.setAttribute('class', 'localmap-marker');
			markerData.element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
			markerData.element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
			markerData.element.style.cursor = (markerData.description) ? 'pointer' : null;
			markerData.element.addEventListener('click', this.onMarkerClicked.bind(this, markerData));
			this.parent.element.appendChild(markerData.element);
			this.elements.push(markerData.element);
		}
	}

	// EVENTS

	this.onMarkerClicked = function(markerData, evt) {
		console.log('marker clicked', markerData);
		// TODO: how to relay the marker click to the top level (popup) component
	};

	this.onGuideLoaded = function(evt) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		// decode the guide data
		this.config.guideData = JSON.parse(evt.target.response);
		// extract the interpolation limits
		var guideData = this.config.guideData;
		min.lon = guideData.bounds.west;
		min.lat = guideData.bounds.north;
		max.lon = guideData.bounds.east;
		max.lat = guideData.bounds.south;
		// add the markers from the guide
		this.addGuide();
	};

	this.start();

};
