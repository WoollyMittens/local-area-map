// extend the class
Localmap.prototype.Markers = function (parent, onMarkerClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.onMarkerClicked = onMarkerClicked;
	this.zoom = null;

	// METHODS

	this.start = function() {
		// load the guide
		var guideXhr = new XMLHttpRequest();
		guideXhr.addEventListener('load', this.onGuideLoaded.bind(this));
		guideXhr.open('GET', this.config.guideUrl, true);
		guideXhr.send();
	};

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.resize = function() {
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
		guideData.markers.map(this.addMarker.bind(this));
	};

	this.addMarker = function(markerData) {
		// add either a landmark or a waypoint to the map
		markerData.element = (markerData.photo) ? this.addLandmark(markerData) : this.addWaypoint(markerData);
		markerData.element.addEventListener('click', this.onMarkerClicked.bind(this, markerData));
		this.parent.element.appendChild(markerData.element);
		this.elements.push(markerData.element);
	}

	this.addLandmark = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = document.createElement('span');
		element.setAttribute('class', 'localmap-waypoint');
		element.addEventListener('click', this.onMarkerClicked.bind(this, markerData));
		element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		element.style.cursor = 'pointer';

		return element;
	};

	this.addWaypoint = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = new Image();
		element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		element.setAttribute('alt', '');
		element.setAttribute('class', 'localmap-marker');
		element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		element.style.cursor = (markerData.description) ? 'pointer' : null;
		return element;
	};

	// EVENTS

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
