// extend the class
Localmap.prototype.Markers = function (parent, onClicked, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.zoom = null;
	this.delay = null;

	// METHODS

	this.start = function() {
		var key = this.config.key;
		// if cached data is available
		if (this.config.guideData && this.config.guideData[key]) {
			// add the markers from the guide
			this.addGuide();
		// otherwise
		} else {
			// load the guide's JSON first
			var guideXhr = new XMLHttpRequest();
			guideXhr.addEventListener('load', this.onGuideLoaded.bind(this));
			guideXhr.open('GET', this.config.guideUrl.replace('{key}', this.config.key), true);
			guideXhr.send();
		}
	};

  this.stop = function() {
    // TODO: remove the elements
  };

	this.update = function() {
		// defer redraw until idle
		if (this.config.position.zoom !== this.zoom) {
			clearTimeout(this.delay);
			this.delay = setTimeout(this.redraw.bind(this), 100);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		// redraw the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale(' + scale + ')'
		}
	};

	this.addGuide = function() {
		var config = this.config;
		var key = this.config.key;
		var guideData = this.config.guideData[key];
		// store the key
		config.alias = (guideData.alias) ? guideData.alias.key : guideData.key;
		// store the interpolation limits
		var min = config.minimum;
		var max = config.maximum;
		min.lon = (guideData.alias) ? guideData.alias.bounds.west : guideData.bounds.west;
		min.lat = (guideData.alias) ? guideData.alias.bounds.north : guideData.bounds.north;
		max.lon = (guideData.alias) ? guideData.alias.bounds.east : guideData.bounds.east;
		max.lat = (guideData.alias) ? guideData.alias.bounds.south : guideData.bounds.south;
    // store the coverage limits
		min.lon_cover = guideData.bounds.west;
		min.lat_cover = guideData.bounds.north;
		max.lon_cover = guideData.bounds.east;
		max.lat_cover = guideData.bounds.south;
		// assume an initial position
		var pos = config.position;
		pos.lon = (max.lon_cover - min.lon_cover) / 2 + min.lon_cover;
		pos.lat = (max.lat_cover - min.lat_cover) / 2 + min.lat_cover;
		// position every marker in the guide
		guideData.markers.map(this.addMarker.bind(this));
		// resolve completion
		onComplete();
	};

	this.addMarker = function(markerData) {
		// add either a landmark or a waypoint to the map
		markerData.element = (markerData.photo) ? this.addLandmark(markerData) : this.addWaypoint(markerData);
		markerData.element.addEventListener('click', onClicked.bind(this, markerData));
		this.parent.element.appendChild(markerData.element);
		this.elements.push(markerData.element);
	}

	this.addLandmark = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = document.createElement('span');
		element.setAttribute('class', 'localmap-waypoint');
		element.style.left = ((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		element.style.cursor = 'pointer';
		return element;
	};

	this.addWaypoint = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = new Image();
		element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		element.setAttribute('title', markerData.description || '');
		element.setAttribute('class', 'localmap-marker');
		element.style.left = ((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		element.style.cursor = (markerData.description || markerData.callback) ? 'pointer' : null;
		return element;
	};

	// EVENTS

	this.onGuideLoaded = function(evt) {
		// decode the guide data
		this.config.guideData = this.config.guideData || {};
		this.config.guideData[this.config.key] = JSON.parse(evt.target.response);
		// add the markers from the guide
		this.addGuide();
	};

	this.start();

};
