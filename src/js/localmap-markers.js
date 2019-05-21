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
		// resize the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale(' + scale + ')'
		}
	};

	this.drawGuide = function() {
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
		var markerElement = new Image();
		var min = this.config.minimum;
		var max = this.config.maximum;
		markerElement.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		markerElement.setAttribute('title', markerData.description || '');
		markerElement.setAttribute('class', 'localmap-marker');
		markerElement.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		markerElement.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		this.parent.element.appendChild(markerElement);
		this.elements.push(markerElement);
	}

	// EVENTS

	this.onGuideLoaded = function(evt) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		// decode the guide data
		this.config.guideData = JSON.parse(evt.target.response);
		// extract the interpolation limits
		var guideData = this.config.guideData;
		min.lon = guideData.bounds._southWest.lng;
		min.lat = guideData.bounds._northEast.lat;
		max.lon = guideData.bounds._northEast.lng;
		max.lat = guideData.bounds._southWest.lat;
		// add the markers from the guide
		this.drawGuide();
	};

	this.start();

};
